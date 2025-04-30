"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, X, RefreshCw } from "lucide-react";
import { waterRefillStations } from "@/lib/waterRefillStations";

interface RefillTrackerProps {
  onCompleteAction: (confirmed: boolean, stationName?: string) => void;
  dragProgress: number;
}

export default function RefillTracker({ onCompleteAction, dragProgress }: RefillTrackerProps) {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selectedStation) {
      // Log the refill as an activity (if desired)
      const log = {
        timestamp: new Date().toISOString(),
        activity: "Refill",
        intensity: "Low",
        duration_min: 1,
        notes: `Refilled at ${selectedStation}`,
      };
      // TODO: Call your new orchestration endpoint or Supabase directly here to log activity
      // Example (pseudo): await supabase.from('activity_logs').insert({ ...log, user_id });
      // Or use your orchestration endpoint via fetch('/api/chat', ...)
      // logActivity(log /*, userId if available */);
      setConfirmed(true);
      setTimeout(() => {
        const station = waterRefillStations.find((s) => s.name === selectedStation);
        onCompleteAction(true, station?.name);
      }, 1000);
    }
  };

  const handleCancel = () => {
    onCompleteAction(false);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background that becomes more visible as you drag up */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: Math.min(dragProgress, 1) }}
      />
      {/* Refill station UI */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-auto px-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{
          opacity: dragProgress >= 0.7 ? 1 : dragProgress / 0.7,
          y: 100 - dragProgress * 100,
        }}
      >
        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="confirmed"
              className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl text-white font-medium mb-2">Refill Logged!</h2>
              <p className="text-white/80">Thank you for using a refill station and saving plastic.</p>
              <div className="mt-4 text-white/70 text-sm">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                <span>Processing...</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              className="bg-white/20 backdrop-blur-md rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-white font-medium">Log Refill Station Visit</h2>
                <button
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {waterRefillStations.map((station) => (
                  <motion.button
                    key={station.name}
                    className={`w-full flex items-center p-3 rounded-lg ${
                      selectedStation === station.name
                        ? "bg-blue-600/50 border border-white/40"
                        : "bg-white/10 border border-white/20"
                    }`}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStation(station.name)}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm">{station.name}</span>
                    {selectedStation === station.name && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <motion.button
                className={`w-full py-3 rounded-lg ${
                  selectedStation ? "bg-blue-500/60 text-white" : "bg-white/10 text-white/50"
                }`}
                whileHover={selectedStation ? { scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.7)" } : {}}
                whileTap={selectedStation ? { scale: 0.98 } : {}}
                onClick={handleConfirm}
                disabled={!selectedStation}
              >
                Confirm Refill
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
