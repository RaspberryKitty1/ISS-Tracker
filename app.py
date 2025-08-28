from flask import Flask, render_template, jsonify
import requests
import math

app = Flask(__name__)

# Store last known ISS position
last_known = {
    "lat": 0.0,
    "lon": 0.0,
    "timestamp": None,
    "location": "Unknown"
}

# Cache for reverse geocoding
location_cache = {}

# Define grid precision for caching (e.g., 1 decimal ~11 km)
GRID_PRECISION = 1

@app.route("/")
def index():
    return render_template("map.html")

def round_grid(lat, lon, precision=GRID_PRECISION):
    """Round lat/lon to the grid precision for caching."""
    return (round(lat, precision), round(lon, precision))

def reverse_geocode(lat, lon):
    """Get human-readable location using Nominatim with caching."""
    key = round_grid(lat, lon)
    if key in location_cache:
        return location_cache[key]

    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": lat, "lon": lon, "format": "json"}
        headers = {"User-Agent": "ISS-Tracker-App  https://github.com/RaspberryKitty1/ISS-Tracker"}
        r = requests.get(url, params=params, headers=headers, timeout=5)
        r.raise_for_status()
        data = r.json()
        address = data.get("address", {})

        if "city" in address:
            location = f"{address['city']}, {address.get('country', '')}"
        elif "state" in address:
            location = f"{address['state']}, {address.get('country', '')}"
        elif "country" in address:
            location = address["country"]
        else:
            location = "Over the ocean"

        # Cache the result
        location_cache[key] = location
        return location

    except Exception:
        return "Unknown"

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

        # Only call reverse geocode when moving into a new grid cell
        location = reverse_geocode(lat, lon)

        # Update last known coordinates
        last_known.update({"lat": lat, "lon": lon, "timestamp": timestamp, "location": location})

        print(f"[ISS] Latitude: {lat}, Longitude: {lon}, Timestamp: {timestamp}, Location: {location}")

        return jsonify({"lat": lat, "lon": lon, "timestamp": timestamp, "location": location})

    except requests.exceptions.RequestException as e:
        print(f"[ISS] API request failed: {e}")
        return jsonify({
            "lat": last_known["lat"],
            "lon": last_known["lon"],
            "timestamp": last_known["timestamp"],
            "location": last_known.get("location", "Unknown"),
            "error": str(e)
        }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
