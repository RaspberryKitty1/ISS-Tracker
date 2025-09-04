# 🛰 ISS Live Tracker

A **static web app** that shows the real-time position of the **International Space Station (ISS)** using **Leaflet.js**.
The ISS location is updated every 5 seconds from the [Open Notify API](http://open-notify.org/), and smoothly animated on an interactive world map.

Optionally, you can generate an **ocean/sea grid file** to display when the ISS is flying over specific oceans or seas.

---

## ✨ Features

* 🌐 **Live ISS position** updated every 5 seconds.
* 🚀 Smooth animation of the ISS across the globe.
* 🖼 Custom glowing ISS SVG icon.
* 📍 Trail path shows the last \~50 positions.
* 🔄 Toggle **Follow ISS** mode (auto-center vs manual pan/zoom).
* ⏱ Displays both UTC and local time of last update.
* 📱 Fully responsive — works on desktop and mobile.
* 🌊 *(Optional)* Detects when the ISS is over a specific **ocean or sea**.

---

## 🎬 Demo

<img width="1266" height="907" alt="screenshot" src="https://github.com/user-attachments/assets/e0b59567-06cb-47b4-90ef-29f362509ce2" />

---

## 📦 Quick Start

1. Clone or download the repository:

```bash
git clone https://github.com/RaspberryKitty1/ISS-Tracker
cd ISS-Tracker
```

2. Open `index.html` in a browser.

> ⚠️ **Important:** To fully support the optional `data/iss_ocean_grid.json` file (and avoid browser security restrictions), the site must be served via a **static web server**. Some options:
>
> * GitHub Pages: [https://pages.github.com/](https://pages.github.com/)
> * Netlify: [https://www.netlify.com/](https://www.netlify.com/)
> * Vercel: [https://vercel.com/](https://vercel.com/)
> * Local server: `python -m http.server`, `npx serve`, etc.

---

## 🌊 Optional: Ocean / Sea Detection

By default, the app shows `"Land"` or `"Unknown"` when not near a city/country.
You can enrich this by generating a **grid lookup file** that maps coordinates to major oceans/seas.

### Requirements

* 🐍 Python 3.7+
* `requests`

Install:

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
* Map tiles are provided by **Esri Satellite Imagery**.
* The app works entirely as a **static site** — no backend required.
* Internet is required for ISS data + map tiles.
* The ISS is expected to deorbit around **2030** — afterwards the app can track other satellites.

---

## 📁 Project Structure

```plaintext
.
├── css/
│   └── style.css
├── data/
│   └── iss_ocean_grid.json
├── Generate Ocean Data.py
├── images/
│   └── iss.svg
├── index.html
├── js/
│   ├── animate.js
│   ├── controls.js
│   ├── geocode.js
│   ├── iss.js
│   ├── main.js
│   ├── map.js
│   └── trail.js
├── LICENSE
└── readme.md
```

---

## 📜 License

Licensed under the MIT License.
See [LICENSE](LICENSE) for details.


