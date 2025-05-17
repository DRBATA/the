# Water Bar Knowledge Base

## Greeting Philosophy & Assistant Tone
- The Water Bar assistant should feel welcoming, knowledgeable, and adaptable.
- Tone can range from hype/energetic to calm/professional, depending on user preference.
- The assistant should subtly convey deep hydration expertise (osmoles, BHI, sweat-rate science) without overwhelming the user.
- Personalization is key: greet users by name, reference their hydration stats, and adapt style based on onboarding quiz or stored preference.

## Water-Bar Barrista Greeting Engine
- Designed to feel fun-personal, with silent science under the hood.
- Example greeting structure:

```jsonc
{
  "vars": {
    "name": "<user first‑name | ‘friend’>",
    "tempC": "<ambient °C or ‘—’>",
    "rh":   "<relative humidity % or ‘—’>",
    "hydrPct": "<today_hydration_percent or '—'>"
  },
  "openingLines": [
    "Welcome back, {name}! ⚡",
    "Hey {name} 👋",
    "Hydration check‑in time, {name}! 💧"
  ],
  "contextBlips": [
    "{hydrPct}% topped‑up already — nice start! 🟢",
    "It’s {tempC} °C / {rh}% RH out there; we’ll keep that in mind. 🌡️",
    "Sweat weather today ({tempC} °C). Let’s stay ahead of the curve! 💦"
  ],
  "barristaPitch": [
    "I’m your Water‑Bar Barrista, mixing fluids + osmoles so every sip sticks.",
    "Think of me as your personal electrolyte sommelier. We pour what the cells crave.",
    "Powered by osmole math > calories. Ready to keep you crystal‑clear?"
  ],
  "promptFollowUps": [
    "📝 What would you like to log first — a drink, a snack, or an activity?",
    "Need a quick plan for your next workout, or just a sip suggestion?",
    "Tell me what you’ve had since waking and I’ll balance the books."
  ]
}
```

### Rendering Logic
- Pick one line from each section at random, fill in variables, and join for a fresh, layered greeting.
- Example pseudocode:

```ts
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const greet = (vars) =>
  [
    pick(openingLines).replace("{name}", vars.name),
    pick(contextBlips)
      .replace("{hydrPct}", vars.hydrPct)
      .replace("{tempC}", vars.tempC)
      .replace("{rh}", vars.rh),
    pick(barristaPitch),
    pick(promptFollowUps)
  ]
  .filter(Boolean)
  .join(" ");
```

## Why This Works
- **Context blip:** Shows environmental awareness (temp, RH) → feels smart.
- **Hydration %:** Progress cue, dopamine hit.
- **Barrista pitch:** Subtle science, primes user for deeper features.
- **Follow-up:** Gentle nudge to next action/logging.

## Copy Variations for Freshness
- "Powered by osmole math — the first coach that counts sweat‑salt, not just litres. 🚀"
- "Need clarity? I make water + electrolytes stick around 50 % longer. 🧪"
- "Your cells called — they want 285 mOsm. I can get you there. 😉"

## Guidance
- Start with a soft, welcoming greeting that introduces the Water Bar concept.
- Quickly clarify user coaching style preference (hype, chill, science, surprise, etc.).
- Store both name and style in Supabase for future personalized greetings.
- Use this file as a context source for all greeting and coaching logic.

# Hydration Data for Drinks, User Groups, and Environmental Factors

## Hydration Effectiveness of Various Beverages

Different drinks contribute to hydration with varying efficiency. Researchers have developed a **Beverage Hydration Index (BHI)** to compare how much of a drink is retained in the body versus plain water (water = 1.0). Key factors include electrolyte content (especially sodium), presence of diuretics like caffeine or alcohol, and sugar/protein content. The table below summarizes common beverages, their approximate hydration multipliers relative to water, and notes on caffeine and electrolytes:



