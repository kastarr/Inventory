const fs = require('fs');

function replaceInFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/Warehouse Mgr/g, "Store Keeper Mr Tosin");
  code = code.replace(/warehouse_manager/g, "warehouse_manager"); // keep this for logic
  code = code.replace(/J\. Doe/g, "James");
  code = code.replace(/O\. Smith/g, "Love");
  code = code.replace(/loading bay/g, "dispatch area");
  code = code.replace(/bay/g, "section");
  code = code.replace(/aisle/g, "shelf");
  
  fs.writeFileSync(file, code);
}

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Activity.tsx',
  'src/pages/Movements.tsx',
  'src/pages/Inventory.tsx',
  'src/pages/Admin.tsx',
  'src/App.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    replaceInFile(f);
  }
});
