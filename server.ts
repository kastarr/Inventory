import express from "express";
import path from "path";
import cors from "cors";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database("acaso.db");

// Drop existing tables to ensure schema updates apply cleanly for this demo draft
db.exec(`
  DROP TABLE IF EXISTS flags;
  DROP TABLE IF EXISTS movements;
  DROP TABLE IF EXISTS handover_notes;
  DROP TABLE IF EXISTS items;
  DROP TABLE IF EXISTS accounts;
  DROP TABLE IF EXISTS projects;
  DROP TABLE IF EXISTS sync_queue;
  DROP TABLE IF EXISTS damage_reports;
  DROP TABLE IF EXISTS batches;
`);

// Schema Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('crew', 'warehouse_manager', 'admin')),
    active_project_ids TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    production_company TEXT NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status TEXT NOT NULL CHECK(status IN ('active', 'wrapped', 'upcoming')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    photos TEXT,
    description TEXT,
    baseline_condition TEXT,
    current_status TEXT NOT NULL CHECK(current_status IN ('AVAILABLE', 'CHECKED_OUT', 'IN_USE_ELSEWHERE', 'RESERVED', 'MISSING')),
    location TEXT,
    is_high_value INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    person_in_charge_id TEXT NOT NULL,
    store_keeper_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('pickup', 'return')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movements (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    quantity_out INTEGER NOT NULL,
    quantity_returned INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,
    quantity_missing INTEGER GENERATED ALWAYS AS (quantity_out - quantity_returned - quantity_damaged) VIRTUAL,
    checkout_account_id TEXT NOT NULL,
    return_verified_by_account_id TEXT,
    project_id TEXT,
    condition_note_out TEXT,
    condition_note_in TEXT,
    photos_out TEXT,
    photos_in TEXT,
    checked_out_at DATETIME NOT NULL,
    expected_return_date DATETIME,
    returned_at DATETIME,
    status TEXT NOT NULL CHECK(status IN ('active', 'returned', 'flagged')),
    batch_id TEXT,
    CHECK (return_verified_by_account_id IS NULL OR return_verified_by_account_id != checkout_account_id)
  );

  CREATE TABLE IF NOT EXISTS damage_reports (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    movement_id TEXT,
    reported_by_account_id TEXT NOT NULL,
    responsible_crew_id TEXT NOT NULL,
    billing_price REAL DEFAULT 0.0,
    note TEXT NOT NULL,
    resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS flags (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    movement_id TEXT,
    flagged_by_account_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS handover_notes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    written_by_account_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0,
    synced_at DATETIME,
    conflict INTEGER DEFAULT 0
  );
`);

// Seed Accounts
const seedAccounts = db.prepare("INSERT INTO accounts (id, name, phone_number, pin_hash, role, active_project_ids) VALUES (?, ?, ?, ?, ?, ?)");
seedAccounts.run("acc-1", "Krees", "555-0100", "1234", "admin", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-2", "Habeeb", "555-0101", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-3", "Mr Tosin", "555-0102", "1234", "warehouse_manager", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-4", "Seyi", "555-0103", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-5", "Princess", "555-0104", "1234", "admin", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-6", "Loveth", "555-0105", "1234", "admin", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-7", "Love", "555-0106", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-8", "Steph", "555-0107", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-9", "Miracle", "555-0108", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-10", "James", "555-0109", "1234", "crew", JSON.stringify(["proj-1"]));
seedAccounts.run("acc-11", "Josh", "555-0110", "1234", "crew", JSON.stringify(["proj-1"]));

// Seed Projects
const seedProjects = db.prepare("INSERT INTO projects (id, name, production_company, status) VALUES (?, ?, ?, ?)");
seedProjects.run("proj-1", "Acaso Productions", "EbonyLife Films", "active");

// Seed Items
const seedItems = db.prepare("INSERT INTO items (id, name, category, subcategory, photos, description, baseline_condition, current_status, location, is_high_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

// Unsplash stock photos representing realistic props and set dressing
const stockPhotos: Record<string, string[]> = {
  'FURNITURE': [
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400"
  ],
  'DECOR': [
    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=400"
  ],
  'PROPS': [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1584282479918-68725139a04a?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400"
  ],
  'FABRICS': [
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=400"
  ]
};

const appCategories = {
  'FURNITURE': ["Velvet Sofa", "Royal Armchair", "Dining Table", "Carved Bench", "Wooden Stool", "Console Cabinet"],
  'DECOR': ["Ceramic Vase", "Gilded Mirror", "Bronze Sculpture", "Traditional Calabash", "Scented Candle Stand"],
  'PROPS': ["Vintage Camera", "Wooden Talking Drum", "Woven Palm Basket", "Antique Radio", "Ceremonial Staff"],
  'FABRICS': ["Aso-Oke Throw", "Lace Curtain", "Ankara Tablecloth", "Woven Tapestry", "Velvet Backdrop"]
};

let itemIndex = 1;
for (const [category, names] of Object.entries(appCategories)) {
  names.forEach((itemName, index) => {
    const skuId = `${category.substring(0, 4)}-${String(itemIndex).padStart(4, '0')}`;
    const photosList = stockPhotos[category] || stockPhotos['PROPS'];
    const photo = photosList[index % photosList.length];
    
    // Distribute item status
    let status: 'AVAILABLE' | 'CHECKED_OUT' | 'MISSING' = 'AVAILABLE';
    if (itemIndex % 7 === 0) status = 'CHECKED_OUT';
    else if (itemIndex % 13 === 0) status = 'MISSING';

    const shelf = `Shelf ${String.fromCharCode(65 + (itemIndex % 4))}-${itemIndex % 3 + 1}`;
    const isHighValue = (itemIndex % 5 === 0) ? 1 : 0;
    
    seedItems.run(
      skuId,
      `${itemName} (${["Brown", "Gold", "Ivory", "Indigo", "Amber"][itemIndex % 5]})`,
      category,
      itemName.split(' ').pop(),
      JSON.stringify([photo]),
      `Premium ${itemName.toLowerCase()} sourced for movie productions.`,
      "Excellent condition",
      status,
      shelf,
      isHighValue
    );
    
    if (status === 'CHECKED_OUT') {
      const seedMovements = db.prepare(`
        INSERT INTO movements 
        (id, item_id, quantity_out, checkout_account_id, project_id, checked_out_at, expected_return_date, status, batch_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      seedMovements.run(
        `trx-${itemIndex}`,
        skuId,
        1,
        ["acc-2", "acc-4", "acc-7", "acc-8"][itemIndex % 4],
        "proj-1",
        new Date(Date.now() - 86400000 * (itemIndex % 3 + 1)).toISOString(),
        new Date(Date.now() + 86400000 * 3).toISOString(),
        "active",
        "batch-mock-1"
      );
    }
    
    itemIndex++;
  });
}

