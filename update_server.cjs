const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add billing_price to items
code = code.replace(
  "is_high_value INTEGER DEFAULT 0,",
  "is_high_value INTEGER DEFAULT 0,\n    billing_price INTEGER DEFAULT 0,"
);

// Update seed items to have billing price
code = code.replace(
  "INSERT OR IGNORE INTO items (id, name, category, subcategory, current_status, is_high_value, photos) VALUES (?, ?, ?, ?, ?, ?, ?)",
  "INSERT OR IGNORE INTO items (id, name, category, subcategory, current_status, is_high_value, photos, billing_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

code = code.replace(
  "seedItems.run(skuId, name, category, subcategory, status, isHighValue, JSON.stringify([photo]));",
  "seedItems.run(skuId, name, category, subcategory, status, isHighValue, JSON.stringify([photo]), (i * 5000) + 10000);"
);

// We need to seed some batches so it looks right.
code = code.replace(
  "const movementId = \"trx-\" + idCounter;",
  `const batchId = "batch-" + Math.floor(idCounter/5);
      db.prepare("INSERT OR IGNORE INTO batches (id, project_id, account_id, type) VALUES (?, ?, ?, ?)").run(batchId, "proj-1", acct, "checkout");
      const movementId = "trx-" + idCounter;`
);

code = code.replace(
  "movementId, skuId, 1, acct, \"proj-1\",",
  "movementId, skuId, batchId, 1, acct, \"proj-1\"," // Wait, I added batch_id as 3rd param in schema: id, item_id, batch_id, quantity_out
);
// Schema is: (id, item_id, quantity_out, checkout_account_id, project_id, checked_out_at, expected_return_date, status)
// We need to change the insert query for movements in seed
code = code.replace(
  "(id, item_id, quantity_out, checkout_account_id, project_id, checked_out_at, expected_return_date, status)",
  "(id, item_id, batch_id, quantity_out, checkout_account_id, project_id, checked_out_at, expected_return_date, status)"
);
code = code.replace(
  "movementId, skuId, 1, acct, \"proj-1\",",
  "movementId, skuId, batchId, 1, acct, \"proj-1\","
);

fs.writeFileSync('server.ts', code);
