import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Query param: type=drink|food|activity|supplement|all
  const { type = 'all' } = req.query;
  let query = supabase.from('hydration_library').select('*');
  if (type !== 'all') {
    query = query.eq('category', type);
  }
  const { data, error } = await query.order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ items: data });
}
