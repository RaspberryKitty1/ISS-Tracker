import json
import os

# Major oceans and some seas (lat/lon bounding boxes)
waters = [
    # --- Oceans ---
    {"name": "Pacific Ocean", "lat_min": -60, "lat_max": 60, "lon_min": 120, "lon_max": -70},  # wrap-around
    {"name": "Atlantic Ocean", "lat_min": -60, "lat_max": 70, "lon_min": -70, "lon_max": 20},
    {"name": "Indian Ocean", "lat_min": -50, "lat_max": 30, "lon_min": 20, "lon_max": 120},
    {"name": "Southern Ocean", "lat_min": -90, "lat_max": -60, "lon_min": -180, "lon_max": 180},
    {"name": "Arctic Ocean", "lat_min": 70, "lat_max": 90, "lon_min": -180, "lon_max": 180},

    # --- Europe / Mediterranean ---
    {"name": "Baltic Sea", "lat_min": 53, "lat_max": 66, "lon_min": 10, "lon_max": 30},
    {"name": "North Sea", "lat_min": 51, "lat_max": 61, "lon_min": -5, "lon_max": 9},
    {"name": "Mediterranean Sea", "lat_min": 30, "lat_max": 46, "lon_min": -6, "lon_max": 36},
    {"name": "Black Sea", "lat_min": 40, "lat_max": 47, "lon_min": 27, "lon_max": 42},
    {"name": "Caspian Sea", "lat_min": 36, "lat_max": 47, "lon_min": 47, "lon_max": 54},

    # --- Americas ---
    {"name": "Caribbean Sea", "lat_min": 9, "lat_max": 23, "lon_min": -90, "lon_max": -60},
    {"name": "Gulf of Mexico", "lat_min": 18, "lat_max": 30, "lon_min": -97, "lon_max": -81},
    {"name": "Hudson Bay", "lat_min": 51, "lat_max": 70, "lon_min": -95, "lon_max": -75},
    {"name": "Baffin Bay", "lat_min": 65, "lat_max": 77, "lon_min": -75, "lon_max": -55},

    # --- Asia / Middle East ---
    {"name": "Arabian Sea", "lat_min": 5, "lat_max": 25, "lon_min": 55, "lon_max": 75},
    {"name": "Bay of Bengal", "lat_min": 5, "lat_max": 22, "lon_min": 80, "lon_max": 100},
    {"name": "Persian Gulf", "lat_min": 24, "lat_max": 30, "lon_min": 48, "lon_max": 57},
    {"name": "Red Sea", "lat_min": 12, "lat_max": 30, "lon_min": 32, "lon_max": 44},
    {"name": "Sea of Japan", "lat_min": 34, "lat_max": 48, "lon_min": 129, "lon_max": 142},
    {"name": "East China Sea", "lat_min": 24, "lat_max": 33, "lon_min": 120, "lon_max": 131},
    {"name": "South China Sea", "lat_min": 3, "lat_max": 22, "lon_min": 105, "lon_max": 120},

    # --- Pacific Rim ---
    {"name": "Bering Sea", "lat_min": 52, "lat_max": 66, "lon_min": 160, "lon_max": -160},  # wrap-around
    {"name": "Sea of Okhotsk", "lat_min": 45, "lat_max": 60, "lon_min": 140, "lon_max": 160},
    {"name": "Philippine Sea", "lat_min": 5, "lat_max": 25, "lon_min": 125, "lon_max": 150},
    {"name": "Coral Sea", "lat_min": -25, "lat_max": -10, "lon_min": 145, "lon_max": 165},
    {"name": "Tasman Sea", "lat_min": -45, "lat_max": -30, "lon_min": 145, "lon_max": 170}
]


grid = {}
lat_range = range(-90, 91)   # Full latitude
lon_range = range(-180, 180) # Full longitude

for lat in lat_range:
    for lon in lon_range:
        found = False
        for water in waters:
            # Handle wrap-around longitude
            if water["lon_min"] <= water["lon_max"]:
                lon_check = water["lon_min"] <= lon <= water["lon_max"]
            else:
                lon_check = lon >= water["lon_min"] or lon <= water["lon_max"]

            if water["lat_min"] <= lat <= water["lat_max"] and lon_check:
                grid[f"{lat},{lon}"] = water["name"]
                found = True
                break

        if not found:
            grid[f"{lat},{lon}"] = "Land"  # Everything else is considered land

# Ensure directory exists
os.makedirs("./static/data", exist_ok=True)

# Save JSON
output_path = "./static/data/iss_ocean_grid.json"
with open(output_path, "w") as f:
    json.dump(grid, f)

print(f"✅ Ocean grid generated: {output_path}")
