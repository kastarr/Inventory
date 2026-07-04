import React, { useState, useEffect } from "react";
import { Search, Filter, Grid, List as ListIcon, X, MapPin, Tag, Box, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDamageDialog, setShowDamageDialog] = useState(false);
  const [damageCrewId, setDamageCrewId] = useState("");
  const [damagePrice, setDamagePrice] = useState("");
  const [damageNote, setDamageNote] = useState("");
  const [reportingDamage, setReportingDamage] = useState(false);

  const crewList = [
    { id: "acc-2", name: "Habeeb (Woodwork)" },
    { id: "acc-4", name: "Seyi (Woodwork)" },
    { id: "acc-7", name: "Love (Crew)" },
    { id: "acc-8", name: "Steph (Crew)" },
    { id: "acc-9", name: "Miracle (Crew)" },
    { id: "acc-10", name: "James (Crew)" },
    { id: "acc-11", name: "Josh (Crew)" }
  ];

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/items")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = ["ALL", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    if (statusFilter !== "ALL") {
      if (statusFilter === "AVAILABLE" && item.current_status !== "AVAILABLE") return false;
      if (statusFilter === "CHECKED_OUT" && item.current_status !== "CHECKED_OUT") return false;
      if (statusFilter === "MISSING" && item.current_status !== "MISSING") return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || 
             item.id.toLowerCase().includes(q) ||
             item.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleReportDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !damageCrewId || !damagePrice || !damageNote) return;
    setReportingDamage(true);

    try {
      const storedUser = localStorage.getItem("acaso_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : { id: "acc-1" };
      
      const res = await fetch("/api/damage-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: selectedItem.id,
          reported_by_account_id: currentUser.id,
          responsible_crew_id: damageCrewId,
          billing_price: parseFloat(damagePrice),
          note: damageNote
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowDamageDialog(false);
        setDamageCrewId("");
        setDamagePrice("");
        setDamageNote("");
        setSelectedItem(null);
        fetchItems(); // Reload items
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportingDamage(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <div className="px-6 py-4 bg-surface border-b border-border-whisper sticky top-0 z-20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">Store Inventory</h1>
          <div className="flex items-center gap-2 bg-surface-container-high p-1 rounded-lg">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-surface-plate text-on-surface shadow-sm" : "text-text-muted hover:text-on-surface")}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-surface-plate text-on-surface shadow-sm" : "text-text-muted hover:text-on-surface")}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search items, categories, or shelf location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-surface-plate border border-border-whisper rounded-xl pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 pb-1 md:pb-0">
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-12 bg-surface-plate border border-border-whisper rounded-xl px-4 text-sm font-sans font-semibold text-on-surface focus:outline-none cursor-pointer min-w-[140px]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
              ))}
            </select>
            
            <div className="flex items-center bg-surface-plate border border-border-whisper rounded-xl p-1 shrink-0">
              {["ALL", "AVAILABLE", "CHECKED_OUT", "MISSING"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-sans text-xs font-bold whitespace-nowrap transition-colors",
                    statusFilter === status 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-muted hover:text-on-surface hover:bg-surface-container-lowest"
                  )}
                >
                  {status === "CHECKED_OUT" ? "OUT" : status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-32">
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-surface-plate rounded-sm border border-border-whisper overflow-hidden flex flex-col h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-plate rounded-lg animate-pulse" />
              ))}
            </div>
          )
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-20">
            <Search size={48} className="text-text-muted mb-4" />
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">Nothing matches</h3>
            <p className="font-sans text-sm text-text-muted">
              Try a different category or clear the search criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <GridItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-whisper bg-surface-plate border border-border-whisper rounded-xl overflow-hidden shadow-sm">
            {filteredItems.map(item => (
              <ListItemRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Sheet */}
      {selectedItem && !showDamageDialog && (
        <ItemDetailsSheet 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onReportDamage={() => setShowDamageDialog(true)} 
        />
      )}

      {/* Report Damage Dialog */}
      {showDamageDialog && selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm" onClick={() => setShowDamageDialog(false)} />
          <div className="bg-surface-elevated w-full max-w-md rounded-2xl border border-border-whisper p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-on-surface">Report Damage / Billing</h3>
              <button onClick={() => setShowDamageDialog(false)} className="text-text-muted hover:text-on-surface">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleReportDamage} className="flex flex-col gap-4">
              <div className="bg-surface-plate border border-border-whisper rounded-xl p-3 flex items-center gap-3">
                {selectedItem.photos && selectedItem.photos[0] && (
                  <img src={selectedItem.photos[0]} alt={selectedItem.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex flex-col">
                  <span className="font-sans text-sm font-bold text-on-surface">{selectedItem.name}</span>
                  <span className="font-mono text-[10px] text-text-muted">{selectedItem.id}</span>
                </div>
              </div>

              <div>
                <label className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Responsible Crew Member</label>
                <select 
                  required
                  value={damageCrewId} 
                  onChange={e => setDamageCrewId(e.target.value)}
                  className="w-full h-11 bg-surface border border-border-whisper rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select crew responsible...</option>
                  {crewList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Repair / Replacement Price (₦)</label>
                <input 
                  required
                  type="number" 
                  placeholder="e.g. 25000"
                  value={damagePrice}
                  onChange={e => setDamagePrice(e.target.value)}
                  className="w-full h-11 bg-surface border border-border-whisper rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Damage Note / Explanation</label>
                <textarea 
                  required
                  placeholder="Describe what was broken and how..."
                  value={damageNote}
                  onChange={e => setDamageNote(e.target.value)}
                  className="w-full h-20 bg-surface border border-border-whisper rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={reportingDamage}
                className="w-full h-12 bg-status-alert text-white font-bold rounded-xl flex items-center justify-center gap-2 tactile-btn hover:opacity-90 transition-opacity"
              >
                {reportingDamage ? "Reporting..." : "Publish Damage & Bill"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GridItemCard({ item, onClick }: { item: any, onClick: () => void }) {
  const photo = item.photos && item.photos[0] ? item.photos[0] : "";
  return (
    <div 
      onClick={onClick}
      className="bg-surface-plate rounded-xl border border-border-whisper overflow-hidden flex flex-col h-56 cursor-pointer hover:border-primary/50 transition-colors shadow-sm group"
    >
      <div className="relative h-[60%] w-full bg-surface-container overflow-hidden">
        {photo && (
          <img 
            src={photo} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className={cn(
            "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm",
            item.current_status === "AVAILABLE" ? "bg-status-ready/90 text-white" :
            item.current_status === "CHECKED_OUT" ? "bg-status-transit/95 text-white" :
            "bg-status-alert/90 text-white"
          )}>
            {item.current_status === "CHECKED_OUT" ? "OUT" : item.current_status}
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[10px] font-extrabold text-text-muted uppercase tracking-wider">{item.category}</span>
          <span className="font-sans text-sm font-bold text-on-surface truncate">{item.name}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-muted font-semibold mt-1">
          <span className="font-mono">{item.id}</span>
          <span className="font-sans shrink-0 bg-surface-container-high px-1.5 py-0.5 rounded text-[10px]">{item.location || "Store"}</span>
        </div>
      </div>
    </div>
  );
}

function ListItemRow({ item, onClick }: { item: any, onClick: () => void }) {
  const photo = item.photos && item.photos[0] ? item.photos[0] : "";
  return (
    <div 
      onClick={onClick}
      className="p-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {photo ? (
          <img src={photo} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-muted shrink-0">
            <Box size={18} />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-sm font-bold text-on-surface truncate">{item.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-sans text-[10px] font-extrabold text-text-muted uppercase tracking-wider">{item.category}</span>
            <span className="text-text-muted text-[10px]">&bull;</span>
            <span className="font-mono text-xs text-text-muted">{item.id}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="font-sans text-xs text-text-muted bg-surface-container-highest px-2 py-0.5 rounded">{item.location || "Store"}</span>
        <span className={cn(
          "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider",
          item.current_status === "AVAILABLE" ? "bg-status-ready/10 text-status-ready" :
          item.current_status === "CHECKED_OUT" ? "bg-status-transit/10 text-status-transit" :
          "bg-status-alert/10 text-status-alert"
        )}>
          {item.current_status === "CHECKED_OUT" ? "OUT" : item.current_status}
        </span>
      </div>
    </div>
  );
}

function ItemDetailsSheet({ item, onClose, onReportDamage }: { item: any, onClose: () => void, onReportDamage: () => void }) {
  const photo = item.photos && item.photos[0] ? item.photos[0] : "";
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-surface-elevated w-full max-h-[85vh] rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-150 z-10">
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1 bg-border-whisper rounded-full cursor-grab" />
        </div>
        
        <div className="p-4 border-b border-border-whisper flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-on-surface">Item Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6 no-scrollbar">
          <div className="flex flex-col md:flex-row gap-6">
            {photo && (
              <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-square bg-surface-container rounded-xl overflow-hidden shrink-0">
                <img src={photo} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <span className="font-sans text-[10px] font-extrabold text-primary uppercase tracking-wider">{item.category}</span>
                <h1 className="font-display text-2xl font-bold text-on-surface mt-0.5">{item.name}</h1>
                <span className="font-mono text-xs text-text-muted mt-1 block">{item.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-border-whisper/50">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</span>
                  <span className={cn(
                    "font-sans text-sm font-bold",
                    item.current_status === "AVAILABLE" ? "text-status-ready" : "text-status-transit"
                  )}>{item.current_status}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Shelf Location</span>
                  <span className="font-sans text-sm font-bold text-on-surface flex items-center gap-1">
                    <MapPin size={14} className="text-text-muted" />
                    {item.location || "Main Store"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</span>
                <p className="font-sans text-sm text-on-surface mt-1 leading-relaxed">{item.description || "No description provided."}</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={onReportDamage} 
                  className="flex-1 h-12 bg-status-alert text-white rounded-xl font-bold flex items-center justify-center gap-2 tactile-btn"
                >
                  <AlertTriangle size={18} />
                  Report Damage / Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