| **Beverage**                              | **Hydration Index**<br/>(vs. water = 1.0) | **Caffeine Content**                  | **Electrolytes & Notes**                                                                                                                                                                                                                                                                |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Water (plain)**                         | 1.0 (baseline)                            | 0 mg (none)                           | Typically low electrolyte content (varies by source). Standard for hydration.                                                                                                                                                                                                           |
| **Oral Rehydration Soln (ORS)**           | \~1.5 (very high)                         | 0 mg                                  | Formulated with high sodium (\~45+ mmol/L) and some potassium; maximizes fluid retention.                                                                                                                                                                                               |
| **Sports Drink** (e.g. electrolyte drink) | \~1.0–1.2 (above water)                   | 0 mg (usually)                        | Contains sodium (10–25 mmol/L) and some potassium + sugars. Aids hydration during exercise, but BHI often similar to water unless high sodium content.                                                                                                                                  |
| **Coconut Water**                         | \~1.0 (similar to water)                  | 0 mg                                  | High in potassium (e.g. \~600 mg/cup) but low in sodium. Hydrates about as well as sports drinks in studies, though large volumes may cause bloating.                                                                                                                                   |
| **Milk (skim or whole)**                  | \~1.5 (very high)                         | 0 mg                                  | Rich in electrolytes (calcium, \~100 mg Na+ and \~370 mg K+ per cup) and contains protein & lactose, which slow fluid absorption and promote retention. One of the most hydrating beverages.                                                                                            |
| **Orange Juice**                          | \~1.0 (similar to water)                  | 0 mg                                  | Contains sugars and potassium (\~450 mg/cup) but very low sodium. Hydrates similarly to water in the short term. High sugar may increase diuresis in hyperglycemic individuals.                                                                                                         |
| **Coffee** (1 cup)                        | \~0.8–1.0 (net positive)                  | \~95 mg per 8 oz                      | Mild diuretic effect from caffeine, but moderate intake does *not* cause net dehydration. Regular coffee drinkers develop tolerance to the diuretic effect. Still contributes to hydration, though slightly less efficiently than water.                                                |
| **Black Tea** (8 oz)                      | \~1.0 (near water)                        | \~30–50 mg caffeine                   | Similar to coffee but lower caffeine. Generally hydrating; excessive intake could have mild diuretic effect. Unsweetened tea provides water with minimal electrolytes.                                                                                                                  |
| **Soda (Cola)**                           | \~1.0 (near water)                        | \~30–40 mg per 12 oz (if caffeinated) | Mostly water with sugar and some caffeine. In tests, cola (incl. diet) did not differ from water in hydration over 4 hours. Contains little sodium (\~50 mg/12 oz) so it hydrates about the same as water. High sugar sodas can increase urine output if they lead to high blood sugar. |
| **Diet Soda**                             | \~1.0 (near water)                        | \~30–40 mg (if caffeinated)           | Similar to regular soda regarding hydration (mostly water). No sugar, so no osmotic diuresis from sugar, and caffeine content is moderate. Hydration similar to water.                                                                                                                  |
| **Beer (lager \~4% abv)**                 | \~1.0 (near water)                        | Alcohol (\~14 g per 12 oz)            | Low alcohol beer has only a mild diuretic effect. 1 liter of lager in a study had hydration comparable to 1 L of water. Contains some potassium, low sodium. Moderation is key; *excess* beer can dehydrate if total alcohol is high.                                                   |
| **Wine (\~12% abv)**                      | <1.0 (slightly dehydrating)               | Alcohol (\~14 g per 5 oz)             | Higher alcohol content causes a diuretic effect (suppresses ADH). Moderate wine intake showed increased urine output in research. Net hydration is lower than water; should be accompanied by water to avoid dehydration.                                                               |
| **Spirits (40% abv)**                     | <<1.0 (dehydrating)                       | Alcohol (\~14 g per 1.5 oz)           | High alcohol beverages cause the body to lose more water than the drink provides. Strong diuretic effect – can lead to net fluid loss. Always hydrate with water alongside.                                                                                                             |

**Key takeaways:** Drinks with electrolytes (especially sodium) tend to **retain more fluid** than plain water – e.g. ORS and milk have \~50% higher hydration index. Drinks with caffeine or high alcohol can promote extra urination, slightly **reducing net hydration**. However, moderate caffeine (<\~500 mg/day) has minimal impact on overall hydration status, and beverages like tea/coffee still count toward fluid intake. **Alcohol**’s effect depends on dose: low-alcohol beer hydrates similarly to water, but higher-alcohol drinks (wine, liquor) are **net dehydrating**, as studies show they increase urine output and inhibit the body’s water-retention hormone (vasopressin). Sugars alone generally don’t dehydrate, but extremely sugary drinks can, in certain cases (e.g. unmanaged diabetes), cause osmotic diuresis. For most people, the water in beverages – even caffeinated ones – provides a net gain of hydration, with only slight differences in efficiency.

