# Everyday Drinks ↔ Hydration Reference  (v0.1 — 6 May 2025)

| Drink (serving)        | Na mg | K mg | Sugar g | Osmoles† | BHI‡ | Effect        | Key Notes                                    |
|-----------------------|-------|------|---------|----------|------|--------------|-----------------------------------------------|
| Whole milk 240 mL     | 98    | 349  | 12      | ≈93      | 1.5  | Hydrating     | High retention, protein slows emptying        |
| Skim milk 240 mL      | 130   | 382  | 12      | ≈95      | 1.5  | Hydrating     | Faster than whole; lactose-free milk similar  |
| Banana smoothie 350mL | 115   | 700  | 30      | ≈150     | 1.3  | Hydrating     | Add 1 g salt if post-sweat                   |
| Diluted squash 300mL  | 15    | 90   | 15      | ≈70      | 1.0  | Hydrating     | Pair with salty snack if sweat loss           |
| Cola 355 mL           | 45    | 4    | 39      | ≈600     | 1.0  | Neutral       | Hypertonic → sip or dilute                   |
| Lager beer 355 mL     | 14    | 96   | 0       | ≈70      | 0.9  | Mild diuretic | ≤1 serving OK; low-alc better                |
| Non-alc beer 355 mL   | 20    | 96   | 6       | ≈80      | 1.1  | Hydrating     | Some brands add NaCl                         |
| Coffee 240 mL (black) | 5     | 116  | 0       | ≈15      | 0.95 | Neutral       | Caffeine diuresis minimal if habituated       |
| WHO ORS 200 mL        | 180   | 80   | 2.5     | ≈25      | 1.6  | Therapeutic   | Gold-standard for rehydration                 |

†Osmoles ≈ sugar g + protein g×10 + Na mg / 23  
‡BHI = Beverage Hydration Index (water = 1.0)

---

### Usage snippets
* If Na loss > 2 g, favour drinks with Na ≥ 1 g/L (ORS, ayran).
* Hypertonic cola? Dilute 50 : 50 to reach ~6 % sugar.

Source refs: MDCalc serum osmolality, EFSA BHI study (2016), BMJ milk rehydration trial (2011)… (inline citations optional).

---

## JSON Example (for ingestion or retrieval)

```json
{
  "drink": "Whole milk (240ml)",
  "sodium_mg": 98,
  "potassium_mg": 349,
  "sugar_g": 12,
  "osmole_score": 93,
  "bhi": 1.5,
  "effect": "Hydrating",
  "notes": "High retention, protein slows emptying"
}
```

---

*Add new drinks, BHI studies, or practical notes as needed for Dubai context or user feedback.*
