import React, { useState, useEffect } from "react";
import { ArrowRightFromLine, ArrowLeftToLine, Search, Plus, Calendar, AlertCircle, Users, CheckCircle2, X, AlertTriangle, ShieldAlert, Layers } from "lucide-react";
import { cn } from "../lib/utils";

export default function Movements({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"checkout" | "returns" | "batches">("checkout");
  const isManager = user.role === 'admin' || user.role === 'warehouse_manager';

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-4 bg-surface border-b border-border-whisper sticky top-0 z-30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-on-surface tracking-tight">Movements Terminal</h1>
          {isManager && (
             <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               Store Keeper Mode
             </span>
          )}
        </div>
        <div className="flex bg-surface-container-high rounded-xl p-1">
          <button 
            onClick={() => setActiveTab("checkout")}
            className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors", activeTab === 'checkout' ? 'bg-surface-plate text-on-surface shadow-sm' : 'text-text-muted hover:text-on-surface')}
          >
            BATCH PICKUP (CHECKOUT)
          </button>
          <button 
            onClick={() => setActiveTab("returns")}
            className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors", activeTab === 'returns' ? 'bg-surface-plate text-on-surface shadow-sm' : 'text-text-muted hover:text-on-surface')}
          >
            BITS & PARTS RETURNS
          </button>
          <button 
            onClick={() => setActiveTab("batches")}
            className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors", activeTab === 'batches' ? 'bg-surface-plate text-on-surface shadow-sm' : 'text-text-muted hover:text-on-surface')}
          >
            ACTIVE BATCHES
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {activeTab === "checkout" && <CheckoutFlow user={user} />}
        {activeTab === "returns" && <ReturnsFlow user={user} />}
        {activeTab === "batches" && <BatchesList />}
      </div>
    </div>
  );
}

