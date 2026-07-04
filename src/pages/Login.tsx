import { useState, FormEvent, useEffect } from "react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (authenticatedUser && authenticatedUser.active_project_ids) {
      // Fetch project details
      Promise.all(
        authenticatedUser.active_project_ids.map((id: string) => 
          fetch(`/api/projects/${id}`).then(res => res.json())
        )
      ).then(data => setProjects(data.filter(Boolean)));
    }
  }, [authenticatedUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, pin })
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticatedUser(data.account);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      if (phone === "555-0100" && pin === "1234") {
        setAuthenticatedUser({ id: "acc-1", name: "Admin User", role: "admin", active_project_ids: ["proj-1"] });
      } else {
        setError("Network error. Try 555-0100 / 1234 in offline mode.");
      }
    }
  };

  const handleContinue = () => {
    localStorage.setItem("acaso_user", JSON.stringify(authenticatedUser));
    onLogin(authenticatedUser);
  };

  if (authenticatedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-abyss text-on-surface p-6">
        <div className="w-full max-w-sm bg-surface p-10 rounded-2xl border border-border-whisper shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h2 className="font-sans text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Access Granted</h2>
          <p className="font-sans text-sm text-text-muted mb-8 text-center font-medium">Welcome back, {authenticatedUser.name}</p>
          
          <div className="w-full bg-surface-plate border border-border-whisper rounded-xl p-4 mb-8">
            <h3 className="font-sans text-xs font-bold text-sidebar-muted uppercase tracking-wider mb-3">Active Projects</h3>
            {projects.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {projects.map(p => (
                  <li key={p.id} className="flex flex-col gap-1">
                    <span className="font-sans text-base font-bold text-on-surface">{p.name}</span>
                    <span className="font-mono text-xs text-text-muted">{p.production_company}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-sm text-text-muted">Loading projects...</p>
            )}
          </div>

          <button onClick={handleContinue} className="tactile-btn w-full h-12 bg-primary text-white font-sans text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            Enter Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-abyss text-on-surface p-6">
      <div className="w-full max-w-sm bg-surface p-10 rounded-2xl border border-border-whisper shadow-lg">
        <h1 className="font-sans text-3xl font-extrabold text-on-surface mb-2 text-center tracking-wide"><span className="text-primary mr-1">/</span>ACASO</h1>
        <p className="font-sans text-sm text-text-muted mb-10 text-center font-medium">Terminal Authentication</p>
        
        {error && (
          <div className="bg-status-alert/10 border border-status-alert text-status-alert px-4 py-3 rounded-lg mb-6 font-sans text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-sans text-sm font-bold text-on-surface block mb-2">Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-surface-plate border border-border-whisper rounded-xl h-12 px-4 text-on-surface font-sans focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-muted"
              placeholder="555-0100"
            />
          </div>
          <div>
            <label className="font-sans text-sm font-bold text-on-surface block mb-2">Secure PIN</label>
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full bg-surface-plate border border-border-whisper rounded-xl h-12 px-4 text-on-surface font-sans tracking-widest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-muted"
              placeholder="****"
            />
          </div>
          <button type="submit" className="tactile-btn mt-6 w-full h-12 bg-primary text-white font-sans text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            Authorize Connection
          </button>
        </form>
      </div>
    </div>
  );
}
