const map = L.map("map").setView([0, 0], 2);
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  }
).addTo(map);

// ISS marker + halo
const halo = L.circleMarker([0, 0], {
  radius: 28,
  color: "cyan",
  opacity: 0.6,
  fillOpacity: 0.15,
  weight: 2,
}).addTo(map);
const issIcon = L.icon({
  iconUrl: "/static/images/iss.svg",
  iconSize: [70, 70],
  className: "iss-icon-glow",
});
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Trail management
let trailSegments = [];
const maxTrail = 50; // maximum total points

function addToTrail(lat, lon) {
  const newLatLng = L.latLng(lat, lon);

  if (trailSegments.length > 0) {
    const lastSegment = trailSegments[trailSegments.length - 1];
    const last = lastSegment.getLatLngs()[lastSegment.getLatLngs().length - 1];

    let deltaLon = Math.abs(lon - last.lng);
    if (deltaLon > 180) deltaLon = 360 - deltaLon;

    // Start a new segment if wrap-around
    if (deltaLon > 180) {
      const newSegment = L.polyline([newLatLng], { color: "cyan", weight: 2, opacity: 0.7 }).addTo(map);
      trailSegments.push(newSegment);
    } else {
      lastSegment.addLatLng(newLatLng);
    }
  } else {
    trailSegments.push(L.polyline([newLatLng], { color: "cyan", weight: 2, opacity: 0.7 }).addTo(map));
  }

  // Trim points to maxTrail
  let totalPoints = trailSegments.reduce((sum, seg) => sum + seg.getLatLngs().length, 0);
  while (totalPoints > maxTrail) {
    const firstSegment = trailSegments[0];
    const points = firstSegment.getLatLngs();
    const excess = totalPoints - maxTrail;

    if (points.length <= excess) {
      map.removeLayer(firstSegment);
      trailSegments.shift();
      totalPoints -= points.length;
    } else {
      firstSegment.setLatLngs(points.slice(excess));
      totalPoints -= excess;
    }
  }
}

// Follow toggle
let followISS = true;
document.getElementById("follow-btn").onclick = () => {
  followISS = !followISS;
  document.getElementById("follow-btn").textContent = `Follow ISS: ${followISS ? "ON" : "OFF"}`;
};

// Time helpers
const formatUTC = (ts) => new Date(ts * 1000).toUTCString();
const formatLocal = (ts) => new Date(ts * 1000).toLocaleString();

// Interpolation
let prevLat = 0, prevLon = 0, nextLat = 0, nextLon = 0;
let prevTimestamp = Date.now(), nextTimestamp = Date.now() + 5000;
let lastKnown = { lat: 0, lon: 0, timestamp: null };

async function fetchISS() {
  try {
    const res = await fetch("/iss");
    const data = await res.json();
    if (data.lat !== null && data.lon !== null) {
      prevLat = nextLat;
      prevLon = nextLon;
      prevTimestamp = Date.now();
      nextLat = data.lat;
      nextLon = data.lon;
      nextTimestamp = prevTimestamp + 5000;
      lastKnown = data;

      addToTrail(data.lat, data.lon);
    }

    document.getElementById("last-update").textContent =
      "Last update (UTC): " + (data.timestamp ? formatUTC(data.timestamp) : "N/A");
    document.getElementById("local-time").textContent =
      "Local time: " + (data.timestamp ? formatLocal(data.timestamp) : "N/A");
    document.getElementById("iss-location").textContent =
      "Location: " + (data.location || "Unknown");
  } catch (e) {
    prevLat = lastKnown.lat;
    prevLon = lastKnown.lon;
    nextLat = lastKnown.lat;
    nextLon = lastKnown.lon;
    prevTimestamp = Date.now();
    nextTimestamp = prevTimestamp + 5000;
  }
}

function animate() {
  const now = Date.now();
  let t = (now - prevTimestamp) / (nextTimestamp - prevTimestamp);
  t = Math.min(Math.max(t, 0), 1);

  // Handle longitude wrapping for interpolation
  let deltaLon = nextLon - prevLon;
  if (deltaLon > 180) deltaLon -= 360;
  if (deltaLon < -180) deltaLon += 360;
  const lat = prevLat + (nextLat - prevLat) * t;
  const lon = prevLon + deltaLon * t;

  marker.setLatLng([lat, lon]);
  halo.setLatLng([lat, lon]);
  if (followISS) map.setView([lat, lon], map.getZoom(), { animate: false });

  requestAnimationFrame(animate);
}

// Start
animate();
fetchISS();
setInterval(fetchISS, 5000);
