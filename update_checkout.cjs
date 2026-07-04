const fs = require('fs');
let code = fs.readFileSync('src/pages/Movements.tsx', 'utf8');

// I'll manually replace the CheckoutFlow function string.
const oldCheckoutFlowStart = `function CheckoutFlow({ user }: { user: any }) {`;
const startIdx = code.indexOf(oldCheckoutFlowStart);
if (startIdx === -1) throw new Error("Could not find CheckoutFlow");
const endIdx = code.indexOf(`function ReturnsFlow`, startIdx);

const newCheckoutFlow = `
function CheckoutFlow({ user }: { user: any }) {
  const [step, setStep] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<any>(user);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [expectedReturn, setExpectedReturn] = useState("End of Week");
  const [conditionNote, setConditionNote] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetch("/api/items").then(res => res.json()).then(setItems);
  }, []);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // API Call mocked here
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    const res = await fetch("/api/movements/batch-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: selectedItems.map(i => i.id),
        checkout_account_id: selectedPerson.id,
        project_id: "proj-1",
        condition_note_out: conditionNote
      })
    });
    setCheckoutSuccess(true);
    setTimeout(() => {
      reset();
    }, 1200);
  };

  const reset = () => {
    setStep(1);
    setSelectedItems([]);
    setConditionNote("");
    setCheckoutSuccess(false);
    setIsCheckingOut(false);
  };

  if (checkoutSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <CheckCircle2 size={64} className="text-status-ready mb-4" />
        <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Batch Checked Out</h2>
        <p className="font-sans text-sm text-text-muted mb-8">Assigned to {selectedPerson.name}.</p>
        <button onClick={reset} className="h-12 px-6 bg-primary text-white font-bold rounded-sm tactile-btn">
          Start New Checkout
        </button>
      </div>
    );
  }

  const isHighValue = selectedItems.some(i => i.is_high_value === 1);
  const toggleItem = (item: any) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
      setStep(Math.max(step, 3));
    }
  };

  // The people available for checkout. In real app, this comes from API
  const availablePeople = [user, {id:'acc-5', name:'Love'}, {id:'acc-6', name:'Steph'}, {id:'acc-7', name:'Habeeb'}, {id:'acc-8', name:'Seyi'}];
  // make sure user is at front, remove dupe if any
  const people = [user, ...availablePeople.filter(p => p.id !== user.id)];

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
      {/* Step 1: Who */}
      <div className={cn("flex flex-col gap-3 transition-opacity", step < 1 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">1</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">Who is responsible?</h2>
        </div>
        <div className="pl-11">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {people.map((p, i) => (
              <button 
                key={p.id + i}
                onClick={() => { setSelectedPerson(p); setStep(Math.max(step, 2)); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-sm whitespace-nowrap transition-colors tactile-btn",
                  selectedPerson?.id === p.id 
                    ? "border-primary bg-primary/5 text-primary font-bold" 
                    : "border-border-whisper bg-surface-plate text-on-surface hover:bg-surface-container-low"
                )}
              >
                <div className="w-6 h-6 rounded-sm bg-surface-container flex items-center justify-center text-xs font-bold text-text-muted">
                  {p.name.charAt(0)}
                </div>
                <span className="text-sm">{p.id === user.id ? "Me" : p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: What */}
      <div className={cn("flex flex-col gap-3 transition-opacity", step < 2 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">2</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">What is in the batch?</h2>
        </div>
        <div className="pl-11 flex flex-col gap-3">
          <div className="flex flex-col gap-3 bg-surface-plate border border-border-whisper rounded-sm p-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text"
                placeholder="Scan or search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-surface border border-border-whisper rounded-sm pl-10 pr-4 text-sm font-sans outline-none focus:border-primary"
              />
            </div>
            
            {selectedItems.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border-whisper">
                <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">Selected ({selectedItems.length})</span>
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-surface border border-primary/30 rounded-sm p-2">
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-bold text-on-surface">{item.name}</span>
                      <span className="font-mono text-xs text-text-muted">{item.id}</span>
                    </div>
                    <button onClick={() => toggleItem(item)} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-status-alert rounded-sm">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto flex flex-col divide-y divide-border-whisper pt-2">
              {items.filter(i => i.current_status === 'AVAILABLE' && (!searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())) && !selectedItems.find(s => s.id === i.id)).slice(0, 5).map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className="flex justify-between items-center p-2 hover:bg-surface-container-lowest text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold text-on-surface">{item.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">{item.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.is_high_value === 1 && <span className="text-[10px] bg-status-transit/10 text-status-transit font-bold px-1.5 rounded">HIGH VALUE</span>}
                    <div className="w-6 h-6 flex items-center justify-center border border-border-whisper rounded-sm">
                      <span className="text-primary">+</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Verify & Confirm */}
      <div className={cn("flex flex-col gap-3 transition-opacity pb-12", step < 3 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-muted">3</div>
          <h2 className="font-sans text-lg font-bold text-on-surface">Confirm Batch</h2>
        </div>
        <div className="pl-11 flex flex-col gap-3">
          {isHighValue && (
             <div className="flex items-start gap-3 p-3 bg-status-transit/10 border border-status-transit/30 rounded-sm">
               <AlertTriangle size={18} className="text-status-transit shrink-0 mt-0.5" />
               <div className="flex flex-col">
                 <span className="font-sans text-sm font-bold text-status-transit">High Value Items Included</span>
                 <span className="font-sans text-xs text-status-transit/80 mt-1">Pre-condition photos and notes are required for this batch.</span>
               </div>
             </div>
          )}
          
          <textarea 
            placeholder="Add condition notes for the batch..."
            value={conditionNote}
            onChange={e => setConditionNote(e.target.value)}
            className="w-full h-24 bg-surface-plate border border-border-whisper rounded-sm p-3 text-sm font-sans focus:outline-none focus:border-primary resize-none"
          />
          <button 
            disabled={selectedItems.length === 0 || !selectedPerson || (isHighValue && !conditionNote.trim()) || checkoutSuccess}
            onClick={handleCheckout}
            className={cn(
              "h-14 font-bold rounded-sm flex items-center justify-center gap-2 tactile-btn disabled:opacity-50 disabled:pointer-events-none mt-2 transition-colors duration-300",
              checkoutSuccess ? "bg-status-ready text-white" : "bg-primary text-white"
            )}
          >
            {checkoutSuccess ? (
              <CheckCircle2 size={20} />
            ) : isCheckingOut ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRightFromLine size={20} />
            )}
            {checkoutSuccess ? "Checked Out ✓" : isCheckingOut ? "Confirming..." : "Confirm Batch Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
\n`;

code = code.substring(0, startIdx) + newCheckoutFlow + code.substring(endIdx);
fs.writeFileSync('src/pages/Movements.tsx', code);

