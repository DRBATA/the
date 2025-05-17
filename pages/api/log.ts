import type { NextApiRequest, NextApiResponse } from 'next';

// Dummy log handler (expand to persist/log in DB)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Accepts { type, data } and returns success (expand for real logging)
  const { type, data } = req.body;
  // TODO: Save to DB and recalc plan
  res.status(200).json({ success: true, message: `Logged ${type}` });
}
