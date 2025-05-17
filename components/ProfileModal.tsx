"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// If not already installed, run: npm install react-datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



export default function ProfileModal({ open, userId, onClose, onSave, initialProfile }: { open: boolean; userId: string; onClose: () => void; onSave: (profile: any) => void; initialProfile?: any }) {
  const [dob, setDob] = useState(initialProfile?.date_of_birth ? new Date(initialProfile.date_of_birth) : null);
  const [error, setError] = useState("");
  const [age, setAge] = useState<number|null>(null);

  const handleSave = () => {
    if (dob) {
      // Save full date
      const birthDate = dob instanceof Date ? dob : new Date(dob);
      const today = new Date();
      let calcAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calcAge--;
      setError("");
      setAge(calcAge);
      onSave({
        date_of_birth: birthDate.toISOString().slice(0, 10),
        birthdate_is_exact: true
      });
    } else {
      setError("Please enter your date of birth.");
      return;
    }
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
  {dob && (
  <div className="mb-2 text-cyan-800 text-center font-semibold">
    Selected: {dob.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
)}
<DatePicker
  selected={dob}
  onChange={date => setDob(date)}
  dateFormat="yyyy-MM-dd"
  showMonthDropdown
  showYearDropdown
  dropdownMode="select"
  maxDate={new Date()}
  placeholderText="Select date..."
  customInput={
    <button
      type="button"
      className="rounded px-3 py-2 bg-white/40 text-cyan-900 placeholder-cyan-400 w-full border-2 border-cyan-300 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400"
      style={{ minHeight: 40 }}
    >
      {dob ? dob.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select date...'}
    </button>
  }
/>
{error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}


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
