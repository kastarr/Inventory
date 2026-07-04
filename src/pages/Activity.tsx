import React, { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, ArrowDown, ArrowUp, Flag, CheckCircle, Download, Ghost } from "lucide-react";
import { cn } from "../lib/utils";

export default function Activity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Mock fetching activity logs populated with Nigerian workers and store keeper context
    setTimeout(() => {
      setLogs([
        { id: 'log-1', type: 'FLAG', item: 'Royal Armchair (Gold)', person: 'Mr Tosin', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 1800000).toISOString(), note: 'Leg cracked during return. Billing of ₦45,000 assigned to Habeeb.' },
        { id: 'log-2', type: 'RETURN', item: 'Velvet Sofa (Blue)', person: 'Steph', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Returned in perfect condition. Verified by Mr Tosin.' },
        { id: 'log-3', type: 'CHECKOUT', item: 'Ceremonial Staff (Indigo)', person: 'Love', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Checked out in morning pickup batch.' },
        { id: 'log-4', type: 'CHECKOUT', item: 'Carved Bench (Brown)', person: 'Habeeb', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 14400000).toISOString(), note: 'Checked out for outdoor scene dressing.' },
        { id: 'log-5', type: 'FLAG', item: 'Ceramic Vase (Amber)', person: 'Mr Tosin', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Chipped edge. ₦12,000 billing assigned to Seyi.' },
        { id: 'log-6', type: 'RETURN', item: 'Gilded Mirror (Gold)', person: 'Miracle', qty: 1, project: 'Acaso Productions', timestamp: new Date(Date.now() - 100800000).toISOString(), note: 'Returned clean. Verified by Mr Tosin.' }
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Item,Person,Action,Project,Note\n"
      + logs.map(l => `${new Date(l.timestamp).toISOString()},${l.item},${l.person},${l.type},${l.project},${l.note || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `acaso_activity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-4 bg-surface border-b border-border-whisper sticky top-0 z-30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">Store Activity Log</h1>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-transparent border border-border-whisper px-3 py-1.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors tactile-btn h-9">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="flex items-center gap-2 bg-surface-plate border border-border-whisper px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-on-surface whitespace-nowrap">
            <Filter size={14} /> Filter by Crew
          </button>
          <button className="flex items-center gap-2 bg-surface-plate border border-border-whisper px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-on-surface whitespace-nowrap">
            <Filter size={14} /> Action Type
          </button>
          <button className="flex items-center gap-2 bg-surface-plate border border-border-whisper px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-on-surface whitespace-nowrap">
            <Filter size={14} /> Date Range
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-32">
        {loading ? (
          <div className="flex flex-col gap-3 max-w-4xl mx-auto animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-plate rounded-xl border border-border-whisper" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <Ghost size={48} className="text-surface-container-high mb-4" />
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">No activity yet</h3>
            <p className="font-sans text-sm text-text-muted">When items are checked out or returned in store, they will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-4xl mx-auto animate-in fade-in duration-300">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="bg-surface-plate border border-border-whisper rounded-xl overflow-hidden transition-all hover:border-primary/30 shadow-sm"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer tactile-btn"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      log.type === 'CHECKOUT' ? 'bg-status-transit/10 text-status-transit' :
                      log.type === 'RETURN' ? 'bg-status-ready/10 text-status-ready' :
                      'bg-status-alert/10 text-status-alert'
                    )}>
                      {log.type === 'CHECKOUT' && <ArrowUp size={20} />}
                      {log.type === 'RETURN' && <ArrowDown size={20} />}
                      {log.type === 'FLAG' && <Flag size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-bold text-on-surface">{log.item}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-sans text-xs font-semibold text-text-muted">Person: {log.person}</span>
                        <span className="text-text-muted text-[10px]">&bull;</span>
                        <span className="font-mono text-xs text-text-muted">Qty: {log.qty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xs font-bold text-on-surface">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider">{log.project}</span>
                  </div>
                </div>

                {expandedId === log.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-border-whisper/50 bg-surface-container-lowest flex flex-col gap-3">
                    <div className="bg-surface p-3 rounded-lg border border-border-whisper/50">
                      <span className="font-sans text-xs font-bold text-sidebar-muted uppercase tracking-wider">Condition Note / Context</span>
                      <p className="font-sans text-sm text-on-surface mt-1">{log.note || "No notes provided."}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
