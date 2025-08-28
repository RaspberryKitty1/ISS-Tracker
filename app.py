from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

# Store last known ISS position
last_known = {
    "lat": 0.0,
    "lon": 0.0,
    "timestamp": None
}

@app.route("/")
def index():
    return render_template("map.html")

@app.route("/iss")
def iss_position():
    global last_known
    try:
        # Fetch current ISS position
        resp = requests.get("http://api.open-notify.org/iss-now.json", timeout=5)
        resp.raise_for_status()
        iss_data = resp.json()

        lat = float(iss_data["iss_position"]["latitude"])
        lon = float(iss_data["iss_position"]["longitude"])
        timestamp = iss_data["timestamp"]

        # Update last known coordinates
        last_known.update({"lat": lat, "lon": lon, "timestamp": timestamp})

        # Print coordinates to console
        print(f"[ISS] Latitude: {lat}, Longitude: {lon}, Timestamp: {timestamp}")

        return jsonify({"lat": lat, "lon": lon, "timestamp": timestamp})

    except requests.exceptions.RequestException as e:
        # API failed → return last known coordinates and print error
        print(f"[ISS] API request failed: {e}")
        print(f"[ISS] Using last known coordinates: Lat={last_known['lat']}, Lon={last_known['lon']}")
        return jsonify({
            "lat": last_known["lat"],
            "lon": last_known["lon"],
            "timestamp": last_known["timestamp"],
            "error": str(e)
        }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
