import React, { useEffect } from "react";

interface RefillFactToastProps {
  fact: string;
  show: boolean;
  onClose: () => void;
}

const RefillFactToast: React.FC<RefillFactToastProps> = ({ fact, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white text-black rounded-xl shadow-xl px-6 py-4 text-lg font-semibold animate-pop pointer-events-auto border-2 border-blue-500">
        <span role="img" aria-label="burst" className="mr-2">💥</span>
        {fact}
      </div>
    </div>
  );
};

export default RefillFactToast;
