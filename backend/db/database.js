const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "inventory.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }
  console.log("SQLite connected at", dbPath);

  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        unit TEXT,
        category TEXT,
        brand TEXT,
        price REAL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'active',
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        old_quantity INTEGER,
        new_quantity INTEGER,
        change_date TEXT,
        user_info TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`
    );
  });
});

module.exports = db;
