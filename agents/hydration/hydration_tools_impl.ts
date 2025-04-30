export async function handleHydration(
  input: string,
  userContext: { user_id?: string }
): Promise<string> {
  const user_id = userContext.user_id;
  if (!user_id) {
    return 'User context missing; cannot log hydration.';
  }

  // Parse milliliters from input
  const match = input.match(/(\d+)\s*(?:ml|mL)\b/);
  if (!match) {
    return 'Please specify how many milliliters you drank, e.g. "I drank 250ml of water".';
  }
  const fluid_ml = parseInt(match[1], 10);

  try {
    // Log hydration event
    await fetch('/api/hydration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, fluid_ml, drink_type: 'water' }),
    });

    // Fetch updated hydration status
    const statusRes = await fetch(`/api/hydration?user_id=${encodeURIComponent(user_id)}`);
    const statusData = await statusRes.json();
    return `Logged ${fluid_ml}ml of water. Your total today is ${statusData.hydration_level}.`;
  } catch (err: any) {
    return `Error logging hydration: ${err.message}`;
  }
}
