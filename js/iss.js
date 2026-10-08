window.prevLat = 0;
window.prevLon = 0;
window.nextLat = 0;
window.nextLon = 0;
window.prevTimestamp = Date.now();
window.nextTimestamp = Date.now() + 5000;
window.lastKnown = { lat: 0, lon: 0, timestamp: null, location: "Unknown" };

let currentUnits = "kmh"; 
let lastVelocity = 0;

const formatUTC = (ts) => new Date(ts * 1000).toUTCString();
const formatLocal = (ts) => new Date(ts * 1000).toLocaleString();

const kmhToMph = (kmh) => kmh * 0.621371;
const formatSpeed = (velocity, units = "kmh") => {
  if (units === "mph") {
    return `${Math.round(kmhToMph(velocity)).toLocaleString()} mph`;
  }
  return `${Math.round(velocity).toLocaleString()} km/h`;
};

async function fetchISS() {
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    const lat = data.latitude;
    const lon = data.longitude;
    const ts = data.timestamp;
    const velocity = data.velocity;

    lastVelocity = velocity;

    window.prevLat = window.nextLat;
    window.prevLon = window.nextLon;
    window.prevTimestamp = Date.now();
    window.nextLat = lat;
    window.nextLon = lon;
    window.nextTimestamp = window.prevTimestamp + 5000;
    window.lastKnown = { lat, lon, timestamp: ts };

    if (typeof addToTrail === "function") {
      addToTrail(lat, lon);
    }

    document.getElementById("last-update").textContent =
      "Last update (UTC): " + formatUTC(ts);
    document.getElementById("local-time").textContent =
      "Local time: " + formatLocal(ts);

    const posEl = document.getElementById("iss-position");
    if (posEl) {
      posEl.textContent = `Position: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    }

    const altEl = document.getElementById("iss-altitude");
    if (altEl) {
      altEl.textContent = `Altitude: ${Math.round(data.altitude)} km`;
    }

    const speedEl = document.getElementById("iss-speed");
    if (speedEl) {
      speedEl.textContent = "Speed: " + formatSpeed(velocity, currentUnits);
    }

    const location = await reverseGeocode(lat, lon);
    document.getElementById("iss-location").textContent =
      "Location: " + location;
    window.lastKnown.location = location;

    console.log(
      "%c[ISS Update - WTIA]\n" +
        "%cLatitude: %c" + lat + "\n" +
        "%cLongitude: %c" + lon + "\n" +
        "%cAltitude: %c" + Math.round(data.altitude) + " km\n" +
        "%cSpeed: %c" + formatSpeed(velocity, currentUnits) + "\n" +
        "%cTimestamp: %c" + ts + "\n" +
        "%cLocation: %c" + location,
      "color: #00bfff; font-weight: bold;",
      "color: inherit;", "color: #32cd32; font-weight: bold;",
      "color: inherit;", "color: #32cd32; font-weight: bold;",
      "color: inherit;", "color: #00ffff; font-weight: bold;",
      "color: inherit;", "color: #00ffff; font-weight: bold;",
      "color: inherit;", "color: #ffa500; font-weight: bold;",
      "color: inherit;", "color: #ff4500; font-weight: bold;"
    );
  } catch (e) {
    console.error("ISS fetch failed:", e);
  }
}

// Function to switch units dynamically without triggering a re-fetch
function setSpeedUnits(unit) {
  currentUnits = unit;
  const speedEl = document.getElementById("iss-speed");
  if (speedEl && lastVelocity) {
    speedEl.textContent = "Speed: " + formatSpeed(lastVelocity, currentUnits);
  }
}