## Hydration Guidelines for Different Users

Hydration needs vary by individual and context. Below are evidence-based guidelines for various user profiles, including athletes, knowledge workers, and general adults, as well as regional considerations for climate and beverage habits.

### General Adults (Baseline Needs)

For a healthy adult in a temperate environment, general guidelines suggest around **2–4 liters of fluids per day**. The U.S. National Academies recommend \~3.7 L/day for an average adult man and \~2.7 L/day for a woman (total fluids, including roughly 20% from food). This corresponds to roughly **\~8–12 cups (2–3 L) of beverages** daily for most people. The oft-cited “8×8” rule (eight 8-oz glasses) is a rough simplification but falls in this range.

Keep in mind individual factors: body size, activity level, and health status. Thirst is a useful indicator, but it’s somewhat lagging – by the time you feel thirsty, you may already be about **1–2% dehydrated by body weight**. Even mild dehydration at this level can cause fatigue or reduced alertness. Therefore, general users are advised to **drink regularly throughout the day**, even before strong thirst hits. Water is the best default drink for hydration, but all fluids count (including tea, coffee, etc., in moderation).

For older adults, the thirst mechanism can be blunted, so a conscious effort to drink fluids on a schedule may be needed. For pregnant or breastfeeding women, fluid needs are higher (e.g. an extra \~0.3–0.7 L/day). In illness (fever, vomiting) or very hot weather, additional fluids are critical (see climate considerations below).

### Knowledge Workers (Cognitive Function and Hydration)

Mental performance can be subtly but significantly affected by hydration status. Research shows that **dehydration impairs cognitive performance**, especially for tasks requiring attention, executive function, and memory. Even a \~2% loss in body mass from water (which can happen by forgetting to drink water during a busy day) has been linked to slower cognitive processing and reduced concentration. Mild dehydration often manifests as difficulty focusing, headaches, or irritability.

For knowledge workers (students, office workers, etc.), the guidance is to **maintain euhydration (proper hydration) throughout the day** to support optimal cognitive function. Practically, this means having water readily available at your desk and aiming to sip fluids regularly. A good habit is to drink a glass of water with each meal and another in between meals, totaling \~8+ cups a day. One can also monitor urine color – pale yellow indicates good hydration, whereas darker urine suggests you need more water.

Caffeine in coffee or tea is a double-edged sword: while it may boost alertness, it can have a mild diuretic effect. Moderate caffeine (e.g. 1–3 cups of coffee per day) generally does not cause dehydration for regular consumers, so coffee/tea *do* contribute to hydration. However, excessive caffeine (>500 mg a day, equivalent to \~5+ cups of coffee) could lead to fluid loss and jitters. Knowledge workers should therefore consume caffeine in moderation and ensure they also drink plain water. **Bottom line:** to keep cognitive performance sharp, don’t let yourself get even mildly dehydrated – sip water periodically, and more if you notice signs like thirst or headache.

### Athletes and Active Individuals

**Athletes** have heightened hydration needs before, during, and after exercise. Even a 1–2% drop in body weight from sweat can impair athletic performance (reducing endurance, strength, and focus) and increase risk of heat illness. Thus, proactive hydration is crucial. Key guidelines include:

* **Pre-exercise:** Start activity well-hydrated. A common recommendation is to drink about **5–7 mL of fluid per kg body weight** in the 4 hours before exercise (approximately 350–500 mL for a 70 kg person), and top up with another \~250–350 mL 2 hours prior if urine is dark. Essentially, ensure urine is pale straw color before strenuous activity.

* **During exercise:** Aim to **drink at regular intervals** to offset sweat losses. The American College of Sports Medicine (ACSM) and NATA suggest about **0.2–0.3 liters every 15 minutes** for active sports. This equals \~800–1200 mL per hour for an average athlete, matching the sweat rate of a moderately intense workout. Individual sweat rates vary widely (from \~0.5 L/hour in cool conditions to >2 L/hour in hot, intense exercise), so athletes should adjust accordingly. In practice, athletes often **calculate sweat rate** by weighing themselves before and after a training session (1 kg weight loss ≈ 1 L sweat loss). Replace as close to 100% of losses as feasible during the activity; if full replacement is not possible (common in very heavy sweaters), aim for at least 50%–80% replacement and rehydrate fully after.

