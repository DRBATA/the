import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="group relative overflow-hidden bg-blue-600/20 border border-blue-400/30 text-cyan-50 px-7 py-3.5 rounded-xl text-lg font-medium flex items-center justify-center backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 40px rgba(37, 99, 235, 0.3)",
        borderColor: "rgba(96, 165, 250, 0.5)",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type="button"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/40 to-transparent"></div>
      <LogIn className="h-5 w-5 mr-3 text-yellow-200" />
      <span className="relative z-10">Log In</span>
    </motion.button>
  );
}
