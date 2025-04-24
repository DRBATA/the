interface FeatureExplainModalProps {
  open: boolean;
  onClose: () => void;
  feature: string | null;
  onInfoClose?: () => void;
}

export default function FeatureExplainModal({ open, onClose, feature, onInfoClose }: FeatureExplainModalProps) {
  if (!open) return null;

  let title = "";
  let description = "";
  switch (feature) {
    case "findRefill":
      title = "Find Refill Stations";
      description = "Discover interesting places around Dubai where you can refill your water bottle. Log in to save your favorite spots and track your refill journey!";
      break;
    case "getRefill":
      title = "Get a Refill";
      description = "Track how much plastic you've saved and unlock fun facts every time you refill. Log in to start tracking your impact and celebrate your progress!";
      break;
    case "signatureEvent":
      title = "Signature Event";
      description = "Buy tickets and view your event access. Log in to purchase and manage your tickets for exclusive events!";
      break;
    case "subscribe":
      title = "Subscribe";
      description = "Subscribe for unlimited refills and exclusive perks. Log in to activate your subscription and unlock premium benefits!";
      break;
    default:
      title = "Feature";
      description = "Log in to access this feature.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`relative w-full max-w-xs p-8 rounded-2xl shadow-2xl border-4 ${
          feature === "findRefill"
            ? "border-teal-400"
            : feature === "getRefill"
            ? "border-emerald-400"
            : feature === "subscribe"
            ? "border-yellow-300"
            : feature === "signatureEvent"
            ? "border-lime-400"
            : "border-blue-400"
        } bg-white/90`}
        style={{ overflow: "hidden", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* Subtle white overlay for text contrast */}
        <div className="absolute inset-0 bg-white/80 z-0" />
        {/* Neon Mosaic SVG pattern for ALL modals */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0"
          viewBox="0 0 320 320"
          fill="none"
        >
          <defs>
            <pattern id="mosaic-feature" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="white" fillOpacity="0.0" />
              <polygon points="20,0 40,20 20,40 0,20" fill={feature === "findRefill" ? "#2dd4bf" : feature === "getRefill" ? "#34d399" : feature === "subscribe" ? "#facc15" : feature === "signatureEvent" ? "#bef264" : "#38bdf8"} fillOpacity="0.5" />
              <circle cx="20" cy="20" r="8" fill="#fff" fillOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="320" height="320" fill="url(#mosaic-feature)" />
        </svg>
        <button
          className={`absolute top-4 right-6 text-2xl font-bold transition-colors z-10 ${
            feature === "findRefill"
              ? "text-teal-400 hover:text-teal-600"
              : feature === "getRefill"
              ? "text-emerald-400 hover:text-emerald-600"
              : feature === "subscribe"
              ? "text-yellow-300 hover:text-yellow-500"
              : feature === "signatureEvent"
              ? "text-lime-400 hover:text-lime-600"
              : "text-blue-400 hover:text-blue-600"
          }`}
          onClick={onInfoClose || onClose}
        >
          ×
        </button>
        <h2
          className={`text-2xl font-bold mb-4 text-center drop-shadow-lg z-10 ${
            feature === "findRefill"
              ? "text-teal-500"
              : feature === "getRefill"
              ? "text-emerald-500"
              : feature === "subscribe"
              ? "text-yellow-500"
              : feature === "signatureEvent"
              ? "text-lime-500"
              : "text-blue-500"
          }`}
        >
          {title}
        </h2>
        <p className="mb-8 text-gray-800 text-center text-base z-10 drop-shadow-sm">{description}</p>

      </div>
    </div>
  );
}
