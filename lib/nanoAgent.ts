// This is a sample client for your nano agent/LLM API.
// Replace the URL and logic with your actual nano agent endpoint and API key if needed.

export async function callNanoAgent({ systemPrompt, userMessage, history }: {
  systemPrompt: string;
  userMessage: string;
  history: any[];
}) {
  // Example: POST to your nano agent API
  const response = await fetch(process.env.NANO_AGENT_URL || 'http://localhost:5000/api/nano', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer YOUR_API_KEY', // If needed
    },
    body: JSON.stringify({
      systemPrompt,
      userMessage,
      history,
    }),
  });
  if (!response.ok) throw new Error('Nano agent API error');
  return await response.json();
}
