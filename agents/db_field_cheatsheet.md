| Field | Cached? | Source/Formula | AI Guidance |
|-------|---------|---------------|-------------|
| hydration_logs.volume_ml | YES | Raw user input | Use as-is for drink logs |
| hydration_logs.hydration_multiplier | NO | Lookup in drink_catalogue table by drink_type | Use for adjusting ml for custom drinks |
| hydration_logs.weight_kg | NO | Latest body_composition_logs.weight_kg | Always fetch most recent for calculations |
| hydration_logs.osmole_score | (optional cache) | sugar_g + protein_g*10 + (sodium_mg/23) | Use for charts, hydration advice |
| food_logs.calories | YES | Nutrition API or USDA × serving_qty | Use for dashboard, gold-tests |
| food_logs.osmole_score | NO | sugar_g + protein_g*10 + (sodium_mg/23) | Compute on query, use for food impact |
| activity_logs.duration_min | YES | User fact | Use for sweat-rate, sodium loss |
| activity_logs.intensity | YES | User fact | Use for sweat-rate, sodium loss |
| activity_logs.sweat_rate_lh | NO | base_rate(activity,intensity) × weather_factor(temp,humidity) | Use for sodium_loss_mg |
| activity_logs.sodium_loss_mg | YES | sweat_rate_lh × Na_loss_per_L × duration_h | Use for coach tips, hydration advice |
| weather_logs.temperature | YES | External data snapshot | Use for sweat-rate, hydration plan |
| weather_logs.humidity | YES | External data snapshot | Use for sweat-rate, hydration plan |
| body_composition_logs.weight_kg | YES | Canonical | Always prefer for calculations |
| body_composition_logs.body_fat_pct | YES | Canonical | Always prefer for calculations |
| hydration_stats.percent_hydrated | GENERATED | (fluids_in_ml / fluids_need_ml) | Use for user status, advice |
| profiles.water_bottle_saved | NO | SUM(bottle_saved) group by user | Use for sustainability/impact stats |