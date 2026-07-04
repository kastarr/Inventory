import React, { useState } from "react";
import { AlertCircle, Clock, Users, Briefcase, Send, ChevronRight, Download } from "lucide-react";
import { cn } from "../lib/utils";

export default function Admin({ user }: { user: any }) {
  const [handoverNote, setHandoverNote] = useState("");
  
  const handleExportSystemState = () => {
    // Generate mock CSV content for system state
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + "Total Items,24\n"
      + "Missing,1\n"
      + "Overdue,3\n"
      + "Active Projects,1\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `acaso_system_state_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-4 bg-surface border-b border-border-whisper sticky top-0 z-30 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">Admin Console</h1>
        <button onClick={handleExportSystemState} className="flex items-center gap-2 bg-transparent border border-border-whisper px-3 py-1.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors tactile-btn h-9">
          <Download size={16} />
          <span className="hidden sm:inline">Export State CSV</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-32 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        
        {/* Handover Note */}
        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide flex items-center gap-2">
            <Send size={16} /> Broadcast Handover Note
          </h2>
          <div className="bg-surface-plate border border-border-whisper rounded-xl p-4 flex flex-col gap-3">
            <textarea 
              value={handoverNote}
              onChange={e => setHandoverNote(e.target.value)}
              placeholder="Write a note to be seen by all managers/admins on the dashboard tomorrow morning..."
              className="w-full h-24 bg-surface border border-border-whisper rounded-xl p-3 text-sm font-sans focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end">
              <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm tactile-btn">
                Publish Note
              </button>
            </div>
          </div>
        </section>

        {/* Operational Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="font-sans text-sm font-bold text-status-alert uppercase tracking-wide flex items-center gap-2">
              <AlertCircle size={16} /> Open Discrepancies
            </h2>
            <div className="bg-surface-plate border border-status-alert/30 rounded-xl flex flex-col divide-y divide-border-whisper overflow-hidden">
              <div className="p-4 bg-status-alert/5 flex justify-between items-center cursor-pointer hover:bg-status-alert/10 transition-colors">
                <div className="flex flex-col">
                  <span className="font-sans text-sm font-bold text-on-surface">1 Item Missing</span>
                  <span className="font-sans text-xs text-text-muted">From batch-mock-1 pickup</span>
                </div>
                <ChevronRight size={18} className="text-text-muted" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-sans text-sm font-bold text-secondary uppercase tracking-wide flex items-center gap-2">
              <Clock size={16} /> Overdue Items
            </h2>
            <div className="bg-surface-plate border border-secondary/30 rounded-xl flex flex-col divide-y divide-border-whisper overflow-hidden">
              <div className="p-4 bg-secondary/5 flex justify-between items-center cursor-pointer hover:bg-secondary/10 transition-colors">
                <div className="flex flex-col">
                  <span className="font-sans text-sm font-bold text-on-surface">3 Items Overdue</span>
                  <span className="font-sans text-xs text-text-muted">Past expected return date</span>
                </div>
                <ChevronRight size={18} className="text-text-muted" />
              </div>
            </div>
          </section>
        </div>

        {/* Management */}
        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide flex items-center gap-2">
            <Users size={16} /> Store Accounts (Acaso Productions)
          </h2>
          <div className="bg-surface-plate border border-border-whisper rounded-xl flex flex-col divide-y divide-border-whisper overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-surface-container-lowest">
              <span className="font-sans text-sm font-bold">11 Active Accounts</span>
              <button className="text-primary font-bold text-sm hover:underline">Add Account</button>
            </div>
            {['Krees (Admin)', 'Princess (Admin)', 'Loveth (Admin)', 'Mr Tosin (Store Keeper)', 'Habeeb (Crew)', 'Seyi (Crew)', 'Love (Crew)', 'Steph (Crew)'].map(u => (
              <div key={u} className="p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors">
                <span className="font-sans text-sm font-semibold text-on-surface">{u}</span>
                <button className="text-status-alert text-xs font-bold hover:underline">Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide flex items-center gap-2">
            <Briefcase size={16} /> Projects
          </h2>
          <div className="bg-surface-plate border border-border-whisper rounded-xl flex flex-col divide-y divide-border-whisper overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-surface-container-lowest">
              <span className="font-sans text-sm font-bold">1 Active Project</span>
              <button className="text-primary font-bold text-sm hover:underline">New Project</button>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors">
              <div className="flex flex-col">
                <span className="font-sans text-sm font-semibold text-on-surface">Acaso Productions</span>
                <span className="font-sans text-xs text-text-muted">EbonyLife Films &bull; Main Partner</span>
              </div>
              <button className="text-text-muted text-xs font-bold hover:underline">Archive</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
