const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
app.get("/api/batches/active", (req, res) => {
  const batches = db.prepare(\`
    SELECT b.*, a.name as person_name 
    FROM batches b
    JOIN accounts a ON b.account_id = a.id
    WHERE b.type = 'checkout'
    ORDER BY b.created_at DESC
  \`).all();

  const movements = db.prepare(\`
    SELECT m.*, i.name as item_name, i.category as item_category, i.photos, i.billing_price 
    FROM movements m
    JOIN items i ON m.item_id = i.id
    WHERE m.status = 'active'
  \`).all();

  // Attach movements to their respective batches
  batches.forEach(b => {
    b.movements = movements.filter(m => m.batch_id === b.id);
  });
  
  // Filter out batches that have no active movements
  const activeBatches = batches.filter(b => b.movements.length > 0);

  res.json(activeBatches);
});

app.post("/api/movements/batch-checkout", (req, res) => {
  const { items, checkout_account_id, project_id, condition_note_out } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: "No items" });
  
  const batchId = "batch-" + Math.floor(Math.random() * 100000);
  const insertBatch = db.prepare("INSERT INTO batches (id, project_id, account_id, type) VALUES (?, ?, ?, 'checkout')");
  insertBatch.run(batchId, project_id || null, checkout_account_id);
  
  const insertMovement = db.prepare(\`
    INSERT INTO movements (id, item_id, batch_id, quantity_out, checkout_account_id, project_id, condition_note_out, checked_out_at, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  \`);
  const updateItem = db.prepare("UPDATE items SET current_status = 'CHECKED_OUT' WHERE id = ?");

  const checkoutTime = new Date().toISOString();
  db.transaction(() => {
    for (const item_id of items) {
      const id = "trx-" + Math.floor(Math.random() * 100000);
      insertMovement.run(id, item_id, batchId, 1, checkout_account_id, project_id || null, condition_note_out || null, checkoutTime);
      updateItem.run(item_id);
    }
  })();
  
  res.json({ success: true, batch_id: batchId });
});
`;

code = code.replace("app.get(\"/api/movements/active\",", newRoutes + "\n\napp.get(\"/api/movements/active\",");
fs.writeFileSync('server.ts', code);
