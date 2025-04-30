"use client";
import { useState } from "react";
import Image from "next/image";
import AttendeeModal from "./components/AttendeeModal";
import BubbleHub from "./components/BubbleHub";
import DrinkTracker from "./components/DrinkTracker";
import RefillTracker from "./components/RefillTracker";
import SubscribeButton from "./components/SubscribeButton";
import ManageSubscriptionPanel from "./components/ManageSubscriptionPanel";
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


import LocationModal from "../components/LocationModal";
import HydrationChat from "./components/HydrationChat";

// firstFiveFacts / sixToTenFacts removed – no longer needed after gating change



import SplashScreen from "./components/SplashScreen";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoFeature, setInfoFeature] = useState<string|null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showDrinkTracker, setShowDrinkTracker] = useState(false);
  const [showRefillTracker, setShowRefillTracker] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { user, isLoading, logout, addRefill } = useUser();
  const router = useRouter();

  // Placeholder for attendee logic (to be re-integrated if needed)
  const attendee = null;

  // SplashScreen hydration stats (can be replaced with real data)
  const hydrationPercentage = 60;
  const carbonSaved = 0.91;
  const bottlesSaved = 11;
  const [bubblePos, setBubblePos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [bubblesPosition, setBubblesPosition] = useState<'center' | 'corner' | 'hidden'>('center');
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (showSplash) {
    return (
      <SplashScreen
        onCompleteAction={() => setShowSplash(false)}
        hydrationPercentage={hydrationPercentage}
        carbonSaved={carbonSaved}
        bottlesSaved={bottlesSaved}
        bubblesPosition={bubblesPosition}
        onBubblePositionUpdateAction={setBubblePos}
        isTransitioning={isTransitioning}
      />
    );
  }
  

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

    // Direct navigation for 'purpose' button
    if (feature === "purpose") {
      router.push('/purpose');
      return;
    }
    // Remove login gating for 'hydrate' (always accessible)
    if (feature === "hydrate") {
      setShowInfo(true);
      setInfoFeature(feature);
      return;
    }

    // If user not logged in, show explanation modal for all other gated features
    if (!user) {
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
        window.showToast?.("Water Bar subscription coming soon!", "info");
        setPanelOpen(true);
      }
    } else if (feature === "signatureEvent") {
      window.open("https://buy.stripe.com/00g29q1B89kPanmcOb", "_blank");
    } else if (feature === "subscribe") {
      window.showToast?.("Water Bar subscription coming soon!", "info");
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
        <BubbleHub
          hydrationPercentage={hydrationPercentage}
          carbonSaved={carbonSaved}
          bottlesSaved={bottlesSaved}
          initialBubblesPosition={bubblesPosition}
          initialBubblePosition={bubblePos}
          onHydrateAction={() => setShowChat(true)}
          onPurposeAction={() => router.push('/purpose')}
          onRefillAction={() => setLocationModalOpen(true)}
          onProfileAction={() => router.push('/profile')}
          onHistoryAction={() => router.push('/history') }
          onCentralDragUpAction={() => setShowRefillTracker(true)}
          onCentralDragDownAction={() => setShowDrinkTracker(true)}
        />
        <LocationModal open={locationModalOpen} onCloseAction={() => setLocationModalOpen(false)} onInfoOpen={() => setShowInfo(true)} />

        {showChat && (
          <HydrationChat
            onClose={() => setShowChat(false)}
          />
        )}
        {showRefillTracker && (
          <RefillTracker
            dragProgress={1}
            onCompleteAction={() => setShowRefillTracker(false)}
          />
        )}
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
