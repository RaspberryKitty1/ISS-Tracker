# 🛰 ISS Live Tracker

A **static web app** that shows the real-time position of the **International Space Station (ISS)** using **Leaflet.js**.  
The ISS location is updated every 5 seconds from the [wheretheiss](http://wheretheiss.at/) and smoothly animated on an interactive world map with starfield and shooting star effects.

Optionally, you can generate an **ocean/sea grid file** to display when the ISS is flying over specific oceans or seas.

---

## ✨ Features

* 🌐 **Live ISS position** updated every 5 seconds.
* 🚀 Smooth animation of the ISS across the globe.
* 🖼 Custom glowing ISS SVG icon.
* 📍 Trail path shows the last ~50 positions.
* 🔄 Toggle **Follow ISS** mode (auto-center vs manual pan/zoom).
* ⏱ Displays both UTC and local time of last update.
* ⭐ Animated starfield with nebula layers.
* 🌠 Random shooting stars appear in the background.
* 📱 Fully responsive — works on desktop and mobile.
* 🌊 *(Optional)* Detects when the ISS is over a specific **ocean or sea**.

---

## 🎬 Demo

<img width="1919" height="955" alt="Screenshot from 2025-09-05 12-34-05" src="https://github.com/user-attachments/assets/5c7b4cdc-025a-4119-8f2a-b6bc7c35f79d" />

---

## 📦 Quick Start

1. Clone or download the repository:

```bash
git clone https://github.com/RaspberryKitty1/ISS-Tracker
cd ISS-Tracker
````

2. Open `index.html` in a browser.

> [!IMPORTANT]
>
> To fully support the optional `data/iss_ocean_grid.json` file (and avoid browser security restrictions), the site must be served via a **static web server**. Some options:
>
>* [**GitHub Pages**](https://pages.github.com/) – Free static hosting directly from your repo
>* [**Netlify**](https://www.netlify.com/) – Free hosting with easy drag-and-drop deploy
>* [**Vercel**](https://vercel.com/) – Another popular free static host
>* **Local servers**:
>   * `python -m http.server` (built-in Python)
>   * [`npm serve`](https://www.npmjs.com/package/serve) (Node.js)
>* **Self-hosted**:
>   * [**Nginx**](https://nginx.org/) – High-performance static server for personal or production use
>   * [**Apache**](https://www.apache.org/) – Widely-used traditional web server
>   * Any other static web server that can serve HTML/CSS/JS files

---

## 🌊 Optional: Ocean / Sea Detection

By default, the app shows `"Land"` or `"Unknown"` when not near a city/country.
You can enrich this by generating a **grid lookup file** that maps coordinates to major oceans/seas.

### Requirements

* 🐍 Python 3.7+

Install dependencies:

```bash
pip install requests
```

### Generate grid

```bash
python "Generate Ocean Data.py"
```

This creates:

```plaintext
data/iss_ocean_grid.json
```

Once present, the map will display labels like **Atlantic Ocean**, **Mediterranean Sea**, etc.

> ℹ️ Browsers cannot read local JSON files via `file://`. You must serve the site using a static host or local web server to use this feature.

---

## 📝 Notes

* ISS data comes from **[Open Notify](http://open-notify.org/)**, updated every 5 seconds.
* Map tiles are provided by **Esri Satellite Imagery**, **OpenStreetMap**, **Stadia Maps**, and **Carto**.
* The app works entirely as a **static site** — no backend required.
* Internet is required for ISS data + map tiles.
* Smooth marker movement depends on the 5-second API update interval.
* Starfield and shooting stars are fully animated via `<canvas>`.

> [!NOTE]
>
> * The ISS is expected to deorbit around **2030** — after that, the app can be adapted to track other satellites.

---

## ❓ FAQ / Troubleshooting

**Q: ISS trail is not showing**

* Ensure your browser allows JS to run.
* The trail shows the last \~50 positions; reload the page if empty initially.

**Q: Ocean/sea labels not appearing**

* Make sure `data/iss_ocean_grid.json` exists.
* The site must be served via a **static web server** — local `file://` will not work.

**Q: Map tiles not loading**

* Check your internet connection.
* Map tiles are fetched live; temporary outages may prevent display.

**Q: ISS marker not moving smoothly**

* Confirm the page is not throttled by the browser.
* Smooth movement depends on the 5-second update from the Open Notify API.

---

## 📁 Project Structure

```plaintext
.
├── css/                     # All styling files
│   ├── animations.css       # Keyframe animations (glow, shooting stars)
│   ├── base.css             # Base styles (layout, fonts, colors)
│   ├── map.css              # Styles for Leaflet map and controls
│   ├── responsive.css       # Media queries for responsive layouts
│   └── ui.css               # Styles for info bar and buttons
├── data/                    # Generated or static data
│   └── iss_ocean_grid.json  # Optional grid mapping lat/lon to oceans/seas
├── Generate Ocean Data.py    # Python script to create the ocean grid JSON
├── images/
│   └── iss.svg              # Custom ISS icon
├── index.html               # Main HTML page with map and starfield canvas
├── js/                      # JavaScript logic
│   ├── animate.js           # Smoothly animates ISS movement and map following
│   ├── controls.js          # Handles Follow ISS toggle button
│   ├── geocode.js           # Reverse geocoding & ocean grid lookup
│   ├── iss.js               # Fetches ISS position, updates marker, trail, and info
│   ├── main.js              # Initializes animation and periodic ISS fetching
│   ├── map.js               # Sets up Leaflet map, base layers, halo, and marker
│   ├── starsfield.js        # Renders starfield, nebula, shooting stars animations on canvas
│   └── trail.js             # Manages the ISS trail path
├── LICENSE                  # MIT License
└── README.md                # Project documentation (this file)
```

---

## 📜 License

Licensed under the MIT License.
See [LICENSE](LICENSE) for details.
