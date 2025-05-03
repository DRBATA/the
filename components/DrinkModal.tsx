"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DRINKS = [
  { id: "water", icon: "💧", name: "Water" },
  { id: "sport", icon: "🥤", name: "Sports Drink" },
  { id: "salt", icon: "🧂", name: "Salt Water" },
];

export default function DrinkModal({ open, onClose, onSave }) {
  const [selected, setSelected] = useState(null);
  const [volume, setVolume] = useState(250);
  const [electrolyte, setElectrolyte] = useState(false);

  const handleSave = () => {
    if (selected) onSave({ drink_type: selected, volume_ml: volume, electrolyte_support: electrolyte });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-300 shadow-lg relative max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 18 }}
          >
            <button className="absolute top-3 right-3 text-cyan-300 text-2xl" onClick={onClose}>
              ×
            </button>
            <h2 className="text-cyan-300 text-xl mb-4 neon-text">Log a Drink</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 justify-center mb-2">
                {DRINKS.map(d => (
                  <button
                    key={d.id}
                    className={`text-3xl px-3 py-1 rounded-full border-2 ${selected === d.id ? "border-cyan-400 bg-white/30" : "border-cyan-200 bg-white/10"}`}
                    onClick={() => setSelected(d.id)}
                  >
                    {d.icon}
                  </button>
                ))}
              </div>
              <input
                className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400"
                type="number"
                min={50}
                step={50}
                placeholder="Volume (ml)"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
              />
              <label className="flex gap-2 items-center text-cyan-900">
                <input type="checkbox" checked={electrolyte} onChange={e => setElectrolyte(e.target.checked)} />
                Electrolyte support
              </label>
            </div>
            <button className="mt-6 w-full py-2 rounded bg-cyan-400 text-white neon-text font-bold" onClick={handleSave}>
              Log Drink
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
