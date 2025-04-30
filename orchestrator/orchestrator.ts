// Orchestrator for routing user chat input to hydration and drinks agents
import { handleHydration } from '../agents/hydration/hydration_tools_impl';
import { handleDrink } from '../agents/drinks/drinks_tools_impl';

export async function handleUserInput(input: string, userContext: any) {
  if (/weather|humidity|temperature|forecast/i.test(input)) {
    // Expect userContext to have lat, lon, user_id
    const { user_id, lat, lon } = userContext || {};
    if (typeof lat === 'number' && typeof lon === 'number' && user_id) {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, lat, lon })
      });
      const data = await res.json();
      if (data.temperature && data.humidity) {
        return `Current temp: ${data.temperature}°C, humidity: ${data.humidity}%`;
      } else {
        return `Could not fetch weather. ${data.error || ''}`;
      }
    } else {
      return 'Location or user info missing for weather lookup.';
    }
  }
  if (/water|hydrate|refill/i.test(input)) {
    return await handleHydration(input, userContext);
  }
  if (/coffee|juice|drink|tea|soda/i.test(input)) {
    return await handleDrink(input, userContext);
  }
  return "Sorry, I didn't understand. Try asking about water, drinks, or weather!";
}
