// Setup Leaflet map
const map = L.map("map").setView([0, 0], 2);
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
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
  iconUrl: "images/iss.svg",
  iconSize: [70, 70],
  className: "iss-icon-glow",
});

const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);
