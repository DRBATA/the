import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Helper: extract user id from Supabase session (mock for local dev)
async function getUserId(req: NextApiRequest) {
  // For local dev, allow user_id to be passed in body for testing
  if (req.body.user_id) return req.body.user_id;
  // In production, extract from Supabase Auth (cookie/JWT)
  // ... (implement as needed for your app)
  // For now, return null if not present
  return null;
}

// Helper: load greeting knowledge base (sync for simplicity)
function loadGreetingKB() {
  const kbPath = path.resolve(process.cwd(), 'lib', 'knowledge_base_1.md');
  const md = readFileSync(kbPath, 'utf-8');
  // Extract the first JSON block (greeting engine)
  const match = md.match(/```jsonc([\s\S]*?)```/);
  if (!match) return null;
  try {
    // Remove comments and parse JSON
    const json = match[1].replace(/\/\/.*$/gm, '');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Helper: pick random item
function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, tone, greet, user_id } = req.body;
  let resolvedUserId = user_id;
  if (!resolvedUserId) {
    resolvedUserId = await getUserId(req);
  }
  if (!name && !resolvedUserId) return res.status(400).json({ error: 'Name or user_id required' });

  // 1. Save or upsert preference
  if (name && tone && !greet) {
    // Update profiles table for the user
    if (!resolvedUserId) return res.status(400).json({ error: 'user_id required' });
    const { error } = await supabase
      .from('profiles')
      .update({ name, tone })
      .eq('id', resolvedUserId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // 2. Fetch preference and generate greeting
  if (greet) {
    let profileRow = null;
    if (resolvedUserId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, tone')
        .eq('id', resolvedUserId)
        .single();
      if (error || !data) return res.status(404).json({ error: 'No profile found for user' });
      profileRow = data;
    } else if (name) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, tone')
        .eq('name', name)
        .single();
      if (error || !data) return res.status(404).json({ error: 'No profile found for name' });
      profileRow = data;
    }
    if (!profileRow) return res.status(404).json({ error: 'No profile found' });

    // Load greeting engine structure
    const kb = loadGreetingKB();
    if (!kb) return res.status(500).json({ error: 'Knowledge base not found or invalid' });
    const vars = {
      name: profileRow.name || 'friend',
      tempC: '—',
      rh: '—',
      hydrPct: '—',
    };
    // Compose greeting
    const greeting = [
      pick(kb.openingLines).replace('{name}', vars.name),
      pick(kb.contextBlips)
        .replace('{hydrPct}', vars.hydrPct)
        .replace('{tempC}', vars.tempC)
        .replace('{rh}', vars.rh),
      pick(kb.barristaPitch),
      pick(kb.promptFollowUps),
    ]
      .filter(Boolean)
      .join(' ');
    return res.status(200).json({ greeting, name: profileRow.name, tone: profileRow.tone });
  }

  return res.status(400).json({ error: 'Invalid request' });
}
