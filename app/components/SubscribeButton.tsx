import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SubscribeButton({ onClick, subscribed }: { onClick: () => void, subscribed?: boolean }) {
  return (
    <motion.button
      className="group relative overflow-hidden bg-gradient-to-r from-cyan-800/30 to-yellow-400/20 border border-cyan-600/30 text-cyan-50 px-7 py-3.5 rounded-xl text-lg font-medium flex items-center justify-center backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 40px rgba(8, 145, 178, 0.3)",
        borderColor: "rgba(252, 211, 77, 0.5)",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type="button"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/10 to-yellow-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"></div>
      <Sparkles className="h-5 w-5 mr-3 text-yellow-200" />
      <span className="relative z-10">{subscribed ? "Subscribed" : "Subscribe Now"}</span>
    </motion.button>
  );
}
