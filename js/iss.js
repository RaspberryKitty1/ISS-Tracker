const formatUTC = (ts) => new Date(ts * 1000).toUTCString();
const formatLocal = (ts) => new Date(ts * 1000).toLocaleString();

let prevLat = 0,
  prevLon = 0,
  nextLat = 0,
  nextLon = 0;
let prevTimestamp = Date.now(),
  nextTimestamp = Date.now() + 5000;
let lastKnown = { lat: 0, lon: 0, timestamp: null, location: "Unknown" };

async function fetchISS() {
  try {
    const res = await fetch("/iss-api/");
    const data = await res.json();

    const lat = parseFloat(data.iss_position.latitude);
    const lon = parseFloat(data.iss_position.longitude);
    const ts = data.timestamp;

    prevLat = nextLat;
    prevLon = nextLon;
    prevTimestamp = Date.now();
    nextLat = lat;
    nextLon = lon;
    nextTimestamp = prevTimestamp + 5000;
    lastKnown = { lat, lon, timestamp: ts };

    addToTrail(lat, lon);

    document.getElementById("last-update").textContent =
      "Last update (UTC): " + formatUTC(ts);
    document.getElementById("local-time").textContent =
      "Local time: " + formatLocal(ts);

    const location = await reverseGeocode(lat, lon);
    document.getElementById("iss-location").textContent =
      "Location: " + location;
    lastKnown.location = location;

    // ✅ console.log now works
    console.log(
      "%c[ISS Update]\n" +
        "%cLatitude: %c" +
        lat +
        "\n" +
        "%cLongitude: %c" +
        lon +
        "\n" +
        "%cTimestamp: %c" +
        ts +
        "\n" +
        "%cLocation: %c" +
        location,
      "color: #00bfff; font-weight: bold;",
      "color: inherit;", 
      "color: #32cd32; font-weight: bold;",
      "color: inherit;", 
      "color: #ffa500; font-weight: bold;",
      "color: inherit;", 
      "color: #9370db; font-weight: bold;", 
      "color: inherit;",
      "color: #ff4500; font-weight: bold;" 
    );
  } catch (e) {
    console.error("ISS fetch failed:", e);
  }
}

