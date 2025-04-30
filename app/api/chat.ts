// API route for orchestrator (Next.js API route style)
import type { NextApiRequest, NextApiResponse } from 'next';
import { handleUserInput } from '../../orchestrator/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, userContext } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Missing message' });
    return;
  }

  try {
    const response = await handleUserInput(message, userContext || {});
    res.status(200).json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
