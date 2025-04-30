import requests
from datetime import datetime
from .weather_logger import log_weather

OPENWEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"

def get_current_weather(lat, lon):
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    )
    resp = requests.get(url)
    data = resp.json()
    return {
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

def log_current_weather(user_id, lat, lon):
    weather = get_current_weather(lat, lon)
    log_weather(user_id, lat, lon, weather["temperature"], weather["humidity"], weather["timestamp"])
    return weather
