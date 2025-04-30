import { createContext, useContext, useState, useCallback } from "react";

export interface HydrationState {
  totalVolume: number; // ml
  targetVolume: number; // ml
  co2Saved: number; // grams
  lastDrink?: { volume: number; time: string };
}

interface HydrationContextType {
  hydration: HydrationState;
  logDrink: (volume: number) => void;
  resetHydration: () => void;
}

const defaultHydration: HydrationState = {
  totalVolume: 0,
  targetVolume: 2000, // default 2L
  co2Saved: 0
};

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [hydration, setHydration] = useState<HydrationState>(defaultHydration);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch today's hydration from Supabase
  const fetchHydration = useCallback(async (uid: string) => {
    const res = await fetch(`/api/hydration?user_id=${uid}`);
    const data = await res.json();
    const total = parseInt((data.hydration_level || '0').replace(' ml', ''));
    setHydration((prev) => ({
      ...prev,
      totalVolume: total,
      lastDrink: data.logs && data.logs.length > 0 ? { volume: data.logs[data.logs.length-1].volume_ml, time: data.logs[data.logs.length-1].timestamp } : prev.lastDrink
    }));
  }, []);

  // Get user id from session
  useEffect(() => {
    (async () => {
      const { data: { session } } = await import('../lib/supabaseClient').then(m => m.supabase.auth.getSession());
      if (session?.user?.id) {
        setUserId(session.user.id);
        fetchHydration(session.user.id);
      }
    })();
  }, [fetchHydration]);

  // Log drink via API and refresh state
  const logDrink = useCallback(async (volume: number) => {
    if (!userId) return;
    await fetch('/api/hydration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, fluid_ml: volume, drink_type: 'Water' })
    });
    fetchHydration(userId);
  }, [userId, fetchHydration]);

  const resetHydration = useCallback(() => setHydration(defaultHydration), []);

  return (
    <HydrationContext.Provider value={{ hydration, logDrink, resetHydration }}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  const ctx = useContext(HydrationContext);
  if (!ctx) throw new Error("useHydration must be used within a HydrationProvider");
  return ctx;
}
