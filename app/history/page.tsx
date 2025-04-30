"use client";
import { useEffect, useState } from "react";
import { useHydration } from "../../contexts/hydration-context";
import FloatingBubbles from "../components/FloatingBubbles";

// Define HydrationLog type
interface HydrationLog {
  timestamp: string;
  drink_type: string;
  volume_ml: number;
}

export default function HistoryPage() {
  const { hydration } = useHydration();
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const userId = hydration?.userId;
      if (!userId) {
        setLogs([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/hydration?user_id=${userId}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    }
    fetchLogs();
  }, [hydration?.totalVolume]);

  // Get userId from Supabase session
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    import("../../lib/supabaseClient").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUserId(session?.user?.id ?? null);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Hydration History</h1>
      <button className="btn mb-6" onClick={() => setShowDrinkModal(true)}>Add Drink</button>
      {showDrinkModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <DrinkTracker onCompleteAction={() => setShowDrinkModal(false)} dragProgress={0} />
            <button className="btn mt-4" onClick={() => setShowDrinkModal(false)}>Close</button>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : !userId ? (
        <div className="text-blue-700 mb-4">User not found. Please log in to view your hydration history.</div>
      ) : logs.length === 0 ? (
        <div className="text-blue-700 mb-4">No hydration logs yet. Start logging drinks!</div>
      ) : (
        <table className="w-full max-w-2xl bg-white/80 rounded-xl shadow p-4">
          <thead>
            <tr className="text-blue-700 font-semibold">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Drink Type</th>
              <th className="px-4 py-2">Volume (ml)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="text-center border-b border-blue-100">
                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2">{log.drink_type}</td>
                <td className="px-4 py-2">{log.volume_ml}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
