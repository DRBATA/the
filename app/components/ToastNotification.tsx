"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    success: <CheckCircle className="h-5 w-5 text-emerald" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-logo-cyan" />, // default colours
  }[type];

  const bg = {
    success: "bg-emerald/10 border-emerald/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-logo-cyan/10 border-logo-cyan/20",
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-lg backdrop-blur-md ${bg} border shadow-lg flex items-center`}
    >
      <div className="mr-3">{icon}</div>
      <p className="text-white text-sm max-w-xs break-words">{message}</p>
      <button onClick={onClose} className="ml-3 text-white/70 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  // Expose global helpers
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as WindowWithToast).showToast = (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      return id;
    };
    (window as WindowWithToast).hideToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    return () => {
      delete (window as WindowWithToast).showToast;
      delete (window as WindowWithToast).hideToast;
    };
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, message, type }) => (
          <div key={id} className="pointer-events-auto">
            <Toast message={message} type={type} onClose={() => remove(id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

type WindowWithToast = Window & typeof globalThis & {
  showToast?: (message: string, type?: ToastType) => string;
  hideToast?: (id: string) => void;
};

declare global {
  interface Window {
    showToast?: (message: string, type?: ToastType) => string;
    hideToast?: (id: string) => void;
  }
}
