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
    const res = await fetch(`https://api.wheretheiss.at/v1/coordinates/${lat},${lon}`);
    if (!res.ok) throw new Error("WTIA lookup failed");
    const data = await res.json();

    if (data.country_code && data.country_code !== "??") {
      return `${data.country_code} — ${data.timezone_id}`;
    }
  } catch (e) {
    console.warn("WTIA geocode failed:", e);
  }

  return lookupOceanGrid(lat, lon);
}

