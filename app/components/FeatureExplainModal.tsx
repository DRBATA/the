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
    <div className="overlay" style={{ inset: "0", zIndex: "50", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "var(--black-60)" }}>
      <div
        className={`relative w-full max-w-xs p-8 rounded-2xl shadow-2xl border-4 border-blue-400 bg-white/90`}
        style={{ overflow: "hidden", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* Subtle white overlay for text contrast */}
        <div className="overlay" style={{ inset: "0", backgroundColor: "var(--white-80)", zIndex: "0" }} />
        {/* Neon Mosaic SVG pattern for ALL modals */}
        <svg
          className="overlay" style={{ inset: "0", width: "100%", height: "100%", opacity: "0.2", pointerEvents: "none", zIndex: "0" }}
          viewBox="0 0 320 320"
          fill="none"
        >
          <defs>
            <pattern id="mosaic-feature" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="white" fillOpacity="0.0" />
              <polygon points="20,0 40,20 20,40 0,20" fill="var(--primary-blue)" fillOpacity="0.5" />
              <circle cx="20" cy="20" r="8" fill="#fff" fillOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="320" height="320" fill="url(#mosaic-feature)" />
        </svg>
        <button
          className="btn" style={{ position: "absolute", top: "1.5rem", right: "1.5rem", fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-blue)", cursor: "pointer" }}
          onClick={onInfoClose || onClose}
        >
          ×
        </button>
        <h2
          className="text-2xl font-bold mb-4 text-center drop-shadow-lg" style={{ color: "var(--primary-blue-dark)" }}
        >
          {title}
        </h2>
        <p className="text-gray-800 text-center text-base drop-shadow-sm">{description}</p>

      </div>
    </div>
  );
}