* **Post-exercise:** For full recovery and to compensate for continued perspiration and urine losses, **drink \~1.25–1.5 liters for every 1 kg of body mass lost** during exercise. In other words, about **150% of the fluid deficit** should be ingested over the hours following exercise. For example, if you’re 2 kg lighter after a long run, you’d need about 3 L of fluid to rehydrate completely. Include electrolytes (sodium in particular) in post-exercise fluids or food – e.g. a sports drink or salty snack – to aid retention of the water. Consuming sodium-rich foods/drinks helps restore plasma volume more effectively than plain water.

* **Electrolytes:** During prolonged exercise (>1–2 hours) or in very hot conditions, **electrolyte replacement** is important. Sweat contains sodium, chloride, and potassium; drinking only plain water in large amounts can lead to sodium dilution. Sports drinks or oral rehydration solutions with sodium (around 300–700 mg/L) are recommended for endurance activities. They not only replace salts but also have been shown to improve water retention (higher BHI) compared to plain water. For most workouts under an hour, plain water is fine, but any exercise causing heavy sweating might warrant an electrolyte beverage.

* **Athlete daily needs:** Total daily fluid intake for athletes will be higher than average. **Physically active people often require >3–4 L/day**, and in some cases 6–10 L/day in extreme training or heat. Athletes should incorporate fluids with meals and ensure rehydration between sessions. Monitoring urine color and body weight can help gauge if daily hydration is adequate.

In summary, athletes should **pre-hydrate, hydrate during (to the extent possible), and rehydrate after** exercise. Weighing oneself or checking urine are practical tools to personalize hydration. Proper hydration supports better performance and reduces risks of cramps, dizziness, or heat-related issues.

### Climate and Regional Considerations (Europe vs. Middle East)

**Climate** dramatically influences hydration needs. Both Europe and the Middle East host diverse climates and cultural drinking habits that affect how people hydrate:

* **Temperate Climates (e.g. much of Europe):** In mild, moderate temperatures (say 18–25 °C with moderate humidity), baseline fluid recommendations (2–3 L/day) generally suffice. However, many parts of Europe experience hot summers, and indoor heating in winter can also be dehydrating (dry air). In warm weather, Europeans may need to consciously increase water intake even if the climate is not as extreme as a desert – e.g. an extra liter on a hot day is advisable. The **European Food Safety Authority (EFSA)** guidelines for water are similar to U.S. values, around 2.0–2.5 L/day for adults in moderate conditions, with higher intake when active or in heat. Culturally, Europeans consume a variety of beverages (coffee, tea, wine/beer, etc.), so it’s worth noting that **alcoholic drinks common in Europe can contribute to dehydration** if not balanced with water. For instance, someone enjoying beer or wine in the evening should also drink water, as those alcohols (especially wine/spirits) increase fluid loss. Conversely, the widespread habit of drinking tea/coffee in Europe does provide fluids; these caffeinated beverages are hydrating on balance, though heavy caffeine users should ensure additional water. In summary, European users should adjust intake with the seasons – more water during heat waves or outdoor activities – and be mindful that alcohol needs to be offset with water.

* **Hot/Dry Climates (e.g. Middle East):** In Middle Eastern countries, high temperatures (often 35–45 °C in summer) and low humidity in desert areas mean **sweat evaporates quickly** – people can lose water without realizing it (you may not feel drenched in sweat, but you’re still losing fluid). In such climates, baseline needs are higher. It’s not uncommon for those in the Gulf region or similar climates to require **4–6+ liters of fluid per day** to stay fully hydrated. For outdoor workers or anyone active in midday heat, the requirements can be extreme: guidelines for laborers in hot environments recommend **drinking about 250 mL every 15 minutes** continuously – that’s 1 liter per hour – to keep up with sweat losses. Even those not exercising should drink water frequently; simply being in 40 °C heat causes increased perspiration for cooling. **Cultural habits** in the Middle East often include drinking hot tea even in hot weather (which still hydrates and can induce sweating for cooling) and consuming fluids in the cooler parts of the day. Many Middle Eastern communities have limited alcohol intake (for religious/cultural reasons), which actually helps avoid the dehydration that alcohol can cause. Instead, tea, coffee (e.g. Arabic coffee), and water are staples. Coffee/tea are usually taken in small cups, but repeatedly, providing some hydration. However, these often come with sugar, which can increase thirst. It’s important for individuals in these regions to consciously **increase water intake beyond thirst** because the thirst mechanism might not fully reflect the high rate of loss in extreme heat. During Ramadan fasting periods, hydration strategies become critical – rehydrating sufficiently during non-fasting hours with water and electrolytes to prepare for the day.

