const imagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  }
);

const streets = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }
);

const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenTopoMap contributors",
  maxZoom: 17,
});

const darkSmooth = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  {
    attribution: "© Stadia Maps, © OpenStreetMap contributors",
    maxZoom: 20,
  }
);

const darkMatter = L.tileLayer(
  "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
  {
    attribution: "© Carto, © OpenStreetMap contributors",
    subdomains: "abcd",
    maxZoom: 19,
  }
);

const map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  layers: [imagery],
});

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

const baseMaps = {
  Imagery: imagery,
  Streets: streets,
  Topographic: topo,
  "Dark (Smooth)": darkSmooth,
  "Dark (Matter)": darkMatter,
};

L.control.layers(baseMaps).addTo(map);
