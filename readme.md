# 🛰 ISS Live Tracker

A real-time tracker for the **International Space Station (ISS)** built with **Flask** and **Leaflet.js**.  
This web app displays the ISS's current position on an interactive map, updating every 5 seconds, and provides UTC/local timestamps along with a human-readable location (e.g., "New York, USA" or "Over the Atlantic Ocean").

---

## ✨ Features

- 🌐 Live ISS position tracking using the [Open Notify API](http://open-notify.org/).  
- 🗺 Displays approximate location above Earth using **OpenStreetMap / Nominatim** reverse geocoding.  
- 🌊 Detects when the ISS is over a specific **ocean or sea** (e.g., Atlantic Ocean, Mediterranean Sea).  
- 🚀 Smooth animation of ISS movement on a world map with a glowing icon.  
- 📍 Shows the ISS **trail path** for the last ~50 positions.  
- 🔄 **Follow toggle**: optionally auto-center the map on the ISS as it moves.  
- ⏱ Shows last update time in both UTC and local time.  
- 📱 Responsive design that works on desktop and mobile.  
- 🖼 Local ISS icon included for faster loading and offline support.  
- 🛡 Nominatim requests are **cached** to avoid repeated lookups for the same coordinates.

---

## 🎬 Demo


<img width="1266" height="907" alt="image" src="https://github.com/user-attachments/assets/e0b59567-06cb-47b4-90ef-29f362509ce2" />

---

## 🛠 Requirements

- 🐍 Python 3.7+  
- Flask  
- requests  

Install dependencies:

```bash
pip install -r requirements.txt
````

---

## ▶️ Setup & Running the App

1. Clone this repository:

```bash
git clone https://github.com/RaspberryKitty1/ISS-Tracker
cd ISS-Tracker
```

2. Install dependencies and download Leaflet files:

### Linux / macOS

```bash
pip install -r requirements.txt

# Download Leaflet dist files
curl -L https://unpkg.com/leaflet@1.9.4/dist/leaflet.css -o static/css/leaflet.css
curl -L https://unpkg.com/leaflet@1.9.4/dist/leaflet.js   -o static/js/leaflet.js
```

### Windows (PowerShell)

```powershell
pip install -r requirements.txt

# Download Leaflet dist files
Invoke-WebRequest -Uri "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" -OutFile "static/css/leaflet.css"
Invoke-WebRequest -Uri "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" -OutFile "static/js/leaflet.js"
```

3. Generate the **ocean/sea grid** (first-time setup only):

```bash
python "Generate Ocean Data.py"
```

This creates:

```
static/data/iss_ocean_grid.json
```

> You only need to do this once unless you want to regenerate the ocean/sea data.

4. Start the Flask server:

```bash
python app.py
```

5. Open your browser and go to:

```text
http://localhost:5000
```

You should see the ISS live on the map with its approximate location displayed.

---

## 📝 Notes

- The app fetches ISS data every 5 seconds and animates the marker smoothly.

- Reverse geocoding via Nominatim is **cached** for repeated positions to comply with usage limits (≤1 request/sec).

  - Only new coordinates trigger a reverse geocode request; repeated coordinates return the cached value immediately.

- Ocean/sea names come from a **pre-generated grid** (`iss_ocean_grid.json`), ensuring more accurate water location labeling.

- If the Open Notify API fails, the app continues to display the **last known position**.

- The ISS marker uses a **glow effect** and shows a **trail path** for better visualization.

- You can toggle **Follow ISS** to auto-center the map or pan manually.

- Using local Leaflet files and ISS icon improves performance and allows partial offline use, but live tracking and map tiles still require an internet connection.

- **Leaflet in `map.html`** should use local files:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/leaflet.css') }}">
<script src="{{ url_for('static', filename='js/leaflet.js') }}"></script>
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
```

- **Ocean/Sea Detection**: The `Generate Ocean Data.py` script builds a latitude/longitude lookup grid that maps ISS positions to major bodies of water, including:

  - Pacific Ocean
  - Atlantic Ocean
  - Indian Ocean
  - Southern Ocean
  - Arctic Ocean
  - Baltic Sea
  - Caribbean Sea
  - Mediterranean Sea

> \[!NOTE]
> ⚠️ The ISS is expected to be deorbited around 2030. After that, this app will no longer track the ISS and can be adapted for other satellites or spacecraft.

---

## 📜 License

Licensed under the MIT License.
See the LICENSE file for details.
