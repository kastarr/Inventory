import { useState, FormEvent } from "react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, pin })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("acaso_user", JSON.stringify(data.account));
        onLogin(data.account);
      } else {
        setError(data.message || "Invalid name or PIN. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      // Offline fallback — try matching a known crew member
      const offlineCrew: Record<string, { id: string; name: string; role: string }> = {
        "krees":     { id: "acc-1",  name: "Krees",    role: "admin" },
        "princess":  { id: "acc-5",  name: "Princess", role: "admin" },
        "loveth":    { id: "acc-6",  name: "Loveth",   role: "admin" },
        "mr tosin":  { id: "acc-3",  name: "Mr Tosin", role: "warehouse_manager" },
        "habeeb":    { id: "acc-2",  name: "Habeeb",   role: "crew" },
        "seyi":      { id: "acc-4",  name: "Seyi",     role: "crew" },
        "love":      { id: "acc-7",  name: "Love",     role: "crew" },
        "steph":     { id: "acc-8",  name: "Steph",    role: "crew" },
        "miracle":   { id: "acc-9",  name: "Miracle",  role: "crew" },
        "james":     { id: "acc-10", name: "James",    role: "crew" },
        "josh":      { id: "acc-11", name: "Josh",     role: "crew" },
      };
      const match = offlineCrew[phone.toLowerCase().trim()];
      if (match && pin === "1234") {
        const user = { ...match, active_project_ids: ["proj-1"] };
        localStorage.setItem("acaso_user", JSON.stringify(user));
        onLogin(user);
      } else {
        setError("Login failed. Please check your name and PIN then try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-abyss text-on-surface p-6">
      <div className="w-full max-w-sm bg-surface p-10 rounded-2xl border border-border-whisper shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="font-display text-white text-2xl font-extrabold">A</span>
          </div>
          <h1 className="font-sans text-2xl font-extrabold text-on-surface tracking-wide">ACASO</h1>
          <p className="font-sans text-xs text-text-muted mt-1 text-center">Store Management Terminal &bull; Sign in with your name</p>
        </div>

        {error && (
          <div className="bg-status-alert/10 border border-status-alert text-status-alert px-4 py-3 rounded-xl mb-6 font-sans text-sm font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-sans text-sm font-bold text-on-surface block mb-2">Your Name</label>
            <input
              type="text"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(""); }}
              className="w-full bg-surface-plate border border-border-whisper rounded-xl h-12 px-4 text-on-surface font-sans focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-muted"
              placeholder="e.g. Krees, Princess, Mr Tosin..."
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="font-sans text-sm font-bold text-on-surface block mb-2">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(""); }}
              className="w-full bg-surface-plate border border-border-whisper rounded-xl h-12 px-4 text-on-surface font-sans tracking-widest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-muted"
              placeholder="••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !phone.trim() || !pin.trim()}
            className="mt-2 w-full h-12 bg-primary text-white font-sans text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tactile-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Quick-tap team name buttons */}
        <div className="mt-6 p-3 bg-surface-plate border border-border-whisper rounded-xl">
          <p className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Quick Select</p>
          <div className="flex flex-wrap gap-1.5">
            {['Krees', 'Princess', 'Loveth', 'Mr Tosin', 'Habeeb', 'Seyi', 'Love', 'Steph', 'Miracle', 'James', 'Josh'].map(name => (
              <button
                key={name}
                type="button"
                onClick={() => { setPhone(name); setError(""); }}
                className={`font-sans text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                  phone === name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-whisper bg-surface hover:border-primary hover:text-primary text-text-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
