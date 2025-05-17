import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET: fetch the latest plan for a user/date
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, event_date } = req.query;
  if (!user_id || !event_date) return res.status(400).json({ error: 'user_id and event_date required' });
  const { data, error } = await supabase
    .from('plan_recommendations')
    .select('*')
    .eq('user_id', user_id)
    .eq('event_date', event_date)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ plan: data?.[0] || null });
}
