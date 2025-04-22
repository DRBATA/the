"use client";
import { ReactNode } from "react";

export default function BottomSheet({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Sheet */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-0 z-50 w-[90vw] max-w-2xl bg-white/50 backdrop-blur-lg border-t border-white/30 rounded-t-2xl shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ minHeight: 100, maxHeight: '40vh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute top-3 right-5 text-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close info panel"
        >
          ×
        </button>
        <div className="p-6 pt-10">{children}</div>
      </div>
    </>
  );
}
