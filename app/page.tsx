"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import AttendeeModal from "./components/AttendeeModal";
import { supabase } from "../lib/supabaseClient";

function TicketModal({ open, onClose, attendee }: { open: boolean, onClose: () => void, attendee: any }) {
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

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [attendee, setAttendee] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  // Try to auto-fill email from magic link session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      if (email) setUserEmail(email);
    };
    getSession();
  }, []);

  // Fetch attendee ticket if user is logged in
  useEffect(() => {
    if (!userEmail) return;
    const fetchAttendee = async () => {
      const { data, error } = await supabase.from("attendees").select("*").eq("email", userEmail).single();
      if (!error && data) setAttendee(data);
    };
    fetchAttendee();
  }, [userEmail]);

  const handleBuyTicket = () => setModalOpen(true);

  const handleModalSuccess = () => {
    setModalOpen(false);
    window.open("https://buy.stripe.com/00g29q1B89kPanmcOb", "_blank");
  };

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center">
      <Image
        src="/TMP.png"
        alt="The Morning Party Event Poster"
        layout="fill"
        objectFit="cover"
        priority
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 space-y-4">
        <button
          className="mt-8 px-8 py-4 bg-emerald-500 text-white text-2xl rounded-full font-bold shadow-lg hover:bg-emerald-600 transition"
          onClick={handleBuyTicket}
        >
          Buy Ticket
        </button>
        {attendee && (
          <button
            className="px-6 py-3 bg-white/80 text-emerald-700 rounded-full font-semibold shadow border border-emerald-200 hover:bg-white"
            onClick={() => setTicketOpen(true)}
          >
            My Ticket
          </button>
        )}
      </div>
      <AttendeeModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} />
      <TicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} attendee={attendee} />
    </section>
  );
}

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
