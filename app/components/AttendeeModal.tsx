import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AttendeeModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Insert attendee into Supabase
    const { error } = await supabase.from("attendees").insert({ name, email });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      setEmail("");
      onSuccess();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2 text-center">Get on the Guest List</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border-[color:var(--primary-blue)] p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border-[color:var(--primary-blue)] p-2 rounded"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="btn"
          style={{
            backgroundImage: `var(--button-gradient)`,
            color: 'white'
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue to Payment"}
        </button>
        <button type="button" onClick={onClose} className="text-[color:var(--primary-blue)] hover:underline text-sm mt-2">Cancel</button>
      </form>
    </div>
  );
}
