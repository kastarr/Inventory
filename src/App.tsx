import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ArrowLeftRight, Clock, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { cn } from "./lib/utils";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Movements from "./pages/Movements";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";

function TopBar({ user, projects }: { user: any, projects: any[] }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineQueue, setShowOfflineQueue] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const syncStatus = isOnline ? 'synced' : 'offline';
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      <div className="h-16 bg-surface-plate border-b border-border-whisper flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-white font-display font-bold rounded flex items-center justify-center">A</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-sans text-[10px] font-bold text-text-muted leading-tight uppercase tracking-wider">ACASO</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <select 
                  className="font-sans text-sm font-bold text-on-surface bg-transparent outline-none appearance-none cursor-pointer"
                  onChange={() => {
                    // Force refresh to prevent stale data
                    window.location.reload();
                  }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            
            {/* Sync Dot */}
            <button 
              onClick={() => setShowOfflineQueue(true)}
              className="ml-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                syncStatus === 'synced' ? "bg-status-ready" : 
                syncStatus === 'queued' ? "bg-status-inuse animate-[pulse_2s_infinite]" : "bg-status-alert"
              )} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          {/* Notifications Bell */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center tactile-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted hover:text-on-surface transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-surface-plate">
              <span className="font-mono text-[9px] font-bold text-white leading-none">3</span>
            </div>
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 md:right-12 w-80 bg-surface-elevated border border-border-whisper rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-border-whisper flex justify-between items-center bg-surface-container-lowest">
                <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">Notifications</span>
                <button className="font-sans text-[10px] font-bold text-primary hover:underline">Mark all read</button>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto no-scrollbar">
                <div className="p-3 border-b border-border-whisper hover:bg-surface-container-low cursor-pointer flex gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-status-alert/10 text-status-alert flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-sm font-bold text-on-surface leading-tight">Leather Armchair flagged</span>
                    <span className="font-sans text-xs text-text-muted">by Store Keeper Mr Tosin</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider">Chief Daddy 3</span>
                      <span className="font-mono text-[10px] text-text-muted">10:42</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border-whisper flex items-center justify-center font-sans font-bold text-sm">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Offline Queue Drawer */}
      {showOfflineQueue && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-primary/0 backdrop-blur-sm transition-opacity duration-150" 
               style={{ backgroundColor: 'rgba(9, 9, 11, 0.6)' }}
               onClick={() => setShowOfflineQueue(false)} />
          <div className="bg-surface-elevated w-full max-h-[70vh] rounded-t-sm shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 z-10"
               style={{ animationTimingFunction: 'cubic-bezier(0.0, 0.0, 0.2, 1)' }}>
            <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                 onClick={() => setShowOfflineQueue(false)}>
              <div className="w-12 h-1 bg-border-whisper rounded-full" />
            </div>
            <div className="p-4 border-b border-border-whisper flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="font-sans text-lg font-bold text-on-surface">Offline Queue</h2>
                <span className="font-sans text-xs text-text-muted">{syncStatus === 'synced' ? 'All actions synced.' : 'Waiting for connection...'}</span>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-sm font-sans text-sm font-bold tactile-btn min-h-[40px]">
                Sync Now
              </button>
            </div>
            <div className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-3">
              {syncStatus === 'synced' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-text-muted">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-ready mb-3 opacity-50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   <p className="font-sans text-sm font-bold">No pending actions</p>
                </div>
              ) : (
                <div className="bg-surface border border-border-whisper p-3 rounded-sm flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-sm font-bold text-on-surface">Checkout: Vintage Typewriter</span>
                    <span className="font-mono text-xs text-text-muted">2026-07-02 10:15:32</span>
                  </div>
                  <span className="font-sans text-xs font-bold text-status-inuse bg-status-inuse/10 px-2 py-1 rounded-full">QUEUED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; role: string; active_project_ids?: string[] } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("acaso_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.active_project_ids) {
        Promise.all(parsed.active_project_ids.map((id: string) => fetch(`/api/projects/${id}`).then(res => res.json())))
          .then(data => setProjects(data.filter(Boolean)));
      }
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const isManagerOrAdmin = user.role === 'admin' || user.role === 'warehouse_manager';

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surface-abyss">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-sidebar flex-col border-r border-border-whisper/20">
          <div className="h-16 flex items-center px-6 border-b border-border-whisper/10">
            <h1 className="font-display text-xl font-bold text-sidebar-text tracking-wide">ACASO</h1>
          </div>
          
          <nav className="flex-1 py-4 flex flex-col gap-1 px-4">
            <DesktopNavItem to="/" icon={LayoutDashboard} label="Home" />
            <DesktopNavItem to="/inventory" icon={Package} label="Inventory" />
            <DesktopNavItem to="/movements" icon={ArrowLeftRight} label="Movements" />
            {isManagerOrAdmin && (
              <>
                <DesktopNavItem to="/activity" icon={Clock} label="Activity" />
                <DesktopNavItem to="/admin" icon={ShieldCheck} label="Admin" />
              </>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <TopBar user={user} projects={projects} />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/movements" element={<Movements user={user} />} />
              <Route path="/activity" element={isManagerOrAdmin ? <Activity /> : <Dashboard user={user} />} />
              <Route path="/admin" element={isManagerOrAdmin ? <Admin user={user} /> : <Dashboard user={user} />} />
              <Route path="*" element={<Dashboard user={user} />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 w-full h-[72px] bg-surface-plate border-t border-border-whisper z-50 flex justify-around items-center px-2 pb-safe">
            <MobileNavItem to="/" icon={LayoutDashboard} label="Home" />
            <MobileNavItem to="/inventory" icon={Package} label="Inventory" />
            <MobileNavItem to="/movements" icon={ArrowLeftRight} label="Movements" />
            {isManagerOrAdmin && (
              <>
                <MobileNavItem to="/activity" icon={Clock} label="Activity" />
                <MobileNavItem to="/admin" icon={ShieldCheck} label="Admin" />
              </>
            )}
          </nav>
        </div>
      </div>
    </BrowserRouter>
  );
}

function DesktopNavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg font-sans text-sm font-semibold transition-colors",
        isActive 
          ? "bg-sidebar-active text-white" 
          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text"
      )}
    >
      <Icon size={20} className={isActive ? "text-primary-container" : ""} />
      {label}
    </Link>
  );
}

function MobileNavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-16 h-14 gap-1 transition-colors tactile-btn rounded-xl",
        isActive ? "text-primary" : "text-text-muted hover:text-on-surface"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
        isActive ? "bg-primary/10" : ""
      )}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="font-sans text-[10px] font-bold">{label}</span>
    </Link>
  );
}
