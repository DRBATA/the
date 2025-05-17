import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
// Import your LLM or nano agent API client here
import { callNanoAgent } from '../../lib/nanoAgent';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, message, history } = req.body;
  if (!user_id || message === undefined) return res.status(400).json({ error: 'Missing user_id or message' });

  // 1. Fetch user profile from Supabase (no bottle_saved/water_bottle_saved reference)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, date_of_birth, sex, name, tone, height_cm, weight_kg, body_fat_pct, stripe_customer_id, water_subscription_status')
    .eq('id', user_id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // 2. Compose prompt for LLM/nano agent
  /*
OpenAI Function Schema for Event Logging (Step 3)
-------------------------------------------------
{
  "name": "log_hydration_events",
  "description": "Log all hydration, food, and activity events for the current session day after user confirmation.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": { "type": "string", "description": "The unique identifier of the user." },
      "date": { "type": "string", "description": "The date for which events are being logged, in YYYY-MM-DD format." },
      "events": {
        "type": "array",
        "description": "Array of all confirmed events for the day.",
        "items": {
          "type": "object",
          "properties": {
            "type": { "type": "string", "enum": ["fluid", "food", "activity"], "description": "The type of event." },
            "name": { "type": "string", "description": "Name or description of the event (e.g., 'coffee', 'water', 'walk')." },
            "amount": { "type": "number", "description": "Amount consumed or duration, if applicable (e.g., mL, minutes)." },
            "unit": { "type": "string", "description": "Unit for the amount (e.g., 'mL', 'mg', 'minutes')." },
            "timestamp": { "type": "string", "description": "ISO8601 timestamp for when the event occurred or is planned." },
            "notes": { "type": "string", "description": "Any additional notes or clarifications for the event.", "nullable": true }
          },
          "required": ["type", "name", "timestamp"]
        }
      }
    },
    "required": ["user_id", "date", "events"]
  }
}
-------------------------------------------------
*/

const systemPrompt = `You are a friendly hydration and onboarding coach. Always respond conversationally and warmly, using the user's name if you know it. Use the knowledge base for hydration facts if needed.
The user's profile is: ${JSON.stringify(profile)}.

Step 1: Confirm the user's profile and preferences. Step 2: Confirm the current time and log a session start event (only if not already logged for today).

Step 3: Event Intake & Confirmation:
- Prompt the user: "Please tell me everything you’ve eaten, drunk, or done so far today, as well as anything you plan to do later. You can enter them all at once, or one at a time."
- After each user input, extract all hydration, food, and activity events (with time, amount, and type).
- Summarize the extracted events back to the user: "To confirm, I have: [list of events, e.g., 'Coffee at 8am, water at 9am and 11am, walk at 10am, plan to have lunch at 1pm']. Is this everything for today, including any plans for later?"
- If the user says "no" or adds more, repeat extraction and confirmation.
- Only proceed when the user confirms all events are included.
- If any event is ambiguous or missing details, ask the user for clarification (e.g., "What time did you have breakfast?").

When all events are confirmed, call the function log_hydration_events with the full event list for the day.`;

  // If this is the first contact (empty message), always return a greeting
  if (!message || message.trim() === '') {
    return res.status(200).json({
      messages: [{ sender: 'assistant', text: "Hi! I'm your hydration coach. What's your name?" }],
      ui: null,
      updateProfile: null,
      plan: null,
      results: null
    });
  }
  // 3. Call your LLM/nano agent
  let llmResponse;
  try {
    llmResponse = await callNanoAgent({
      systemPrompt,
      userMessage: message,
      history,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Nano agent error', details: e instanceof Error ? e.message : e });
  }
  // llmResponse should have { messages, ui, updateProfile }


  // 4. Optionally update Supabase if profile fields were extracted
  if (llmResponse.updateProfile) {
    await supabase.from('profiles').update(llmResponse.updateProfile).eq('id', user_id);
  }

  // 5. Return the LLM/agent's response (messages, UI instructions, plan/results, etc.)
  const { messages, ui, updateProfile, plan, results } = llmResponse;
  res.status(200).json({ messages, ui, updateProfile, plan, results });
}