**Humidity:** High humidity (common in some Middle Eastern coastal areas and also in European summers) reduces the efficiency of sweat evaporation. This means the body’s cooling is hampered and you may actually sweat even *more* (dripping sweat that doesn’t evaporate). High humidity thus **amplifies dehydration risk**. For example, a 35 °C day at 80% humidity is even more taxing than a 35 °C dry day. In such conditions, one should *not* wait for thirst; schedule water breaks and ensure a balance of electrolytes because heavy continuous sweating depletes salt. The **risk of heat exhaustion or heat stroke** is highest when both temperature and humidity are high, so hydration and cooling measures (shade, rest) are lifesavers.

In summary, **Middle Eastern users in hot climates need to intake significantly more fluids daily** than a temperate-climate person, and they should include electrolytes if sweating heavily. European users should adjust their typically moderate fluid intake upward during heatwaves or vigorous activity, and be cautious with diuretics like alcohol in summer. Always respond to the environment: as one guideline, **drink before you feel thirsty in hot conditions** and ensure your urine stays light-colored as a sign of adequate hydration.

## Adjusting Hydration for Temperature, Humidity, and Activity

Hydration needs are dynamic – they increase with higher **temperature**, greater **humidity**, and higher **physical activity**. Several scientifically validated models and guidelines help adjust fluid intake for these factors:

* **Heat and Temperature:** As a rule of thumb, hotter environments demand more water. For example, in **moderate heat** (NIOSH defines “moderate conditions” for workers), it’s recommended to drink **\~1 cup (240 mL) of water every 15–20 minutes** if you’re doing physical work. That totals \~0.7–1.0 L per hour. In **extreme heat** (e.g. >30 °C, especially with sun exposure), this may need to be at the higher end or even more. The U.S. OSHA cautions not to exceed \~1.4 L/hour (48 oz/hour) for prolonged periods – drinking too much too fast can lead to dilution of blood sodium (hyponatremia). A practical upper limit is \~1 liter per hour when heavily sweating, plus **electrolytes** to replenish salts lost. Organizations often use the **Wet-Bulb Globe Temperature (WBGT)** or heat index (which combine temperature and humidity) to set work-rest and drink schedules. For instance, at a WBGT of 30 °C (very hot), a worker might be advised to drink \~1 L/hour and take cooling breaks. While a precise formula for “ml per °C” isn’t linear (because sweat rates accelerate exponentially in extreme heat), one can remember that at **hotter than \~25–30 °C**, you likely need at least **20–30% more water intake** than on a cool day, and at **40 °C+** it could double your needs. Always **listen to your body**: rapid heartbeat, dizziness, or infrequent urination are danger signs – increase fluids and cool down.

* **Humidity:** High humidity impairs sweat evaporation, which can lead to overheating and continued heavy sweating that wastes water. In humid conditions, **maximize cooling** (seek fans, shade) and drink fluids at shorter intervals. While no separate equation exists for humidity, heat index charts (combining humidity and temp) can guide risk: e.g., 32 °C at 70% humidity “feels like” 41 °C to the body. So treat it as if the temperature were higher in terms of hydration. Ensure any hydration plan in humidity includes **salt replacement**, as one tends to lose a lot of salt through sustained sweating. **Electrolyte solutions** or even lightly salted water or snacks can help. In summary, **the more humid it is, the more aggressively you should hydrate** (even if you don’t feel dry, you are still losing fluids).

* **Physical Activity & Intensity:** Activity increases internal heat production and sweat. **Sweat rate** is the key factor: mild exercise might produce 0.3–0.5 L/hour of sweat, whereas vigorous exercise can produce 1–2+ L/hour. It’s very individual and depends on fitness, acclimatization, clothing, etc. **Personalized model:** a highly useful approach is the **“sweat rate formula”**: weigh yourself before and after exercise (in minimal clothing, towel off sweat) to see how much weight was lost in an hour. Every **1 kg weight loss = \~1 liter sweat**. If you drank anything during that period, add it to the loss to get total sweat output. This gives a per-hour sweat rate for those conditions. Then you can aim to **drink that amount per hour** in similar future sessions. If someone loses 0.7 kg in an hour run, they sweat \~0.7 L/h; they should target \~700 mL per hour of fluid intake next time (around 175 mL every 15 min). An easier generic guideline for moderate exercise is **400–800 mL per hour** for most people, increasing toward the higher end in heat or if you’re a heavy sweater.

