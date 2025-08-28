# 🛰 ISS Live Tracker

A real-time tracker for the **International Space Station (ISS)** built with **Flask** and **Leaflet.js**. This web app displays the ISS's current position on an interactive map, updating every 5 seconds, and provides UTC/local timestamps along with a human-readable location (e.g., "New York, USA" or "Over the ocean").

---

## ✨ Features

- 🌐 Live ISS position tracking using the [Open Notify API](http://open-notify.org/).  
- 🗺 Displays approximate location above Earth using **OpenStreetMap / Nominatim** reverse geocoding.  
- 🚀 Smooth animation of ISS movement on a world map with a glowing icon.  
- 📍 Shows the ISS **trail path** for the last ~50 positions.  
- 🔄 **Follow toggle**: optionally auto-center the map on the ISS as it moves.  
- ⏱ Shows last update time in both UTC and local time.  
- 📱 Responsive design that works on desktop and mobile.  
- 🖼 Local ISS icon included for faster loading and offline support.  
- 🛡 Nominatim requests are **cached** to avoid repeated lookups for the same coordinates, complying with usage limits.

---

## 🎬 Demo

![ISS Live Tracker Screenshot](screenshot.png)  
*Replace `screenshot.png` with an actual screenshot of your app if desired.*

---

## 🛠 Requirements

- 🐍 Python 3.7+  
- Flask  
- requests  

Install dependencies using:

```bash
pip install -r requirements.txt
````

---

## ▶️ Running the App

1. Clone this repository:

```bash
git clone <your-repo-url>
cd <repository-folder>
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the Flask server:

```bash
python app.py
```

4. Open your browser and go to:

```bash
http://localhost:5000
```

You should see the ISS live on the map with its approximate location displayed.

---

## 📝 Notes

- The app fetches ISS data every 5 seconds and animates the marker smoothly.  
- Reverse geocoding via Nominatim is **cached** for repeated positions to comply with usage limits (≤1 request per second).  
  - **How caching works:** When the ISS moves to a new latitude/longitude, the app first checks if this coordinate has already been reverse-geocoded. If yes, it returns the cached location immediately without querying Nominatim again. Only new coordinates trigger a reverse geocode request, greatly reducing API calls.  
  - **5-second interval vs API limits:** Even though the app requests ISS positions every 5 seconds (≈0.2 requests/sec), **Nominatim reverse geocoding only occurs for new coordinates**. Because the ISS moves relatively slowly, many positions map to the same cached location. This ensures that the Nominatim request rate stays well below the 1 request/sec limit.  
- If the Open Notify API fails, the app will continue to display the **last known position**.  
- The ISS marker uses a **glow effect** and shows a **trail path** for better visualization.  
- You can toggle **Follow ISS** to auto-center the map or pan manually.  
- Using a local ISS icon improves performance, but note that live tracking and map tiles still require an internet connection.

> [!NOTE]
>
> ⚠️ The ISS is expected to be deorbited around 2030. After that, this app will no longer track the ISS and can be adapted for other satellites or spacecraft.

---

## 📜 License

Licensed under the MIT License.
See the LICENSE file for details.
