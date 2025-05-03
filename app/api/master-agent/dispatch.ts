import { supabase } from "../../lib/supabaseClient";

// Log food intake
export default async function log_food_intake({ user_id, food, calories, timestamp }: any) {
  const { error } = await supabase.from("food_logs").insert({
    user_id,
    food,
    calories,
    timestamp
  });
  if (error) throw new Error("Failed to log food intake: " + error.message);
  return { success: true };
}

// Log activity
export async function log_activity({ user_id, activity, duration_min, timestamp }: any) {
  const { error } = await supabase.from("activity_logs").insert({
    user_id,
    activity,
    duration_min,
    timestamp
  });
  if (error) throw new Error("Failed to log activity: " + error.message);
  return { success: true };
}

// Get weather (dummy: replace with real API call if needed)
export async function get_weather({ lat, lon }: { lat: number; lon: number }) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();
  return {
    temperature: data.current_weather?.temperature,
    humidity: data.current_weather?.humidity
  };
}

// Get hydration stats (dummy: replace with real computation if needed)
export async function get_hydration_stats({ user_id }: { user_id: string }) {
  // Example: fetch user's hydration logs and compute stats
  const { data, error } = await supabase.from("hydration_logs").select("amount_ml, timestamp").eq("user_id", user_id);
  if (error) throw new Error("Failed to fetch hydration stats: " + error.message);
  // Dummy computation
  const total_ml = data?.reduce((sum: number, row: any) => sum + (row.amount_ml || 0), 0) || 0;
  return { total_ml, entries: data };
}
