"use client";
import { useState } from "react";
import Image from "next/image";
import { useUser } from "../contexts/user-context";
import { refillFacts } from "../lib/refillFacts";

function getRefillFact(idx: number) {
  if (!refillFacts.length) return "Every refill makes a difference!";
  if (idx <= 0) return refillFacts[0];
  if (idx <= 26) return refillFacts[(idx - 1) % 26];
  return refillFacts[26 + ((idx - 27) % (refillFacts.length - 26))];
}

import AttendeeModal from "./components/AttendeeModal";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleBuyTicket = () => {
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    // Redirect to Stripe Payment Link
    window.open("https://buy.stripe.com/00g29q1B89kPanmcOb", "_blank");
  };

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center">
      {/* Hero Image */}
      <Image
        src="/TMP.png"
        alt="The Morning Party Event Poster"
        layout="fill"
        objectFit="cover"
        priority
        className="z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
        <button
          className="mt-8 px-8 py-4 bg-emerald-500 text-white text-2xl rounded-full font-bold shadow-lg hover:bg-emerald-600 transition"
          onClick={handleBuyTicket}
        >
          Buy Ticket
        </button>
      </div>
      <AttendeeModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} />
    </section>
  );
}

  return (
    <main className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Background image */}
      <Image
        src="/background.png"
        alt="Reduce Plastic, Help Save Marine Life"
        fill
        priority
        className="z-0 object-cover"
      />
      {/* Centered logo */}
      <div className="relative z-10 flex flex-col items-center">
        <Image
          src="/images/logo3.png"
          alt="The Water Bar Experience Highdration Logo"
          width={680}
          height={680}
          className="mb-8 drop-shadow-lg max-w-[95vw] max-h-[80vh] w-auto h-auto"
          priority
        />
        {/* Plastic saved count */}
        <div className="text-white text-lg font-semibold mb-4">
          Plastic saved: {user ? user.water_bottle_saved : 0}
        </div>
        {/* Main CTA button */}
        <button
          className="bg-logo-cyan hover:bg-logo-cyan/80 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg mb-4"
          onClick={handleCta}
        >
          {ctaText}
        </button>
      </div>

      {/* Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            {user && user.water_bottle_saved === 0 ? (
              <>
                <h2 className="text-2xl font-bold mb-4">First Free Refill</h2>
                <p className="mb-6">Show this screen to staff to get your free refill.</p>
                <div className="mb-6 text-sm bg-logo-cyan/10 p-4 rounded-lg">
                  Impact Fact: {getRefillFact(1)}
                </div>
                <button
                  className="w-full bg-emerald py-3 rounded-lg font-medium mb-3 text-white text-lg"
                  onClick={handleConfirmRefill}
                  disabled={isLoading}
                >
                  Confirm Free Refill
                </button>
              </>
            ) : user && user.water_subscription_status === "active" ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Active Subscription</h2>
                <p className="mb-6">Unlimited refills. Show this screen to staff.</p>
                <div className="mb-6 text-sm bg-logo-cyan/10 p-4 rounded-lg">
                  Impact Fact: {getRefillFact(user.water_bottle_saved + 1)}
                </div>
                <button
                  className="w-full bg-emerald py-3 rounded-lg font-medium mb-3 text-white text-lg"
                  onClick={handleConfirmRefill}
                  disabled={isLoading}
                >
                  Confirm Refill
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">No Active Subscription</h2>
                <p className="mb-6">Subscribe to continue enjoying unlimited refills.</p>
                <button
                  className="w-full bg-logo-cyan py-3 rounded-lg font-medium mb-3 text-white text-lg"
                  onClick={() => window.open("https://buy.stripe.com/link", "_blank")}
                >
                  Subscribe Now
                </button>
              </>
            )}
            <button
              className="w-full bg-white/10 hover:bg-white/20 text-black py-2 rounded-lg mt-2"
              onClick={() => setShowRefillModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
