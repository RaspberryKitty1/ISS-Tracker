# 🛰 ISS Live Tracker

A real-time tracker for the **International Space Station (ISS)** built with **Flask** and **Leaflet.js**. This web app displays the ISS's current position on an interactive map, updating every 5 seconds, and provides both UTC and local timestamps.

---

## ✨ Features

- 🌐 Live ISS position tracking using the [Open Notify API](http://open-notify.org/).  
- 🚀 Smooth animation of ISS movement on a world map with a glowing icon.  
- ⏱ Displays last update time in both UTC and local time.  
- 📱 Responsive design that works on desktop and mobile.  
- 🖼 Local ISS icon included for faster loading and offline support.

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
```


---

▶️ Running the App

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

You should see the ISS live on the map.


---

📂 Project Structure

```plaintext 
├── app.py                     # Flask application
├── requirements.txt           # Python dependencies
├── templates/
│   └── map.html               # HTML template for the tracker
├── static/
│   └── images/
│       └── iss.svg            # Local ISS icon
└── README.md                  # Project documentation
```

---

📝 Notes

* The app fetches ISS data every 5 seconds and animates the marker smoothly on the map.

* If the API request fails, the app will continue to display the last known position.

* The ISS icon uses a glow effect to make it more visible on the map.

* Using a local ISS icon improves performance and ensures offline availability.

* ⚠️ Note: The ISS is expected to be deorbited around 2030, so this tracker will only work while it remains in orbit. After that, the app could be adapted for other satellites or spacecraft.



---

📜 License

Licensed under the MIT License.
See the LICENSE file for details.
