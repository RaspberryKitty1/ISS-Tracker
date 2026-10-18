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

const darkMatter = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png",
  {
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20
  }
);

const map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  layers: [imagery],
});

// Force real-time Day/Night layer permanently on the map
const dayNightLayer = L.dayNightLayer({
  time: null // null ensures it actively tracks the real-world clock
}).addTo(map);

// Force real-time NASA City Lights layer permanently on top
const cityLightsLayer = L.nightLightsLayer(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
  {
    attribution: 'City lights: NASA Earth Observatory',
    maxNativeZoom: 8,
    maxZoom: 9,
    opacity: 0.9,
    time: null // ensures real-time clock tracking
  }
).addTo(map);

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
  "Toner Dark": darkMatter,
};

// Only control base maps now; day/night and city lights are forced on
L.control.layers(baseMaps).addTo(map);