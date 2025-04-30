// Next.js API route for weather agent integration
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { user_id, lat, lon } = req.body;
  if (!user_id || typeof lat !== 'number' || typeof lon !== 'number') {
    res.status(400).json({ error: 'Missing user_id, lat, or lon' });
    return;
  }
  // Call Python weather_tools_impl.py via child_process
  const scriptPath = path.resolve(process.cwd(), 'agents/weather/weather_tools_impl.py');
  const py = spawn('python', [scriptPath, user_id, lat, lon]);
  let result = '';
  let error = '';
  py.stdout.on('data', (data) => { result += data.toString(); });
  py.stderr.on('data', (data) => { error += data.toString(); });
  py.on('close', (code) => {
    if (code !== 0) {
      res.status(500).json({ error: error || 'Weather agent error' });
    } else {
      try {
        const parsed = JSON.parse(result);
        res.status(200).json(parsed);
      } catch (e) {
        res.status(200).json({ result });
      }
    }
  });
}
