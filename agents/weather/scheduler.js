// Weather Scheduler: logs weather every 3 hours and on GPS change (20 min settle)
// This is a Node.js/JS script for demonstration; adapt as needed for your stack

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const USER_ID = process.env.USER_ID || 'demo_user';
const WEATHER_AGENT_URL = process.env.WEATHER_AGENT_URL || 'http://localhost:8000/weather/log';
const LOCATION_FILE = path.join(__dirname, 'last_location.json');

let lastPosition = null;
let lastLoggedTime = 0;
let settleTimeout = null;

function distance(pos1, pos2) {
  // Haversine formula for distance in km
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lon - pos1.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function logWeatherAtPosition(pos) {
  fetch(WEATHER_AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: USER_ID,
      lat: pos.lat,
      lon: pos.lon,
      // temperature/humidity will be fetched by agent
      timestamp: new Date().toISOString(),
    })
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Weather logged:', data);
      lastLoggedTime = Date.now();
      lastPosition = pos;
      fs.writeFileSync(LOCATION_FILE, JSON.stringify(pos));
    })
    .catch(console.error);
}

function onPositionUpdate(newPos) {
  if (!lastPosition || distance(lastPosition, newPos) > 0.1) {
    if (settleTimeout) clearTimeout(settleTimeout);
    settleTimeout = setTimeout(() => {
      logWeatherAtPosition(newPos);
    }, 20 * 60 * 1000); // 20 minutes
  }
}

function getCurrentPosition() {
  // Replace this with actual GPS polling logic
  // For demo: read from LOCATION_FILE or use a fixed position
  if (fs.existsSync(LOCATION_FILE)) {
    return JSON.parse(fs.readFileSync(LOCATION_FILE));
  }
  return { lat: 51.5074, lon: -0.1278 }; // Default: London
}

// Log weather every 3 hours
setInterval(() => {
  const pos = getCurrentPosition();
  logWeatherAtPosition(pos);
}, 3 * 60 * 60 * 1000);

// Simulate GPS polling every minute
setInterval(() => {
  const pos = getCurrentPosition();
  onPositionUpdate(pos);
}, 60 * 1000);

// Initial log on startup
logWeatherAtPosition(getCurrentPosition());
