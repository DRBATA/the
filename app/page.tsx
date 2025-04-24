"use client";
import { useState } from "react";
import Image from "next/image";
import AttendeeModal from "./components/AttendeeModal";
import FindRefillButton from "./components/FindRefillButton";
import GetRefillButton from "./components/GetRefillButton";
import SubscribeButton from "./components/SubscribeButton";
import LoginButton from "./components/LoginButton";
import SignatureEventButton from "./components/SignatureEventButton";
import MagicLinkLogin from "./components/MagicLinkLogin";
import { useUser } from "../contexts/user-context";

// import { chooseVenueOffer } from "../utils/venueSelector"; // removed – no longer needed
// import { refillFacts } from "../lib/refillFacts"; // removed – no longer needed

type Attendee = { name: string; email: string; id: string; confirmed: boolean };
function TicketModal({ open, onClose, attendee }: { open: boolean, onClose: () => void, attendee: Attendee | null }) {
  if (!open || !attendee) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center relative">
        <button className="absolute top-3 right-5 text-2xl text-gray-400 hover:text-gray-600" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold mb-2">Your Ticket</h2>
        <div className="mb-4 text-lg">Show this to the clerk at the helipad.</div>
        <div className="mb-2 font-semibold">Name: {attendee.name}</div>
        <div className="mb-2 font-semibold">Email: {attendee.email}</div>
        <div className="mb-4 font-mono text-xl bg-gray-100 rounded p-2">Ticket Code: {attendee.id}</div>
        <div className="text-sm text-gray-500">Status: <span className={attendee.confirmed ? "text-emerald-600" : "text-yellow-600"}>{attendee.confirmed ? "Confirmed" : "Pending Payment"}</span></div>
      </div>
    </div>
  );
}

import FeatureExplainModal from "./components/FeatureExplainModal";
import LocationModal from "../components/LocationModal";

// firstFiveFacts / sixToTenFacts removed – no longer needed after gating change

export default function HomePage() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [explainModal, setExplainModal] = useState<null | string>(null);
const [showInfo, setShowInfo] = useState(false);
const [infoFeature, setInfoFeature] = useState<string|null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, isLoading, logout, addRefill, subscribe } = useUser();

  // Placeholder for attendee logic (to be re-integrated if needed)
  const attendee = null;

  const handleBuyTicket = () => setModalOpen(true);

  const handleModalSuccess = () => {
    setModalOpen(false);
    window.open("https://buy.stripe.com/00g29q1B89kPanmcOb", "_blank");
  };

  // Unified action handler for all main actions
  const handleAction = async (feature: string) => {
    // Find Refill is always available
    if (feature === "findRefill") {
      setLocationModalOpen(true);
      return;
    }

    // If user not logged in, show explanation modal for all gated features
    if (!user) {
      setExplainModal(feature);
      setShowInfo(true);
      setInfoFeature(feature);
      return;
    }

    if (feature === "getRefill") {
      const ok = await addRefill();
      if (ok) {
        window.showToast?.("🎉 Refill added!", "success");
      } else {
        window.showToast?.("Subscribe for unlimited refills after 5", "info");
        window.open("https://buy.stripe.com/00g29q1B89kPanmcOb", "_blank");
      }
    } else if (feature === "signatureEvent") {
      handleBuyTicket();
    } else if (feature === "subscribe") {
      await subscribe();
      window.showToast?.("Subscription activated! Enjoy unlimited refills.", "success");
    }
  };

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center">
      <Image
        src="/backgroundtwb.png"
        alt="The Water Bar Background"
        layout="fill"
        objectFit="cover"
        priority
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <FindRefillButton onClick={() => handleAction('findRefill')} />
          <GetRefillButton onClick={() => handleAction('getRefill')} />
          {/* Log In/Profile Button, context-aware */}
          {isLoading ? (
            <div className="px-8 py-4 rounded-full font-bold text-lg shadow-lg bg-gray-100 text-gray-400 text-center">Loading...</div>
          ) : user ? (
            <div className="flex flex-col items-center w-full">
              <div className="mb-1 text-white text-center text-base">Welcome, <span className="font-semibold">{user.email}</span></div>
              <div className="mb-2 text-sm text-emerald-100">
                Plastic saved: <span className="font-bold">{user.water_bottle_saved}</span> bottles
                <span className="mx-2">|</span>
                CO₂ saved: <span className="font-bold">{(user.water_bottle_saved * 82.8 / 1000).toFixed(2)} kg</span>
                <a href="https://www.wwf.org.uk/updates/how-much-plastic-do-we-use" target="_blank" rel="noopener noreferrer" className="ml-1 underline text-xs text-gray-300 hover:text-emerald-200">(source)</a>
              </div>
              <button className="px-8 py-4 rounded-full font-bold text-lg shadow-lg bg-white text-emerald-700 border border-emerald-200 hover:bg-gray-100 transition w-full" onClick={logout}>
                Log Out
              </button>
            </div>
          ) : (
            <LoginButton onClick={() => setLoginOpen(true)} />
          )}
          <SubscribeButton onClick={() => handleAction('subscribe')} subscribed={user?.water_subscription_status === 'active'} />
          <SignatureEventButton onClick={() => handleAction('signatureEvent')} />
        </div>
        <LocationModal open={locationModalOpen} onCloseAction={() => setLocationModalOpen(false)} onInfoOpen={() => setShowInfo(true)} />
        {/* Feature Explanation Modal (for logged out users) */}
        <FeatureExplainModal
          open={showInfo}
          onClose={() => { setShowInfo(false); setInfoFeature(null); }}
          onInfoClose={() => { setShowInfo(false); setInfoFeature(null); }}
          feature={infoFeature}
        />
        {/* Login Modal (triggered only from within FeatureExplainModal) */}
        {loginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative">
              <button className="absolute top-3 right-5 text-2xl text-gray-400 hover:text-gray-600" onClick={() => setLoginOpen(false)}>×</button>
              <h2 className="text-xl font-bold mb-4 text-center text-emerald-700">Sign In</h2>
              <MagicLinkLogin />
            </div>
          </div>
        )}
      </div>
      <AttendeeModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} />
      <TicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} attendee={attendee} />
    </section>
  );
}
