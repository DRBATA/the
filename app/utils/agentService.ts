// app/utils/agentService.ts
import type { Message } from "../components/HydrationChat";

const MASTER_AGENT_API_URL = "/api/master-agent";

export async function processMessage(input: string, userContext: any = {}): Promise<{ response: string, toolCalls?: any[] }> {
  try {
    const { userId, lat, lon } = userContext;
    const res = await fetch(MASTER_AGENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input, userId, lat, lon }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return { response: data.response || data.result || "[No response from agent]", toolCalls: data.toolCalls };
  } catch (error: any) {
    console.error("Error in processMessage:", error);
    return { response: "Sorry, there was a problem contacting the hydration assistant.", toolCalls: [] };
  }
}

// Stub for image analysis (to be routed to drinks agent, etc.)
export async function analyzeImage(imageBase64: string): Promise<string> {
  // TODO: Implement actual API call to drinks agent for image analysis
  return "[Image analysis not yet implemented]";
}
