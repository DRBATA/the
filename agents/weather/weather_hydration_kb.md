# Weather → Hydration Reference (Dubai Region)  
*Version 0.1 — 28 Apr 2025*

This table gives typical **sweat‑rate** and **electrolyte loss** per hour for a healthy, moderately active adult (~70 kg) at different combinations of **air temperature** and **relative humidity (RH)** common in Dubai.  Values scale upward with heavier work and may be ~30 % lower at complete rest.

| Weather Class | Air Temp (°C) | RH (%) | Sweat Rate (L / h) | Na Loss (mg / h) | K Loss (mg / h) |
|--------------|--------------|-------|-------------------|------------------|-----------------|
| **Cool** | ≤ 25 | ≤ 50 | 0.4 | 200 | 60 |
| **Warm** | 25‑34 | 40‑60 | 0.8 | 600 | 160 |
| **Hot** | 35‑40 | 30‑60 | 1.2 | 1 250 | 250 |
| **Extreme** | > 40 | ≥ 70 | 2.0 | 2 000 | 400 |

**Guidance snippets**  
* Cool → drink to thirst (~0.3–0.5 L / h); plain water OK.  
* Warm → 0.5–0.8 L / h + light electrolytes (≈0.5 g Na/L) for >1 h exposure.  
* Hot → 0.75–1 L / h; include sports drink (≈1 g Na/L).  
* Extreme → ≥ 1 L / h; high‑sodium ORS (0.5–1.5 g Na/L) + scheduled breaks.

---
### JSON Template
```json
{
  "weather_class": "Hot",
  "temperature_c": 38,
  "humidity_pct": 45,
  "sweat_rate_L_per_h": 1.2,
  "sodium_loss_mg_per_h": 1250,
  "potassium_loss_mg_per_h": 250
}
```

*Source ranges synthesized from ACSM heat‑stress guidelines, IOC consensus on sodium loss, and Gulf meteorological data (2018–2024).*  
Use this table as Retrieval context for weather‑aware hydration advice.
