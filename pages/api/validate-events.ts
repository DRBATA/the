import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// POST: Validates and enriches all pending staged events for a user/date, moves them to validated table, and clears them from staging
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, event_date } = req.body;
  if (!user_id || !event_date) return res.status(400).json({ error: 'Missing user_id or event_date' });

  // 1. Fetch all pending events for this user/date from staging
  const { data: stagedEvents, error: fetchError } = await supabase
    .from('hydration_event_staging')
    .select('*')
    .eq('user_id', user_id)
    .eq('event_date', event_date)
    .eq('status', 'pending');
  if (fetchError) return res.status(500).json({ error: 'Failed to fetch staged events', details: fetchError.message });
  if (!stagedEvents || stagedEvents.length === 0) return res.status(200).json({ message: 'No pending events to validate.' });

  // 2. Validate/enrich each event using input_library and hormone_mechanism_library
  const validatedRows: any[] = [];
  const errors: any[] = [];

  for (const event of stagedEvents) {
    let inputRow = null;
    let hormoneProfile = null;
    let status = 'validated';
    let validation_errors = null;
    let sodium_mg = null, potassium_mg = null, osmole_score = null, hydration_effect = null, hormone_effects = null, sweat_loss_ml = null;

    // Lookup input_library by event_name
    let { data: inputMatch, error: inputErr } = await supabase
      .from('input_library')
      .select('*')
      .ilike('name', event.event_name)
      .single();
    if (!inputMatch) {
      // Attempt AI fallback enrichment if not found in input_library
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are a hydration event enrichment agent. Given a user event, return a structured object with event_type, sodium_mg, potassium_mg, osmole_score, hydration_effect, sweat_loss_ml, and any relevant hormone_effects. If you cannot enrich, reply with {"error": "unmatched"}.' },
              { role: 'user', content: `Event: ${JSON.stringify(event)}` }
            ],
            temperature: 0.2
          })
        });
        const aiJson = await aiResponse.json();
        const aiContent = aiJson.choices && aiJson.choices[0] && aiJson.choices[0].message && aiJson.choices[0].message.content ? aiJson.choices[0].message.content : null;
        let aiEnriched: any = null;
        try { aiEnriched = aiContent ? JSON.parse(aiContent) : null; } catch {}
        if (aiEnriched && !aiEnriched.error) {
          // Use AI-enriched values
          sodium_mg = aiEnriched.sodium_mg;
          potassium_mg = aiEnriched.potassium_mg;
          osmole_score = aiEnriched.osmole_score;
          hydration_effect = aiEnriched.hydration_effect;
          sweat_loss_ml = aiEnriched.sweat_loss_ml;
          hormone_effects = aiEnriched.hormone_effects;
          status = 'validated';
        } else {
          status = 'error';
          validation_errors = { missing: 'No reference found for event_name in input_library or via AI fallback' };
          errors.push({ id: event.id, event_name: event.event_name, error: validation_errors });
        }
      } catch (e) {
        status = 'error';
        validation_errors = { missing: 'No reference found for event_name in input_library and AI fallback failed', details: e instanceof Error ? e.message : e };
        errors.push({ id: event.id, event_name: event.event_name, error: validation_errors });
      }
    } else {
      sodium_mg = inputMatch.ivf?.Na ?? null;
      potassium_mg = inputMatch.ivf?.K ?? null;
      osmole_score = inputMatch.ivf?.osmoles ?? null;
      hydration_effect = inputMatch.category === 'drink' ? (inputMatch.ivf?.effect ?? null) : null;
      sweat_loss_ml = event.event_type === 'activity' ? inputMatch.ivf?.sweat_loss_ml ?? null : null;
      // Hormone enrichment (if hormones field exists)
      if (inputMatch.hormones && Array.isArray(inputMatch.hormones) && inputMatch.hormones.length > 0) {
        const { data: hormoneRows } = await supabase
          .from('hormone_mechanism_library')
          .select('*')
          .in('hormone', inputMatch.hormones.map((h: any) => h.name));
        hormone_effects = hormoneRows || null;
      }
    }
    if (status === 'validated') {
      validatedRows.push({
        user_id: event.user_id,
        event_date: event.event_date,
        event_type: event.event_type,
        event_name: event.event_name,
        amount: event.amount,
        unit: event.unit,
        timestamp: event.timestamp,
        notes: event.notes,
        sodium_mg,
        potassium_mg,
        osmole_score,
        hydration_effect,
        sweat_loss_ml,
        hormone_effects,
        validation_source: 'AI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      // Mark as error in staging
      await supabase
        .from('hydration_event_staging')
        .update({ status: 'error', validation_errors })
        .eq('id', event.id);
    }
  }

  // 3. Insert validated events into hydration_event_validated
  if (validatedRows.length > 0) {
    const { error: insertError } = await supabase
      .from('hydration_event_validated')
      .insert(validatedRows);
    if (insertError) return res.status(500).json({ error: 'Failed to insert validated events', details: insertError.message });
    // 4. Delete the validated events from staging
    const stagedIds = validatedRows.map(ev => ev.id);
    const { error: deleteError } = await supabase
      .from('hydration_event_staging')
      .delete()
      .in('id', stagedIds);
    if (deleteError) return res.status(500).json({ error: 'Failed to clear staged events', details: deleteError.message });
  }

  return res.status(200).json({ message: 'Events validated and moved to validated table.', count: validatedRows.length, errors });
}
