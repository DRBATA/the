import type { NextApiRequest, NextApiResponse } from 'next';

// Hydration/ion calculation logic with osmole math and KB-based recommendations
interface LogEvent {
  type: 'fluid' | 'food' | 'activity';
  amount: number; // mL or mg
  sodium?: number; // mg
  potassium?: number; // mg
  sweatLoss?: number; // mL
}

interface PlanInput {
  height_cm: number;
  weight_kg: number;
  age: number;
  sex: string;
  log?: LogEvent[];
}

function computePlan({ height_cm, weight_kg, age, sex, log }: PlanInput) {
  // 1. Core body water and base fluid estimate
  const TBW = weight_kg * 0.6;
  const fluid_need_base = TBW * 0.07 * 1000; // mL

  // 2. Basic ion targets (mg)
  const Na_target = 1500;
  const K_target = 3500;
  const Mg_target = 400;

  // 3. Example osmole KBs (could be imported or dynamically loaded)
  // For now, use a few representative foods/drinks from hydration_osmole_kb and beverage_hydration_kb
  const kbFoods = [
    { name: "Water (250ml)", osmoles: 0, effect: "Hydrating" },
    { name: "Coconut water (240ml)", osmoles: 102, effect: "Hydrating" },
    { name: "Ayran (250ml)", osmoles: 137, effect: "Hydrating" },
    { name: "Whole milk (244ml)", osmoles: 93, effect: "Hydrating" },
    { name: "Banana (100g)", osmoles: 145, effect: "Neutral" },
    { name: "Dates (dried, 100g)", osmoles: 413, effect: "Dehydrating" },
    { name: "Cola (355ml)", osmoles: 600, effect: "Neutral" },
    { name: "ORS (200ml)", osmoles: 25, effect: "Hydrating" },
  ];

  // 4. Estimate typical daily osmole intake (simple sum of a few servings)
  // This is a placeholder; in future, sum actual user logs or a more detailed diet
  let typicalOsmoleIntake = 0;
  let totalFluidIn = 0;
  let totalSodiumIn = 0;
  let totalPotassiumIn = 0;
  let totalSweatLoss = 0;

  if (log) {
    log.forEach(event => {
      if (event.type === 'fluid') {
        totalFluidIn += event.amount;
      } else if (event.type === 'food') {
        typicalOsmoleIntake += event.amount;
      } else if (event.type === 'activity') {
        totalSweatLoss += event.sweatLoss || 0;
        totalSodiumIn += event.sodium || 0;
        totalPotassiumIn += event.potassium || 0;
      }
    });
  } else {
    // Fallback to current logic if no log is provided
    typicalOsmoleIntake =
      2 * kbFoods.find(f => f.name.includes("Water"))!.osmoles +
      kbFoods.find(f => f.name.includes("Coconut water"))!.osmoles +
      kbFoods.find(f => f.name.includes("Whole milk"))!.osmoles +
      kbFoods.find(f => f.name.includes("Banana"))!.osmoles +
      kbFoods.find(f => f.name.includes("Dates"))!.osmoles +
      kbFoods.find(f => f.name.includes("Cola"))!.osmoles;
  }

  // 5. Adjust fluid needs based on osmole load
  // Rule of thumb: for every 100 mOsm above baseline (~500 mOsm/day), add 200 mL fluid need
  const baselineOsmole = 500;
  const extraOsmole = Math.max(0, typicalOsmoleIntake - baselineOsmole);
  const osmoleAdjustment = Math.round((extraOsmole / 100) * 200); // mL
  const fluids_target_ml = Math.round(fluid_need_base + osmoleAdjustment);

  // 6. Calculate net balance and remaining need
  const netFluidBalance = totalFluidIn - totalSweatLoss;
  const remainingFluidNeed = fluids_target_ml - netFluidBalance;
  const remainingSodiumNeed = Na_target - totalSodiumIn;
  const remainingPotassiumNeed = K_target - totalPotassiumIn;

  // 7. Suggest hydrating foods/drinks
  const hydratingOptions = kbFoods.filter(f => f.effect === "Hydrating").map(f => f.name);

  // 8. Explanation
  const explanation = `Based on your profile and estimated osmole intake (~${typicalOsmoleIntake} mOsm), your fluid target is adjusted by +${osmoleAdjustment} mL. Prioritize hydrating foods and drinks (e.g., ${hydratingOptions.join(", ")}). Avoid excess high-osmole foods (e.g., dates, cola) if at risk of dehydration.`;

  return {
    fluids_target_ml,
    na_target_mg: Na_target,
    k_target_mg: K_target,
    mg_target_mg: Mg_target,
    tbw_l: Math.round(TBW * 10) / 10,
    typicalOsmoleIntake,
    osmoleAdjustment,
    hydratingOptions,
    explanation,
    netFluidBalance,
    remainingFluidNeed,
    remainingSodiumNeed,
    remainingPotassiumNeed,
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { height_cm, weight_kg, age, sex } = req.body;
  if (!height_cm || !weight_kg) return res.status(400).json({ error: 'Missing required fields' });
  const plan = computePlan({ height_cm, weight_kg, age, sex });
  res.status(200).json(plan);
}