* **Post-exercise Rehydration Model:** After heavy exercise or any scenario of dehydration, a **rehydration model** is to drink **1.5× the volume of weight lost**. This 1.5x factor accounts for the fact that not all ingested water stays in (some will be urinated). For example, if you’re down 1 kg (1L) after a long workout, consume \~1.5 L over the next few hours. This is a validated approach in sports science to ensure full recovery of fluid balance.

* **Adjustment Formulas in Apps:** Some hydration tracker apps use simplified algorithms. For instance, one might start with a base requirement (say 35 mL per kg body weight per day for a moderate climate) and then **add a certain amount per degree of temperature above a baseline**. A hypothetical formula: *Extra\_water (mL) = 100 mL \* (T – 20°C)* for each hour spent outdoors\*, could be used to bump intake on hot days (so 30°C would add \~1000 mL over a day spent outside). Another approach: *increase daily intake by 1–2 cups for every 5°C above a comfortable 20°C baseline*. Similarly for activity, *add 500 mL for every 30 minutes of intense exercise*. These are heuristic models – the scientific basis is essentially the sweat rate and heat effects discussed.

* **Empirical Models:** Military guidelines, which are medically derived, provide a clear schedule. For example, the U.S. Army suggests at **32°C (90°F)** with moderate work, soldiers drink \~1 quart (0.95 L) per hour, and at higher heat they enforce work/rest cycles with water. They also stress **not to exceed 1.5 L/hour**. These models show that **beyond a certain point, you can’t sweat (or drink) much more per hour safely**, so instead they reduce activity duration.

In practical terms, **combining factors** gives the highest needs: e.g. a long bout of physical activity in high heat and humidity. In such cases, all strategies must combine: pre-hydrate, hydrate aggressively during, use electrolytes, and replenish after. It’s not unusual for a marathon runner in tropical conditions to consume 6–8 L of fluid over a few hours (and still lose weight!). Hydration models would flag this scenario as extreme risk for dehydration if intake is insufficient.

To support *programmatic* use: one could create a formula where **daily fluid goal = base requirement + activity adjustment + climate adjustment**. For example:

* Base: 2500 mL (for a given individual).
* Activity: +700 mL for each hour of moderate exercise (less for light, more for intense).
* Temperature: +500 mL for each 10°C above 20°C (if physically active in it; less if just at rest in heat but still some increase).
* Humidity: if humidity > 60%, maybe an additional +250 mL as a safety margin (especially if heat index is high).

These numbers can be tuned with reference to the guidelines above (NIOSH’s 240 mL/15 min in heat, etc.). The **most reliable approach** is to use sweat loss measurements for exercise and to follow established guidelines for heat. For instance, an app could implement logic: “If temperature > 30°C or humidity > 70%, recommend user to drink an extra 1–2 cups of water over the next few hours and remind them to drink periodically (even without thirst).”

Finally, remember that **electrolyte balance** is part of the hydration model. Encourage inclusion of a sports drink or salty snack for long durations or very high sweat scenarios. Pure water is adequate for most people in daily life, but when adjusting for extreme sweat loss, adding sodium prevents hyponatremia and helps the body actually utilize the fluid.

**In summary:** Increase your baseline hydration targets when it’s hot or you’re active. Science-backed rules of thumb include **\~0.7–1.0 L/hour during heavy sweating**, **150% replacement of losses** post-activity, and drinking **ahead of thirst in extreme conditions**. These principles can be quantified into an app-friendly format, ensuring users get tailored recommendations to stay safely hydrated in all scenarios.

**Sources:**

* Beverage hydration index study (Am J Clin Nutr 2016) – relative hydration of drinks.
* Medical News Today – on alcohol and dehydration (2017/2018 studies).
* Medical News Today – on caffeine and dehydration (2017 study).
* ACSM/NATA Sports Medicine guidelines – exercise hydration and rehydration.
* NIOSH/CDC – guidance for workers in heat (hydration schedules).
* Mayo Clinic – daily water intake recommendations and factors.
* Meta-analysis (2018) – cognitive effects of dehydration.
* Korey Stringer Institute – thirst at 1–2% dehydration.
