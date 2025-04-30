import json
from pathlib import Path

LOG_PATH = Path("weather_logs.json")

def log_weather(user_id, lat, lon, temperature, humidity, timestamp):
    entry = {
        "user_id": user_id,
        "lat": lat,
        "lon": lon,
        "temperature": temperature,
        "humidity": humidity,
        "timestamp": timestamp
    }
    if LOG_PATH.exists():
        logs = json.loads(LOG_PATH.read_text())
    else:
        logs = []
    logs.append(entry)
    LOG_PATH.write_text(json.dumps(logs, indent=2))
