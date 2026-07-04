import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, AlertCircle, Clock, CheckCircle2, ChevronRight, Plus, Box, ShieldAlert, DollarSign } from "lucide-react";
import { cn } from "../lib/utils";
import { DamageReport } from "../types";

export default function Dashboard({ user }: { user: any }) {
  const isManagerOrAdmin = user.role === 'admin' || user.role === 'warehouse_manager';

  if (isManagerOrAdmin) {
    return <ManagerDashboard user={user} />;
  }
  
  return <CrewDashboard user={user} />;
}

function ManagerDashboard({ user }: { user: any }) {
  const [showFAB, setShowFAB] = useState(false);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [loadingDamage, setLoadingDamage] = useState(true);

  useEffect(() => {
    fetch("/api/damage-reports")
      .then(res => res.json())
      .then(data => {
        setDamageReports(data);
        setLoadingDamage(false);
      })
      .catch(() => setLoadingDamage(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 relative max-w-7xl mx-auto w-full">
      {/* Handover Note */}
      <div className="bg-surface-plate border border-border-whisper rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-status-transit/10 text-status-transit flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-sans text-sm font-bold text-on-surface">Handover Note: Evening Shift</h3>
            <p className="font-sans text-sm text-text-muted mt-1 leading-relaxed">
              "Left 3 large props by the loading/dispatch area. Velvet curtains missing a tie, flagged in store. Habeeb has returned the woodwork tools, but Seyi is still with the ladder."
            </p>
          </div>
        </div>
        <button className="tactile-btn whitespace-nowrap bg-surface-container-high px-4 py-2 rounded-lg font-sans text-sm font-semibold text-primary hover:bg-border-whisper transition-colors shrink-0">
          Acknowledge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Items Out Today" value="8" icon={Package} color="text-status-transit" bg="bg-status-transit/10" />
        <StatCard title="Open Discrepancies" value={String(damageReports.filter(d => !d.resolved).length)} icon={AlertCircle} color="text-status-alert" bg="bg-status-alert/10" />
        <StatCard title="Items Overdue" value="3" icon={Clock} color="text-secondary" bg="bg-secondary/10" />
      </div>

      {/* Damage & Billing Board (Nigerian Relatability) */}
      <div className="flex flex-col bg-surface-plate border border-border-whisper rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border-whisper bg-surface-container-lowest flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-sans text-sm font-bold text-on-surface uppercase tracking-wide">Damage & Billing Board</h2>
            <span className="font-sans text-xs text-text-muted">Public list of broken items, responsible persons, and repair fees</span>
          </div>
          <span className="font-sans text-[11px] font-bold bg-status-alert/10 text-status-alert px-2.5 py-1 rounded-full">TRANSPARENT BILLING</span>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {loadingDamage ? (
            <div className="text-center py-6 text-text-muted text-sm">Loading billing records...</div>
          ) : damageReports.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-sm">No items currently reported broken. Clean slate!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {damageReports.map(report => (
                <div key={report.id} className="bg-surface border border-border-whisper/50 p-4 rounded-xl flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-sm font-bold text-on-surface">{report.item_name}</span>
                    <p className="font-sans text-xs text-text-muted italic">"{report.note}"</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-sans text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        Responsible: {report.responsible_person_name || "Unassigned"}
                      </span>
                      <span className="font-sans text-[10px] bg-surface-container-highest text-text-muted px-2 py-0.5 rounded-full">
                        By: {report.reporter_name || "Store Keeper"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-status-alert">
                      ₦{(report.billing_price).toLocaleString()}
                    </span>
                    <span className="font-sans text-[9px] uppercase font-bold text-text-muted tracking-wider">
                      {report.resolved ? "REPAID / FIXED" : "PENDING BILL"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="flex flex-col bg-surface-plate border border-border-whisper rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-whisper bg-surface-container-lowest flex items-center justify-between">
            <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide">Needs Attention</h2>
            <span className="font-sans text-[11px] font-bold bg-status-alert/10 text-status-alert px-2 py-0.5 rounded-full">URGENT ACTION</span>
          </div>
          <div className="flex flex-col divide-y divide-border-whisper">
            <AttentionItem type="missing" title="Vintage Radio (Amber)" desc="Last seen with Habeeb, overdue in store" />
            <AttentionItem type="flagged" title="Royal Armchair (Gold)" desc="Leg cracked - Billing of ₦45,000 assigned to Habeeb" />
            <AttentionItem type="overdue" title="Velvet Backdrop" desc="Expected back in store today by 14:00" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col bg-surface-plate border border-border-whisper rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-whisper bg-surface-container-lowest flex items-center justify-between">
            <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide">Recent Activity</h2>
            <Link to="/activity" className="font-sans text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col">
            <ActivityRow action="CHECKOUT" item="Carved Bench (Brown)" person="Habeeb" time="10m ago" />
            <ActivityRow action="RETURN" item="Velvet Sofa (Blue)" person="Steph" time="1h ago" />
            <ActivityRow action="FLAG" item="Royal Armchair (Gold)" person="Mr Tosin" time="2h ago" isAlert />
            <ActivityRow action="CHECKOUT" item="Ceremonial Staff (Indigo)" person="Love" time="3h ago" />
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        <button 
          onClick={() => setShowFAB(!showFAB)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform tactile-btn"
        >
          <Plus size={24} className={cn("transition-transform", showFAB && "rotate-45")} />
        </button>
        
        {showFAB && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 min-w-[200px] items-end animate-in fade-in slide-in-from-bottom-2">
            <Link to="/movements" className="bg-surface-plate border border-border-whisper px-4 py-3 rounded-xl shadow-lg flex items-center justify-between w-full hover:bg-surface-container-lowest transition-colors group tactile-btn">
              <span className="font-sans text-sm font-bold text-on-surface group-hover:text-primary">New Checkout/Pickup</span>
              <Package size={18} className="text-text-muted group-hover:text-primary" />
            </Link>
            <Link to="/inventory" className="bg-surface-plate border border-border-whisper px-4 py-3 rounded-xl shadow-lg flex items-center justify-between w-full hover:bg-surface-container-lowest transition-colors group tactile-btn">
              <span className="font-sans text-sm font-bold text-on-surface group-hover:text-status-alert">Flag / Report Broken Item</span>
              <ShieldAlert size={18} className="text-text-muted group-hover:text-status-alert" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CrewDashboard({ user }: { user: any }) {
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);

  useEffect(() => {
    fetch("/api/damage-reports")
      .then(res => res.json())
      .then(setDamageReports)
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold text-on-surface tracking-tight mb-2">Hello, {user.name}</h1>
        <p className="font-sans text-text-muted">Welcome to the Acaso Productions Store Terminal.</p>
      </div>

      <Link 
        to="/movements" 
        className="w-full bg-primary text-white p-6 rounded-2xl flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity tactile-btn"
      >
        <div className="flex flex-col animate-pulse">
          <span className="font-display text-2xl font-bold">Pick Up / Return Store Items</span>
          <span className="font-sans text-sm opacity-80 mt-1">Check out batches or verify returns with Mr Tosin</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Plus size={24} />
        </div>
      </Link>

      {/* Public Damage & Billing Board for Crew */}
      <div className="flex flex-col bg-surface-plate border border-border-whisper rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border-whisper bg-surface-container-lowest">
          <h2 className="font-sans text-sm font-bold text-on-surface uppercase tracking-wide">Damage Board & Repair Fees</h2>
          <p className="font-sans text-xs text-text-muted mt-0.5">Please check here for items reported damaged and the corresponding replacement bills.</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {damageReports.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-sm">No items currently reported broken. Good job team!</div>
          ) : (
            <div className="flex flex-col gap-2">
              {damageReports.map(report => (
                <div key={report.id} className="bg-surface border border-border-whisper/50 p-3 rounded-lg flex items-center justify-between gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-on-surface">{report.item_name}</span>
                    <span className="font-sans text-xs text-text-muted">
                      Responsible: <strong className="text-status-alert">{report.responsible_person_name || "Unassigned"}</strong> &bull; {report.note}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-status-alert shrink-0 bg-status-alert/5 px-3 py-1 rounded border border-status-alert/20">
                    ₦{(report.billing_price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-surface-plate border border-border-whisper rounded-xl p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", bg, color)}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="font-sans text-3xl font-bold text-on-surface">{value}</span>
        <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">{title}</span>
      </div>
    </div>
  );
}

function AttentionItem({ type, title, desc }: { type: 'missing' | 'flagged' | 'overdue', title: string, desc: string }) {
  const isAlert = type === 'missing' || type === 'flagged';
  return (
    <div className={cn(
      "p-4 hover:bg-surface-container-low transition-colors cursor-pointer flex justify-between items-center",
      isAlert ? "bg-status-alert/5" : ""
    )}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {isAlert && <AlertCircle size={14} className="text-status-alert" />}
          <span className="font-sans text-sm font-bold text-on-surface">{title}</span>
        </div>
        <span className="font-sans text-xs text-text-muted">{desc}</span>
      </div>
      <ChevronRight size={18} className="text-text-muted" />
    </div>
  );
}

function ActivityRow({ action, item, person, time, isAlert }: { action: string, item: string, person: string, time: string, isAlert?: boolean }) {
  return (
    <div className="p-4 border-b border-border-whisper last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer flex items-center gap-4">
      <div className={cn(
        "px-2 py-1 rounded font-sans text-[10px] font-bold uppercase tracking-wider w-16 text-center shrink-0",
        action === 'CHECKOUT' ? 'bg-status-transit/10 text-status-transit' :
        action === 'RETURN' ? 'bg-status-ready/10 text-status-ready' :
        action === 'FLAG' ? 'bg-status-alert/10 text-status-alert' : 'bg-surface-container-high text-text-muted'
      )}>
        {action}
      </div>
      <div className="flex flex-col flex-1 truncate">
        <span className={cn("font-sans text-sm font-medium truncate", isAlert ? "text-status-alert" : "text-on-surface")}>{item}</span>
        <span className="font-sans text-xs text-text-muted">{person}</span>
      </div>
      <span className="font-mono text-xs text-text-muted shrink-0">{time}</span>
    </div>
  );
}