// BATCH CHECKOUT FLOW
function CheckoutFlow({ user }: { user: any }) {
  const [step, setStep] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<any>(user);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [batchName, setBatchName] = useState("Morning Set Dispatch");
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const storeKeeper = { id: "acc-3", name: "Mr Tosin" }; // Store Keeper

  const crewList = [
    { id: "acc-1", name: "Krees" },
    { id: "acc-5", name: "Princess" },
    { id: "acc-6", name: "Loveth" },
    { id: "acc-2", name: "Habeeb" },
    { id: "acc-4", name: "Seyi" },
    { id: "acc-7", name: "Love" },
    { id: "acc-8", name: "Steph" },
    { id: "acc-9", name: "Miracle" },
    { id: "acc-10", name: "James" },
    { id: "acc-11", name: "Josh" }
  ];

  useEffect(() => {
    fetch("/api/items").then(res => res.json()).then(setItems);
  }, []);

  const handleAddItem = (item: any) => {
    if (!selectedItems.some(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, { ...item, condition_note: "" }]);
    }
    setSearchQuery("");
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  const handleItemNoteChange = (id: string, note: string) => {
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, condition_note: note } : i));
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const res = await fetch("/api/movements/checkout-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: "proj-1",
          person_in_charge_id: selectedPerson.id,
          store_keeper_id: storeKeeper.id,
          name: batchName,
          items: selectedItems
        })
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutSuccess(true);
        setTimeout(() => {
          reset();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedItems([]);
    setBatchName("Morning Set Dispatch");
    setCheckoutSuccess(false);
    setIsCheckingOut(false);
  };

  if (checkoutSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <CheckCircle2 size={64} className="text-status-ready mb-4" />
        <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Batch Dispatched Successfully</h2>
        <p className="font-sans text-sm text-text-muted mb-8">
          Person in Charge: <strong>{selectedPerson.name}</strong> &bull; Verifying Keeper: <strong>Mr Tosin</strong>
        </p>
        <button onClick={reset} className="h-12 px-6 bg-primary text-white font-bold rounded-xl tactile-btn">
          Start New Batch Pickup
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
      {/* Step 1: Responsible Person */}
      <div className={cn("flex flex-col gap-3 transition-opacity", step < 1 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">1</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">Who is picking up the batch?</h2>
        </div>
        <div className="pl-11">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {crewList.map((p) => (
              <button 
                key={p.id}
                onClick={() => { setSelectedPerson(p); setStep(Math.max(step, 2)); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-xl whitespace-nowrap transition-colors tactile-btn",
                  selectedPerson?.id === p.id 
                    ? "border-primary bg-primary/5 text-primary font-bold" 
                    : "border-border-whisper bg-surface-plate text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span className="text-sm">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Batch Details */}
      <div className={cn("flex flex-col gap-3 transition-opacity", step < 2 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">2</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">Batch Identification / Name</h2>
        </div>
        <div className="pl-11">
          <input 
            type="text"
            value={batchName}
            onChange={e => setBatchName(e.target.value)}
            placeholder="e.g. Living Room Scene A Props"
            className="w-full h-12 bg-surface-plate border border-border-whisper rounded-xl px-4 text-sm font-sans outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Step 3: Add Items to Batch */}
      <div className={cn("flex flex-col gap-3 transition-opacity", step < 2 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">3</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">Add items to this pickup batch</h2>
        </div>
        
        <div className="pl-11 flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text"
              placeholder="Search store inventory to add..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-surface border border-border-whisper rounded-xl pl-10 pr-4 text-sm font-sans outline-none focus:border-primary"
            />
            {searchQuery && (
              <div className="absolute top-14 left-0 w-full bg-surface-elevated border border-border-whisper rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto divide-y divide-border-whisper">
                {items.filter(i => i.current_status === 'AVAILABLE' && i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="flex justify-between items-center p-3 hover:bg-surface-container-low text-left w-full"
                  >
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-bold text-on-surface">{item.name}</span>
                      <span className="font-mono text-xs text-text-muted">{item.id}</span>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">ADD</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">Items in Batch ({selectedItems.length})</span>
              <div className="flex flex-col gap-3">
                {selectedItems.map(item => (
                  <div key={item.id} className="bg-surface-plate border border-border-whisper rounded-xl p-3 flex flex-col gap-2 relative">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-text-muted hover:text-status-alert"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-bold text-on-surface">{item.name}</span>
                      <span className="font-mono text-xs text-text-muted">{item.id}</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add Condition Note Out..."
                      value={item.condition_note}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      className="bg-surface border border-border-whisper rounded-lg h-9 px-3 text-xs font-sans focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || selectedItems.length === 0}
                className="h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 tactile-btn disabled:opacity-50 mt-4 shadow-md"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRightFromLine size={20} />
                )}
                Confirm Dispatch (Verified by Mr Tosin)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BITS & PARTS RETURNS FLOW
function ReturnsFlow({ user }: { user: any }) {
  const [activeMovements, setActiveMovements] = useState<any[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  useEffect(() => {
    fetch("/api/movements/active").then(res => res.json()).then(setActiveMovements);
  }, []);

  const handleVerify = async (payload: {
    movement_id: string;
    item_id: string;
    quantity_damaged: number;
    condition_note_in: string;
    damage_note?: string;
    responsible_crew_id?: string;
    billing_price?: number;
  }) => {
    const res = await fetch("/api/movements/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        quantity_returned: 1,
        return_verified_by_account_id: user.id
      })
    });
    
    const data = await res.json();
    if (data.success) {
      setActiveMovements(activeMovements.filter(m => m.id !== payload.movement_id));
      setSelectedReturn(null);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full">
      <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide mb-4">Pending Store Returns</h2>
      
      <div className="flex flex-col gap-3">
        {activeMovements.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedReturn(m)}
            className="bg-surface-plate border border-border-whisper rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-primary/50 transition-colors tactile-btn"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-bold text-text-muted shrink-0">
                {m.item_id.substring(0,4)}
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm font-bold text-on-surface">{m.item_name}</span>
                <span className="font-sans text-xs text-text-muted mt-1">Out with: <strong>{m.checkout_person_name}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between md:justify-end">
              <span className="font-mono text-xs text-text-muted">Batch ID: {m.batch_id || "None"}</span>
              <button className="bg-surface-container-highest px-3 py-1.5 rounded-lg text-xs font-bold text-primary">Verify Return</button>
            </div>
          </div>
        ))}
        {activeMovements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 size={48} className="text-status-ready mb-4" />
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">All clear</h3>
            <p className="font-sans text-sm text-text-muted">No items checked out. Ready to go!</p>
          </div>
        )}
      </div>

      {selectedReturn && (
        <ReturnVerificationSheet 
          movement={selectedReturn} 
          currentUser={user}
          onClose={() => setSelectedReturn(null)} 
          onVerify={handleVerify} 
        />
      )}
    </div>
  );
}

function ReturnVerificationSheet({ movement, currentUser, onClose, onVerify }: { movement: any, currentUser: any, onClose: () => void, onVerify: (p: any) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [isDamaged, setIsDamaged] = useState(false);
  const [damagePrice, setDamagePrice] = useState("");
  const [damageNote, setDamageNote] = useState("");
  const [responsibleCrewId, setResponsibleCrewId] = useState(movement.checkout_account_id);
  const [isVerifying, setIsVerifying] = useState(false);

  const isSelf = movement.checkout_account_id === currentUser.id;

  const crewList = [
    { id: "acc-2", name: "Habeeb (Woodwork)" },
    { id: "acc-4", name: "Seyi (Woodwork)" },
    { id: "acc-7", name: "Love (Crew)" },
    { id: "acc-8", name: "Steph (Crew)" },
    { id: "acc-9", name: "Miracle (Crew)" },
    { id: "acc-10", name: "James (Crew)" },
    { id: "acc-11", name: "Josh (Crew)" }
  ];

  const handleVerifyClick = async () => {
    setIsVerifying(true);
    try {
      await onVerify({
        movement_id: movement.id,
        item_id: movement.item_id,
        quantity_damaged: isDamaged ? 1 : 0,
        condition_note_in: note || (isDamaged ? "Returned Damaged" : "Good Condition"),
        damage_note: isDamaged ? damageNote : undefined,
        responsible_crew_id: isDamaged ? responsibleCrewId : undefined,
        billing_price: isDamaged ? parseFloat(damagePrice) : undefined
      });
      onClose();
    } catch {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface-elevated w-full max-h-[90vh] rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-150 z-10">
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1 bg-border-whisper rounded-full cursor-grab" />
        </div>
        <div className="p-4 border-b border-border-whisper flex justify-between items-center">
          <h2 className="font-display text-xl font-bold">Verify Store Return with Mr Tosin</h2>
          <button onClick={onClose} className="text-text-muted hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6 no-scrollbar">
          <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border-whisper">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center font-bold text-text-muted">
              {movement.item_id.substring(0,4)}
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-bold text-on-surface">{movement.item_name}</span>
              <span className="font-sans text-xs text-text-muted mt-0.5">Checked out by: <strong>{movement.checkout_person_name}</strong></span>
              <span className="font-mono text-xs text-text-muted">Batch ID: {movement.batch_id || "N/A"}</span>
            </div>
          </div>

          {isSelf ? (
            <div className="mt-4 flex items-center gap-3 p-4 bg-status-alert/10 border border-status-alert/30 rounded-xl">
              <AlertTriangle size={20} className="text-status-alert shrink-0" />
              <span className="font-sans text-sm font-bold text-status-alert">
                Strict Security Protocol: You cannot verify your own return. Please call Store Keeper (Mr Tosin) or another manager to verify.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-border-whisper/50">
                <input 
                  type="checkbox" 
                  id="damaged-check" 
                  checked={isDamaged} 
                  onChange={e => setIsDamaged(e.target.checked)} 
                  className="rounded border-border-whisper bg-surface h-5 w-5 focus:ring-primary text-primary"
                />
                <label htmlFor="damaged-check" className="font-sans text-sm font-bold text-on-surface cursor-pointer">
                  Is this item damaged or broken?
                </label>
              </div>

              {isDamaged ? (
                <div className="flex flex-col gap-4 bg-status-alert/5 p-4 rounded-xl border border-status-alert/20 animate-in slide-in-from-top-2">
                  <div>
                    <label className="font-sans text-xs font-bold text-text-muted uppercase block mb-1">Responsible Crew Member</label>
                    <select 
                      value={responsibleCrewId}
                      onChange={e => setResponsibleCrewId(e.target.value)}
                      className="w-full h-11 bg-surface border border-border-whisper rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                    >
                      {crewList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-sans text-xs font-bold text-text-muted uppercase block mb-1">Billing Fine / Repair Price (₦)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15000"
                      value={damagePrice}
                      onChange={e => setDamagePrice(e.target.value)}
                      className="w-full h-11 bg-surface border border-border-whisper rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-xs font-bold text-text-muted uppercase block mb-1">Damage Description</label>
                    <textarea 
                      placeholder="Specify the damage detail..."
                      value={damageNote}
                      onChange={e => setDamageNote(e.target.value)}
                      className="w-full h-16 bg-surface border border-border-whisper rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm font-bold text-text-muted">Verification / Condition Note In</label>
                  <textarea 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="All good / Returned in baseline condition"
                    className="w-full h-20 bg-surface border border-border-whisper rounded-xl p-3 text-sm font-sans focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              )}

              <button 
                onClick={handleVerifyClick}
                disabled={isVerifying}
                className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 tactile-btn disabled:opacity-50 mt-4"
              >
                {isVerifying ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowLeftToLine size={20} />
                )}
                {isVerifying ? "Verifying..." : "Verify & Receive to Store"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BATCH LIST DISPLAY WITH EXPANSION DETAILS
function BatchesList() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/batches")
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-sm text-text-muted">Loading active batches...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col gap-4">
      <h2 className="font-sans text-sm font-bold text-text-muted uppercase tracking-wide">Pickup & Dispatch Batches</h2>
      {batches.length === 0 ? (
        <div className="text-center py-12 text-sm text-text-muted">No active batches recorded.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {batches.map(batch => (
            <div key={batch.id} className="bg-surface-plate border border-border-whisper rounded-xl overflow-hidden shadow-sm">
              <div 
                onClick={() => setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold text-on-surface">{batch.name}</span>
                    <span className="font-sans text-xs text-text-muted mt-0.5">
                      Responsible: <strong>{batch.crew_name}</strong> &bull; Verifier: <strong>{batch.store_keeper_name || "Mr Tosin"}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-sans text-xs font-bold text-on-surface">{batch.item_count} items</span>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    batch.active_count > 0 ? "bg-status-transit/10 text-status-transit" : "bg-status-ready/10 text-status-ready"
                  )}>
                    {batch.active_count > 0 ? `${batch.active_count} Out` : "All Returned"}
                  </span>
                </div>
              </div>

              {expandedBatchId === batch.id && batch.details && (
                <div className="bg-surface-container-lowest p-4 border-t border-border-whisper/50 flex flex-col gap-3 animate-in slide-in-from-top-2">
                  <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">Batch Details: Pickup vs Return Status</span>
                  <div className="flex flex-col divide-y divide-border-whisper/50">
                    {batch.details.map((item: any) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-on-surface">{item.item_name}</span>
                          <span className="font-mono text-xs text-text-muted">{item.item_id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.condition_note_out && (
                            <span className="font-sans text-xs text-text-muted italic">Out Note: "{item.condition_note_out}"</span>
                          )}
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            item.status === "active" ? "bg-status-transit/10 text-status-transit" : "bg-status-ready/10 text-status-ready"
                          )}>
                            {item.status === "active" ? "Still Out" : "Returned"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
