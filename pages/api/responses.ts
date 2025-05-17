import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as tools from './tools';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// --- Tool Schemas for OpenAI Responses API ---
export const agenticToolSchemas = [
  {
    type: 'function',
    function: {
      name: 'reset_session',
      description: 'Clear today’s logs and start a new hydration session for the user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string', description: 'The user\'s unique ID' },
        },
        required: ['user_id'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_event_batch',
      description: 'Log one or more hydration/food/activity events for the current session.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          events: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of event objects (type, amount, timestamp, etc.)',
          },
        },
        required: ['user_id', 'events'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'validate_events',
      description: 'Validate and enrich staged events for the user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
        },
        required: ['user_id'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'recalculate_projection',
      description: 'Update fluid and ion balance projections for the user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
        },
        required: ['user_id'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_plan',
      description: 'Generate a new hydration plan for the user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
        },
        required: ['user_id'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_plan_status',
      description: 'Accept or reject a plan for the user.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          plan_id: { type: 'string' },
          status: { type: 'string', description: 'accept or reject' },
        },
        required: ['user_id', 'plan_id', 'status'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description: 'Fetch user profile from the database.',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
        },
        required: ['user_id'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

// --- Function Call Handler ---
// Lint fix: Cast tools to Record<string, any> for dynamic access
async function handleFunctionCall(toolName: string, args: any) {
  const registry = tools as Record<string, any>;
  if (typeof registry[toolName] === 'function') {
    return await registry[toolName](args);
  }
  throw new Error(`Tool function not found: ${toolName}`);
}


// Main API handler: supports normal agentic chat and tool/function call execution
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Stepwise workflow enforcement ---
  // 1. Determine the previous step from metadata (if using OpenAI Responses API chaining)
  let previousStep = null;
  let previousResponseMeta = {};
  if (req.body.previous_response_id) {
    try {
      const prev = await openai.responses.retrieve(req.body.previous_response_id);
      previousStep = prev.metadata?.step || null;
      previousResponseMeta = prev.metadata || {};
    } catch (e) {
      // If previous response retrieval fails, continue as if at start
      previousStep = null;
      previousResponseMeta = {};
    }
  } else if (req.body.metadata && req.body.metadata.step) {
    previousStep = req.body.metadata.step;
    previousResponseMeta = req.body.metadata;
  }

  // 2. Decide what step the user is at, and what is allowed next
  // Steps: profile -> body_comp -> intake -> plan
  // Default to profile step if nothing found
  let currentStep = previousStep || 'awaiting_profile';
  let nextStep = currentStep;
  let responseMessage = '';
  let responseSteps: any[] = [];
  let requireBodyType = false;
  let bodyTypeOptions: string[] = [];
  let allowPlan = false; // Explicitly typed and initialized


  // 3. Fetch user profile for logic
  const { user_id, event_date } = req.body;
  let profileData: any = null;
  if (user_id) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();
    profileData = data;
  }

  // 4. Step logic
  if (currentStep === 'awaiting_profile') {
    // Check if profile is complete (name, height, weight)
    if (!profileData || !profileData.name || !profileData.height_cm || !profileData.weight_kg) {
      responseMessage = 'Please complete your profile (name, height, weight) to continue.';
      responseSteps = [{ step: 'awaiting_profile', message: responseMessage }];
      return res.status(200).json({
        message: responseMessage,
        steps: responseSteps,
        metadata: { step: 'awaiting_profile' }
      });
    } else {
      responseMessage = 'Profile complete. Please provide your body composition (body fat %) or select a body type.';
      responseSteps = [{ step: 'profile_confirmed', message: responseMessage }];
      nextStep = 'awaiting_body_comp';
    }
  } else if (currentStep === 'awaiting_body_comp') {
    // Check if body comp is present
    if (!profileData || (profileData.body_fat_pct === null || profileData.body_fat_pct === undefined)) {
      // Fetch available body types
      const { data: bodyTypes } = await supabase
        .from('body_type_library')
        .select('label');
      bodyTypeOptions = bodyTypes ? bodyTypes.map((t: any) => t.label) : [];
      responseMessage = 'Please provide your body fat percentage, or select your body type from the list.';
      responseSteps = [
        { step: 'awaiting_body_comp', message: responseMessage },
        { step: 'body_type_options', message: 'Select a body type or enter your %.', options: bodyTypeOptions }
      ];
      nextStep = 'awaiting_body_comp';
      requireBodyType = true;
    } else {
      responseMessage = 'Body composition confirmed. Please log your intake and activity.';
      responseSteps = [{ step: 'body_comp_confirmed', message: responseMessage }];
      nextStep = 'awaiting_intake';
    }
  } else if (currentStep === 'awaiting_intake') {
    // Intake logging step: allow event logging, but block plan
    responseMessage = 'Log your food, drink, and activity events. When ready, finalize to get your plan.';
    responseSteps = [{ step: 'awaiting_intake', message: responseMessage }];
    nextStep = 'ready_for_plan';
  } else if (currentStep === 'ready_for_plan') {
    // Only now allow plan generation
    allowPlan = true;
    responseMessage = 'All required info present. Generating your personalized hydration plan...';
    responseSteps = [{ step: 'plan_generating', message: responseMessage }];
    nextStep = 'plan_generated';
  } else if (currentStep === 'plan_generated') {
    responseMessage = 'Plan already generated for this session.';
    responseSteps = [{ step: 'plan_generated', message: responseMessage }];
    nextStep = 'plan_generated';
  }

  // 5. If not allowed to generate plan, return the step info and metadata
  if (!allowPlan) {
    return res.status(200).json({
      message: responseMessage,
      steps: responseSteps,
      metadata: { step: nextStep, require_body_type: requireBodyType, body_type_options: bodyTypeOptions }
    });
  }
  // 6. If allowed, proceed with plan generation as before (insert your plan logic here)
  // ... (existing plan generation logic can be inserted here, with nextStep = 'plan_generated')

  // --- Tool/function call support ---
  // If the request includes a tool_call, execute the corresponding backend tool and return the result
  if (req.body && req.body.tool_call) {
    try {
      const { name, arguments: toolArgs } = req.body.tool_call;
      const output = await handleFunctionCall(name, toolArgs);
      return res.status(200).json({ tool_call_output: output });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Tool call failed' });
    }
  }

  // --- Timeline Event Upsert Logic ---
  // If the request includes a new hydration event, upsert it into the timeline before proceeding
  const { message, history, dashboard_query, event, event_hour } = req.body; // user_id and event_date already declared above
  // PATCH: If profile_updates is present, update the user's profile and reload the session logic
  if (req.body.profile_updates && user_id && event_date) {
    const updates = req.body.profile_updates;
    // Only allow updating body_fat_pct or body_composition_label
    const allowedFields = ['body_fat_pct', 'body_composition_label'];
    const profilePatch: any = {};
    if (typeof updates.body_fat_pct === 'number') profilePatch.body_fat_pct = updates.body_fat_pct;
    if (typeof updates.body_composition_label === 'string') profilePatch.body_composition_label = updates.body_composition_label;
    if (Object.keys(profilePatch).length > 0) {
      await supabase.from('profiles').update(profilePatch).eq('id', user_id);
    }
    // After updating, re-run the session start logic to proceed with baseline/projection
    req.body.event = { type: 'session_start', timestamp: new Date().toISOString() };
    // (fall through to session start logic below)
  }

  // Batch logging support: accept an array of events
  if (Array.isArray(req.body.events) && req.body.events.length > 0 && user_id && event_date) {
    // Insert all events into hydration_event_staging
    const staged = req.body.events.map((event: any) => ({
      user_id,
      event_date,
      event_type: event.type,
      event_name: event.name,
      category: event.category,
      amount: event.amount || null,
      unit: event.unit || null,
      timestamp: event.timestamp || new Date().toISOString(),
      notes: event.notes || null,
      status: 'pending',
      validation_errors: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error: batchInsertError } = await supabase.from('hydration_event_staging').insert(staged);
    if (batchInsertError) {
      return res.status(500).json({ error: 'Batch log insert error', details: batchInsertError.message });
    }
    // If finalize_batch, trigger validation and recalculation
    if (req.body.finalize_batch) {
      // Call validation logic (reuse from validate-events)
      // For now, simulate as a stepwise agentic flow
      // (In production, you may want to import and call the validation handler directly)
      // 1. Fetch all staged events
      const { data: stagedEvents } = await supabase
        .from('hydration_event_staging')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_date', event_date);
      // 2. Move to validated (simulate)
      if (stagedEvents && stagedEvents.length > 0) {
        await supabase.from('hydration_event_validated').insert(stagedEvents.map(e => ({ ...e, validated_at: new Date().toISOString() })));
        await supabase.from('hydration_event_staging').delete().eq('user_id', user_id).eq('event_date', event_date);
      }
      // 3. Update timeline/projection (simulate as a step)
      // ... (insert your recalculation logic here)
      // 4. PLAN GENERATION (OpenAI LLM logic)
      const { data: validatedLogs } = await supabase
        .from('hydration_event_validated')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_date', event_date);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();
      const { data: trajectoryData } = await supabase
        .from('projected_loss_summary')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_date', event_date)
        .order('created_at', { ascending: false })
        .limit(1);
      const { data: library } = await supabase
        .from('hydration_library')
        .select('*');
      const { data: scenarios } = await supabase
        .from('hydration_scenario_library')
        .select('*');
      let planItems = [];
      try {
        const prompt = `User Profile: ${JSON.stringify(profileData)}\nValidated Logs: ${JSON.stringify(validatedLogs)}\nTrajectory: ${JSON.stringify(trajectoryData)}\nHydration Library: ${JSON.stringify(library)}\nHydration Scenarios: ${JSON.stringify(scenarios)}\n\nBased on the above, generate an actionable hydration plan for today to help the user reach their fluid and sodium targets. Reply as a JSON array of objects with {action, reason}.`;
        const aiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: 'You are an expert hydration coach.' }, { role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 400
        });
        // Try to extract the JSON from the AI response
        const match = aiResponse.choices?.[0]?.message?.content?.match(/\[.*\]/); // Removed unsupported 's' flag for compatibility
        if (match) {
          planItems = JSON.parse(match[0]);
        } else {
          // fallback: try to parse whole response
          planItems = JSON.parse(aiResponse.choices?.[0]?.message?.content || '[]');
        }
      } catch (e) {
        // fallback to a default plan
        planItems = [
          { action: 'Drink 500ml water with lunch', reason: 'Meet fluid target' },
          { action: 'Add electrolyte tablet in afternoon', reason: 'Meet sodium target' }
        ];
      }
      const planRow = {
        user_id,
        event_date,
        recommendations: planItems,
        created_at: new Date().toISOString()
      };
      await supabase.from('plan_recommendations').insert([planRow]);
      return res.status(200).json({
        message: 'Batch logged, validated, projection recalculated, and personalized plan generated.',
        steps: [
          { step: 'batch_logged', message: `${staged.length} events logged for ${event_date}` },
          { step: 'batch_validated', message: `${staged.length} events validated.` },
          { step: 'projection_updated', message: 'Projection and plan recalculated.' },
          { step: 'plan_generated', message: 'Personalized plan generated and saved.' }
        ]
      });
    }
    // If not finalized, just log to staging
    return res.status(200).json({
      message: 'Batch logged to staging.',
      steps: [
        { step: 'batch_logged', message: `${staged.length} events logged for ${event_date}` },
        { step: 'awaiting_confirmation', message: 'Do you wish to log anything else for this time?' }
      ]
    });
  }

  if (event && event_date) {
    if (event.type === 'session_start') {
      // Check if a session_start event already exists for this user and date
      const { data: sessionExists } = await supabase
        .from('hydration_event_validated')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_date', event_date)
      // Patch: Do NOT insert session_start into event staging. Only insert into hydration_timeline below.
      // --- Hydration Timeline Initialization ---
      // 1. Check if hydration_timeline already exists for user/date
      const { data: timelineExists, error: timelineError } = await supabase
        .from('hydration_timeline')
        .select('id')
        .eq('user_id', user_id)
        .eq('event_date', event_date)
        .maybeSingle();
      if (timelineExists) {
        // Timeline already exists, do not duplicate
        return res.status(200).json({ message: 'Session started and timeline already initialized.', steps: [
          { step: 'session_start', message: `Session started for ${event_date}` }
        ] });
      }
      // 2. Fetch user profile and body composition defaults if needed
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();
      if (profileError) {
        return res.status(500).json({ error: 'Profile fetch error', details: profileError.message });
      }
      let body_fat_pct = profile.body_fat_pct;
      let lean_mass_multiplier = profile.lean_mass_multiplier;
      if ((body_fat_pct === null || body_fat_pct === undefined) || (lean_mass_multiplier === null || lean_mass_multiplier === undefined)) {
        // Fetch available body types from body_composition_lookup
        const { data: bodyTypes, error: bodyTypeError } = await supabase
          .from('body_composition_lookup')
          .select('label')
          .order('label');
        const typeOptions = bodyTypes ? bodyTypes.map((t: any) => t.label) : [];
        return res.status(200).json({
          message: 'Body composition info required',
          steps: [
            { step: 'session_start', message: `Session started for ${event_date}` },
            { step: 'awaiting_body_type', message: 'Please provide your body fat percentage, or select your body type from the list below for accurate baseline calculation.' },
            { step: 'body_type_options', message: 'Not sure? Select a body type and I’ll use the defaults for you.', options: typeOptions }
          ],
          require_body_type: true,
          body_type_options: typeOptions
        });
      }
      // 3. Calculate TBW and compartments
      const weight_kg = profile.weight || 70;
      // Patch: Calculate baseline and immediately apply baseline losses to projected_loss_summary
      const bf_pct = body_fat_pct || 22;
      const lean_mass_kg = weight_kg * (1 - bf_pct / 100);
      const tbw_l = lean_mass_kg * (lean_mass_multiplier || 0.73); // default multiplier for adults
      // Compartment splits (example):
      const icf_l = tbw_l * 0.66;
      const ecf_l = tbw_l * 0.34;
      // Baseline sodium (example):
      const baseline_na_mmol = tbw_l * 140; // 140 mmol/L typical plasma sodium
      // 4. Insert minimal session start point into hydration_timeline
      const { error: timelineInsertError } = await supabase
        .from('hydration_timeline')
        .insert([
          {
            user_id,
            day_date: event_date, // renamed for schema consistency
            hour: 0, // default to midnight session start
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
      if (timelineInsertError) {
        return res.status(500).json({ error: 'Timeline insert error', details: timelineInsertError.message });
      }

      // 5. Calculate and insert projected losses row (TBW, ICF, ISF, IVF)
      const tbw_loss_ml = Math.round(tbw_l * 0.07 * 1000);
      const icf_loss_ml = Math.round(tbw_loss_ml * 0.66);
      const ecf_loss_ml = Math.round(tbw_loss_ml * 0.34);
      const isf_loss_ml = Math.round(ecf_loss_ml * 0.75);
      const ivf_loss_ml = Math.round(ecf_loss_ml * 0.25);
      const { error: projectedLossInsertError } = await supabase
        .from('projected_loss_summary')
        .insert([
          {
            user_id,
            event_date,
            loss_stage: 'initial',
            tbw_loss_ml,
            icf_loss_ml,
            isf_loss_ml,
            ivf_loss_ml,
            calculation_basis: 'profile',
            created_at: new Date().toISOString()
          }
        ]);
      if (projectedLossInsertError) {
        return res.status(500).json({ error: 'Projected loss insert error', details: projectedLossInsertError.message });
      }
      return res.status(200).json({
        message: 'Session started, baseline hydration timeline and projected loss initialized.',
        steps: [
          { step: 'session_start', message: `Session started for ${event_date}` },
          { step: 'baseline_calculated', message: `Baseline calculated: TBW ${tbw_l.toFixed(2)} L, target ${Math.round(tbw_l * 0.07 * 1000)} mL, sodium ${baseline_na_mmol * 23} mg.` },
          { step: 'projection_initialized', message: `Baseline losses applied and projection initialized.` }
        ]
      });
    }
    // For all other event types, insert into hydration_event_staging (the scratch pad)
    else {
      // Compose the staging row
      const { type, name, amount, unit, timestamp, notes } = event;
      const { data: insertData, error: insertError } = await supabase
        .from('hydration_event_staging')
        .insert([
          {
            user_id,
            event_date,
            event_type: type,
            event_name: name,
            amount,
            unit,
            timestamp,
            notes,
            status: 'pending',
            validation_errors: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select();
      if (insertError) {
        return res.status(500).json({ error: 'Event staging insert error', details: insertError.message });
      }
      // After staging, immediately trigger validation for all pending events for this user/date
      const validateRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, event_date })
      });
      const validationResult = await validateRes.json();
      // Return both staging and validation results
      return res.status(200).json({
        message: 'Event staged and validated',
        staged_event: {
          id: insertData && insertData[0] && insertData[0].id,
          status: insertData && insertData[0] && insertData[0].status,
        },
        validation: validationResult
      });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  // Fetch user profile
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();
  if (profileError) return res.status(500).json({ error: profileError.message });

  // --- Agentic flow: No manual extraction or regex. Agent must handle all extraction and validation. ---
  // Backend does not attempt to extract or update profile fields manually.

  // --- Compose system prompt ---
  const SYSTEM_PROMPT = `
User profile (from database): ${JSON.stringify(profile)}

Hello ${profile.name || 'there'}! I'm your hydration coach agent. My job is to help you log your food, drink, and activity, and then generate a personalized hydration plan.

To get started, I need to confirm some details about you. Here is the information I have so far:

{
  "name": "${profile.name || 'unknown'}",
  "height": "${profile.height || 'unknown'}",
  "weight": "${profile.weight || 'unknown'}"
}

Can you confirm these details are correct? If not, please provide corrections.

If any of these details are missing, please provide them so I can better assist you.

Once I have this information, I'll help you log your intake and activity, and then generate a personalized hydration plan.

Rules:
- Only ask for information that is missing from the above user profile or logs. Never ask for data you already have.
- If you have all required data, proceed to generate the plan.

1. Calculations & Baselines
- Daily Hydration Target:
  - Use: target_ml = 35 mL × body_mass_kg (fallback: 2,500 mL if unknown)
- Sweat Rate:
  - Use a lookup table for sweat rates by activity and weather.
  - For indoor cycling at 22 °C, use 0.8 L/h unless the user provides a personal rate.
- Sodium Target:
  - Use: 1500 mg/day baseline unless the user provides a custom target.
- Sodium Gap:
  - Always calculate and display sodium gap: Na_gap = sodium_target - sodium_intake
  - If |Na_gap| ≥ 50 mg, include a numeric sodium recommendation.

2. Output Structure (for UI Cards)
Always output the hydration plan as a JSON object with these keys:
{
  "plan": {
    "hydration_target_ml": 2800,
    "current_progress_ml": 1100,
    "progress_percent": 39,
    "extra_needed_ml": 1700,
    "sodium_gap_mg": 1300,
    "status": "1.1 L in, 0.6 L out → net +0.5 L (40 % of 2.8 L goal)",
    "electrolytes": "+185 mg in / 1500 mg goal → need ≈ 1.3 g more today",
    "plan": "500 mL water next hour, +500 mg Na with lunch, +1.2 L water later",
    "advice": "Powered by osmole math—hydrate before thirst sneaks up"
  }
}
- All numbers must be calculated using the above rules.
- Do not guess or use vague ranges.
- If any required input is missing, ask the user for it before proceeding.

3. Chat Explanation
After the card, provide a brief explanation in plain language:
- Summarize why these recommendations were made (e.g., “Based on your activity and intake, you need more water and sodium to reach your daily targets. The plan above ensures you stay hydrated and balanced.”)
- If assumptions were made (e.g., fallback targets), state them clearly.

4. Formatting
- Always output the plan card JSON, then the scratchpad, then a plain-language explanation.
- Example:
  {
    "plan": { ... }
  }
  ---
  Scratchpad:
  - Calculate net fluid balance: 1.1 L in - 0.6 L out = 0.5 L net
  - Calculate sodium balance: 1500 mg goal - 185 mg in = 1315 mg gap
  - Estimate sweat and sodium loss for activities: 0.8 L/h × 1 h = 0.8 L sweat, 500 mg sodium loss
  - Update plan accordingly
  ---
  Based on your intake and activity, here’s your hydration plan. You’re about 40% to your target, with a sodium gap of 1.3g. Follow the plan above for optimal hydration.

5. Determinism
- Always use the fixed sweat-rate and baseline formulas unless user data overrides them.
- Never invent new baselines or targets.
`;

  // Compose messages for OpenAI
  const chatHistory = (history || []).map((msg: any) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory,
    ...(message ? [{ role: 'user', content: message }] : [])
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.6,
    });
    const aiText = completion.choices[0]?.message?.content || '';
    let plan = null, ui = null, aiMessages = [], profile_updates = null;
    try {
      const json = JSON.parse(aiText);
      plan = json.plan || null;
      ui = json.ui || null;
      aiMessages = json.messages || [{ sender: 'assistant', text: json.text || aiText }];
      profile_updates = json.profile_updates || null;
      // If agent provides profile_updates, persist them
      if (profile_updates && Object.keys(profile_updates).length > 0) {
        await supabase.from('profiles').update(profile_updates).eq('id', user_id);
        // Optionally, re-fetch profile if you want to return it
      }
    } catch {
      aiMessages = [{ sender: 'assistant', text: aiText }];
    }
    return res.status(200).json({ messages: aiMessages, plan, ui });
  } catch (e: any) {
    return res.status(500).json({ error: 'OpenAI error', details: e.message });
  }
}
