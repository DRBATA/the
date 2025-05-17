// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  // Sync persistent stats from hydration_logs before loading profile
  // 1. Aggregate from hydration_logs
  const { data: logs, error: logsError } = await supabase
    .from('hydration_logs')
    .select('carbon_kg, bottle_saved')
    .eq('user_id', user_id);

  let water_bottle_saved = 0;
  let carbon_saved = 0;
  if (!logsError && logs) {
    for (const log of logs) {
      if (log.bottle_saved) {
        water_bottle_saved += 1;
        carbon_saved += log.carbon_kg ?? 0;
      }
    }
    // 2. Update the profile with the latest totals
    await supabase
      .from('profiles')
      .update({ water_bottle_saved, carbon_saved })
      .eq('id', user_id);
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  // Fetch latest body composition log for weight
  const { data: body_comp } = await supabase
    .from('body_composition_logs')
    .select('*')
    .eq('user_id', user_id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch today's hydration logs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: hydration_logs } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', today.toISOString());

  // Aggregate hydration and electrolytes
  const hydration_today_ml = hydration_logs?.reduce((sum, log) => sum + (log.volume_ml || 0), 0) || 0;
  const electrolyte_today_mg = hydration_logs?.reduce((sum, log) => sum + (log.electrolyte_support ? 100 : 0), 0) || 0; // Example: 100mg per support

  // Calculate hydration target (simple fallback)
  const weight_kg = body_comp?.weight_kg || 70;
  const hydration_target_ml = Math.round(weight_kg * 30);
  const electrolyte_target_mg = 800;

  // Compose system prompt and user message
  let SYSTEM_PROMPT = `You are a hydration and wellness dashboard assistant. Always return a JSON object with all dashboard fields.`;
  let user_msg = `Update my dashboard. My profile: ${JSON.stringify(profile)}. Today's hydration: ${hydration_today_ml} ml; electrolytes: ${electrolyte_today_mg} mg. Weight: ${weight_kg} kg.`;

  if (profile?.date_of_birth) {
    SYSTEM_PROMPT = `You are a hydration and wellness dashboard assistant. Always return a JSON object with at least these fields: { plan: string, advice: string, recommended_liters: number }.`;
    user_msg = `Given a user born on ${profile.date_of_birth}${profile?.weight_kg ? ` and weighing ${profile.weight_kg} kg` : ""}, calculate and recommend an exact daily water intake (in liters) for them. Return a short, friendly \"plan\" (e.g., \"Aim for 2.4L per day\") and a motivational \"advice\" message. Always return a JSON object: { plan: string, advice: string, recommended_liters: number }`;
    console.log("[OpenAI] Calling with:", { SYSTEM_PROMPT, user_msg });
  }

  // Tool schemas
  const getHydrationStatsSchema = {
    name: "get_hydration_stats",
    description: "Get today's hydration and electrolyte totals for the user.",
    parameters: {
      type: "object",
      properties: {
        hydration_today_ml: { type: "number" },
        electrolyte_today_mg: { type: "number" },
      },
      required: ["hydration_today_ml", "electrolyte_today_mg"],
    },
  };

  // Responses API orchestration (single round-trip for dashboard)
  let dashboardJson = {
    profile,
    carbon_saved: ((profile?.water_bottle_saved ?? 0) * 0.083).toFixed(2),
    hydration_target_ml,
    hydration_today_ml,
    hydration_percent: Math.round((hydration_today_ml / hydration_target_ml) * 100),
    electrolyte_target_mg,
    electrolyte_today_mg,
    plan: "Please log your profile and hydration for a personalized plan.",
    advice: "Start by entering your height, weight, and a drink!",
  };

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user_msg }
      ],
      tools: [
        {
          type: "function",
          function: getHydrationStatsSchema
        }
      ],
      temperature: 0.2,
    });
    // If tool call, run it and return follow-up
    const tool = response.tool_calls?.[0];
    if (tool && tool.name === "get_hydration_stats") {
      // Simulate tool result (already have values)
      const follow = await openai.responses.create({
        model: "gpt-4o-mini",
        previous_response_id: response.id,
        tool_choice: {
          type: "function",
          function: {
            name: tool.name,
            arguments: {
              hydration_today_ml,
              electrolyte_today_mg,
            },
          },
        },
      });
      const aiOut = follow.output?.[0]?.content?.[0]?.text || "";
      // Try to parse JSON from AI output
      try {
        const aiJson = JSON.parse(aiOut);
        dashboardJson = { ...dashboardJson, ...aiJson };
        // If AI returned recommended_liters, update hydration_target_ml
        if (typeof aiJson.recommended_liters === "number") {
          dashboardJson.hydration_target_ml = Math.round(aiJson.recommended_liters * 1000);
        }
      } catch {}
    } else if (response.output?.[0]?.content?.[0]?.text) {
      // Try to parse JSON from direct output
      try {
        const aiJson = JSON.parse(response.output[0].content[0].text);
        dashboardJson = { ...dashboardJson, ...aiJson };
        // If AI returned recommended_liters, update hydration_target_ml
        if (typeof aiJson.recommended_liters === "number") {
          dashboardJson.hydration_target_ml = Math.round(aiJson.recommended_liters * 1000);
        }
      } catch {}
    }
  } catch (e) {
    console.error("OpenAI error:", e); // Log the error for debugging
    // fallback if OpenAI fails
  }

  res.status(200).json(dashboardJson);
}
