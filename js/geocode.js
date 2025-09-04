let oceanGrid = {};
fetch("data/iss_ocean_grid.json")
  .then(res => res.json())
  .then(data => (oceanGrid = data));

function lookupOceanGrid(lat, lon) {
  const key = `${Math.round(lat)},${Math.round(lon)}`;
  return oceanGrid[key] || "Over ocean/land (unknown)";
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const res = await fetch(url, { headers: { "User-Agent": "ISS-Tracker-Static" } });
    const data = await res.json();

    if (data.address) {
      if (data.address.city) return `${data.address.city}, ${data.address.country || ""}`;
      if (data.address.state) return `${data.address.state}, ${data.address.country || ""}`;
      if (data.address.country) return data.address.country;
    }
  } catch (e) {
    console.warn("Reverse geocode failed:", e);
  }
  return lookupOceanGrid(lat, lon);
}
