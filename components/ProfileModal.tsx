"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileModal({ open, onClose, onSave, initialProfile }) {
  const [height, setHeight] = useState(initialProfile?.height_cm || "");
  const [weight, setWeight] = useState(initialProfile?.weight_kg || "");
  const [sex, setSex] = useState(initialProfile?.sex || "");
  const [dob, setDob] = useState(initialProfile?.date_of_birth || "");

  const handleSave = () => {
    onSave({ height_cm: height, weight_kg: weight, sex, date_of_birth: dob });
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
            <h2 className="text-cyan-300 text-xl mb-4 neon-text">Complete Your Profile</h2>
            <div className="flex flex-col gap-3">
              <input className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} />
              <input className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
              <input className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400" placeholder="Sex" value={sex} onChange={e => setSex(e.target.value)} />
              <input className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400" placeholder="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <button className="mt-6 w-full py-2 rounded bg-cyan-400 text-white neon-text font-bold" onClick={handleSave}>
              Save
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
