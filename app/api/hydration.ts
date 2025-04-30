import type { NextApiRequest, NextApiResponse } from 'next';

import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, fluid_ml, drink_type } = req.body;
    if (!user_id || !fluid_ml || !drink_type) {
      res.status(400).json({ error: 'Missing user_id, fluid_ml, or drink_type' });
      return;
    }
    const { error, data } = await supabase
      .from('hydration_logs')
      .insert({ user_id, volume_ml: fluid_ml, drink_type, timestamp: new Date().toISOString() });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ status: 'success', event: data });
  } else if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id || Array.isArray(user_id)) {
      res.status(400).json({ error: 'Missing or invalid user_id' });
      return;
    }
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('volume_ml, drink_type, timestamp')
      .eq('user_id', user_id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const total = data.reduce((sum, e) => sum + (e.volume_ml || 0), 0);
    res.status(200).json({ hydration_level: `${total} ml`, logs: data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
