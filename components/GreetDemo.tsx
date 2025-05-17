import { useState, useEffect } from 'react'; // Added useEffect for greeting onboarding logic
import { useUser } from '../contexts/user-context';

const TONE_OPTIONS = [
  { value: 'hype', label: 'Hype' },
  { value: 'chill', label: 'Chill' },
  { value: 'science', label: 'Science' },
  { value: 'surprise', label: 'Surprise Me' },
];

export default function GreetDemo() {
  const { user, isLoading: userLoading, login } = useUser();
  const [name, setName] = useState('');
  const [tone, setTone] = useState('');
  const [step, setStep] = useState<'name' | 'tone' | 'greeting' | 'login'>('name');
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  // On mount: decide what to show based on user state
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setStep('login');
      return;
    }
    if (user.name) {
      // User is known, fetch greeting immediately
      setLoading(true);
      fetch('/api/greet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greet: true, user_id: user.id }),
      })
        .then(res => res.json())
        .then(data => {
          setGreeting(data.greeting || data.error);
          setStep('greeting');
        })
        .catch(() => {
          setGreeting('Welcome!');
          setStep('greeting');
        })
        .finally(() => setLoading(false));
    } else {
      setStep('name');
    }
  }, [user, userLoading]);

  // Save name and move to tone selection
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setStep('tone');
  };

  // Save both name and tone to Supabase, then fetch greeting
  const handleToneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('User not loaded. Please wait or refresh.');
      return;
    }
    setLoading(true);
    setError('');
    setGreeting('');
    try {
      // Save to Supabase via API
      const saveRes = await fetch('/api/greet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tone, user_id: user.id }),
      });
      const saveData = await saveRes.json();
      if (saveData.error) throw new Error(saveData.error);
      // Now fetch greeting
      const greetRes = await fetch('/api/greet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greet: true, user_id: user.id }),
      });
      const greetData = await greetRes.json();
      setGreeting(greetData.greeting || greetData.error);
      setStep('greeting');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle magic link login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await login(email);
      setError('Check your email for a magic link!');
    } catch (err: any) {
      setError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };


  if (userLoading) {
    return (
      <div style={{ color: '#00FFFF', textAlign: 'center', marginTop: 48 }}>
        Loading user info...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ color: '#FF9AAA', textAlign: 'center', marginTop: 48 }}>
        User not found. Please sign in.
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "32px auto",
        maxWidth: 420,
        width: "100%",
        padding: "24px 32px",
        background: "rgba(0,20,40,0.85)",
        color: "#00FFFF",
        borderRadius: 16,
        boxShadow: "0 4px 24px 0 #00142855",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {step === 'name' && (
        <form onSubmit={handleNameSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: 8,
              fontSize: 18,
              borderRadius: 8,
              border: "1px solid #00FFFF",
              marginBottom: 8,
              background: "#001428",
              color: "#00FFFF",
              outline: "none",
              width: 180
            }}
          />
          <button
            type="submit"
            disabled={loading || !name}
            style={{
              marginTop: 8,
              padding: "8px 18px",
              borderRadius: 8,
              background: "#00FFFF",
              color: "#001428",
              fontWeight: 600,
              border: "none",
              cursor: loading || !name ? "not-allowed" : "pointer",
              opacity: loading || !name ? 0.5 : 1
            }}
          >
            Next
          </button>
        </form>
      )}
      {step === 'tone' && (
        <form onSubmit={handleToneSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 18 }}>How do you like to be coached?</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {TONE_OPTIONS.map(opt => (
              <label key={opt.value} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={tone === opt.value}
                  onChange={() => setTone(opt.value)}
                  disabled={loading}
                  style={{ marginBottom: 4 }}
                />
                <span style={{ color: '#00FFFF', fontSize: 16 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || !tone}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "#00FFFF",
              color: "#001428",
              fontWeight: 600,
              border: "none",
              cursor: loading || !tone ? "not-allowed" : "pointer",
              opacity: loading || !tone ? 0.5 : 1
            }}
          >
            {loading ? 'Saving...' : 'Show my greeting'}
          </button>
        </form>
      )}
      {step === 'greeting' && (
        <div style={{ marginTop: 20, fontSize: 20, minHeight: 28, textAlign: 'center' }}>{greeting}</div>
      )}
      {error && <div style={{ color: '#FF9AAA', marginTop: 12 }}>{error}</div>}
    </div>
  );
}
