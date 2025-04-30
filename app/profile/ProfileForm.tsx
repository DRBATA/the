import { useState } from "react";
import type { UserProfile } from "../../contexts/user-context";

interface ProfileFormProps {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileForm({ user, updateUser }: ProfileFormProps) {
  const [email, setEmail] = useState(user.email || "");
  const [whatsapp, setWhatsapp] = useState(user.whatsapp_number || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateUser({ email, whatsapp_number: whatsapp });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="bg-white/80 rounded-xl p-6 w-full max-w-md shadow-lg" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4 text-blue-700">Edit Profile</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">WhatsApp</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      {success && <p className="text-green-600 mt-2">Profile updated!</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