// Seed a mock batch
db.prepare(`
  INSERT OR IGNORE INTO batches (id, project_id, person_in_charge_id, store_keeper_id, name, type)
  VALUES ('batch-mock-1', 'proj-1', 'acc-2', 'acc-3', 'Morning Set Pickup (Main Store)', 'pickup')
`).run();

// Seed initial damage reports
const seedDamage = db.prepare(`
  INSERT INTO damage_reports (id, item_id, movement_id, reported_by_account_id, responsible_crew_id, billing_price, note, resolved)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
seedDamage.run("dmg-1", "FURN-0001", "trx-7", "acc-3", "acc-2", 45000.0, "Leg cracked during transport to Set A.", 0);
seedDamage.run("dmg-2", "DECO-0002", "trx-14", "acc-3", "acc-4", 12000.0, "Chipped paint on the calabash decoration.", 0);

// --- API ROUTES ---

app.post("/api/auth/login", (req, res) => {
  const { phone_number, pin } = req.body;
  const stmt = db.prepare("SELECT id, name, role, active_project_ids FROM accounts WHERE phone_number = ? AND pin_hash = ?");
  const account = stmt.get(phone_number, pin) as any;
  
  if (account) {
    if (account.active_project_ids) {
      account.active_project_ids = JSON.parse(account.active_project_ids);
    } else {
      account.active_project_ids = [];
    }
    res.json({ success: true, account });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/api/projects/:id", (req, res) => {
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  res.json(project);
});

app.get("/api/items", (req, res) => {
  const items = db.prepare("SELECT * FROM items").all();
  items.forEach((item: any) => {
    if (item.photos) item.photos = JSON.parse(item.photos);
  });
  res.json(items);
});

app.get("/api/movements/active", (req, res) => {
  const movements = db.prepare(`
    SELECT m.*, i.name as item_name, i.category as item_category, a.name as checkout_person_name
    FROM movements m 
    JOIN items i ON m.item_id = i.id 
    JOIN accounts a ON m.checkout_account_id = a.id
    WHERE m.status = 'active'
    ORDER BY m.checked_out_at DESC LIMIT 100
  `).all();
  res.json(movements);
});

// Create Batch Checkout
app.post("/api/movements/checkout-batch", (req, res) => {
  const { project_id, person_in_charge_id, store_keeper_id, name, items } = req.body;
  
  const batchId = "batch-" + Math.floor(Math.random() * 100000);
  
  // Insert Batch
  db.prepare(`
    INSERT INTO batches (id, project_id, person_in_charge_id, store_keeper_id, name, type) 
    VALUES (?, ?, ?, ?, ?, 'pickup')
  `).run(batchId, project_id, person_in_charge_id, store_keeper_id, name);
  
  // Insert individual movements
  const insertMovement = db.prepare(`
    INSERT INTO movements (id, item_id, quantity_out, checkout_account_id, project_id, condition_note_out, checked_out_at, status, batch_id) 
    VALUES (?, ?, 1, ?, ?, ?, ?, 'active', ?)
  `);
  
  const updateItemStatus = db.prepare(`
    UPDATE items SET current_status = 'CHECKED_OUT' WHERE id = ?
  `);

  const tx = db.transaction(() => {
    for (const item of items) {
      const movementId = "trx-" + Math.floor(Math.random() * 100000);
      insertMovement.run(
        movementId,
        item.id,
        person_in_charge_id,
        project_id,
        item.condition_note || null,
        new Date().toISOString(),
        batchId
      );
      updateItemStatus.run(item.id);
    }
  });
  
  tx();
  res.json({ success: true, batch_id: batchId });
});

// Single Return inside verification
app.post("/api/movements/return", (req, res) => {
  const { movement_id, item_id, quantity_returned, quantity_damaged, return_verified_by_account_id, condition_note_in, damage_note, responsible_crew_id, billing_price } = req.body;
  
  const movement = db.prepare("SELECT checkout_account_id FROM movements WHERE id = ?").get(movement_id) as any;
  if (!movement) {
    return res.status(404).json({ success: false, error: "Movement not found." });
  }
  
  // STRICT RULE ENFORCEMENT: Structurally prevent self-verification
  if (movement.checkout_account_id === return_verified_by_account_id) {
    return res.status(403).json({ 
      success: false, 
      error: "You cannot verify your own return. A second person must confirm this." 
    });
  }

  const tx = db.transaction(() => {
    // Update movement status
    db.prepare(`
      UPDATE movements SET 
        quantity_returned = ?, 
        quantity_damaged = ?, 
        return_verified_by_account_id = ?, 
        condition_note_in = ?, 
        returned_at = ?, 
        status = ?
      WHERE id = ?
    `).run(
      quantity_returned,
      quantity_damaged || 0,
      return_verified_by_account_id,
      condition_note_in || null,
      new Date().toISOString(),
      (quantity_damaged > 0) ? 'flagged' : 'returned',
      movement_id
    );
    
    // Update item status
    db.prepare("UPDATE items SET current_status = 'AVAILABLE' WHERE id = ?").run(item_id);
    
    // If damaged, report damage
    if (quantity_damaged > 0) {
      const dmgId = "dmg-" + Math.floor(Math.random() * 100000);
      db.prepare(`
        INSERT INTO damage_reports (id, item_id, movement_id, reported_by_account_id, responsible_crew_id, billing_price, note, resolved)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(dmgId, item_id, movement_id, return_verified_by_account_id, responsible_crew_id, billing_price || 0.0, damage_note || "Damaged during checkout/return", 0);
    }
  });

  try {
    tx();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Damage Reports API
app.get("/api/damage-reports", (req, res) => {
  const reports = db.prepare(`
    SELECT r.*, i.name as item_name, a1.name as reporter_name, a2.name as responsible_person_name
    FROM damage_reports r
    JOIN items i ON r.item_id = i.id
    JOIN accounts a1 ON r.reported_by_account_id = a1.id
    JOIN accounts a2 ON r.responsible_crew_id = a2.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(reports);
});

app.post("/api/damage-reports", (req, res) => {
  const { item_id, reported_by_account_id, responsible_crew_id, billing_price, note } = req.body;
  const id = "dmg-" + Math.floor(Math.random() * 100000);
  try {
    db.prepare(`
      INSERT INTO damage_reports (id, item_id, reported_by_account_id, responsible_crew_id, billing_price, note, resolved)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, item_id, reported_by_account_id, responsible_crew_id, billing_price || 0.0, note);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Batches list API
app.get("/api/batches", (req, res) => {
  const batches = db.prepare(`
    SELECT b.*, p.name as project_name, a1.name as crew_name, a2.name as store_keeper_name,
           (SELECT COUNT(*) FROM movements m WHERE m.batch_id = b.id) as item_count,
           (SELECT COUNT(*) FROM movements m WHERE m.batch_id = b.id AND m.status = 'active') as active_count
    FROM batches b
    JOIN projects p ON b.project_id = p.id
    JOIN accounts a1 ON b.person_in_charge_id = a1.id
    JOIN accounts a2 ON b.store_keeper_id = a2.id
    ORDER BY b.created_at DESC
  `).all();
  
  // For each batch, get movements details
  batches.forEach((batch: any) => {
    batch.details = db.prepare(`
      SELECT m.*, i.name as item_name, i.category as item_category
      FROM movements m
      JOIN items i ON m.item_id = i.id
      WHERE m.batch_id = ?
    `).all(batch.id);
  });
  
  res.json(batches);
});

app.post("/api/sync", (req, res) => {
  res.json({ success: true });
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
