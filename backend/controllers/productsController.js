const db = require('../db/database');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Parser } = require('json2csv');


const runAsync = (sql, params=[]) => new Promise((res, rej) => {
  db.run(sql, params, function(err){
    if (err) return rej(err);
    res(this);
  });
});
const getAsync = (sql, params=[]) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => (err?rej(err):res(row)))
);
const allAsync = (sql, params=[]) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => (err?rej(err):res(rows)))
);

exports.getAll = async (req, res) => {
  try {
    // simple list; could add pagination params later
    const rows = await allAsync('SELECT * FROM products ORDER BY name ASC', []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New search endpoint (case-insensitive partial)
exports.getSearch = async (req, res) => {
  try {
    const q = (req.query.name || '').trim();
    if (!q) return res.json([]);
    const rows = await allAsync('SELECT * FROM products WHERE LOWER(name) LIKE ? ORDER BY name ASC', [`%${q.toLowerCase()}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await getAsync('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, unit, category, brand, price=0, stock=0, status } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

    const numericStock = Number(stock) || 0;
    const computedStatus = (status && String(status).trim()) || (numericStock > 0 ? 'In Stock' : 'Out of Stock');

    const image = req.file && req.file.fieldname === 'image' ? `/uploads/${req.file.filename}` : (req.body.image || null);

    const existing = await getAsync('SELECT id FROM products WHERE LOWER(name)=?', [name.trim().toLowerCase()]);
    if (existing) return res.status(400).json({ error: 'Product with this name already exists' });

    const r = await runAsync(
      `INSERT INTO products (name, description, unit, category, brand, price, stock, status, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), description || null, unit || null, category || null, brand || null, Number(price)||0, numericStock, computedStatus, image]
    );
    const newId = r.lastID;
    const newProd = await getAsync('SELECT * FROM products WHERE id = ?', [newId]);
    res.status(201).json(newProd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.body.name && req.body.name.trim().toLowerCase() !== String(product.name).toLowerCase()) {
      const dup = await getAsync('SELECT id FROM products WHERE LOWER(name)=? AND id != ?', [req.body.name.trim().toLowerCase(), id]);
      if (dup) return res.status(400).json({ error: 'Another product with this name exists' });
    }

    if (req.body.stock !== undefined && (isNaN(Number(req.body.stock)) || Number(req.body.stock) < 0)) {
      return res.status(400).json({ error: 'stock must be a number >= 0' });
    }

    const fields = [];
    const params = [];

    const updatable = ['name','description','unit','category','brand','price','stock','status'];
    updatable.forEach(k => {
      if (req.body[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(req.body[k]);
      }
    });

    
    if (req.file && req.file.fieldname === 'image') {
      fields.push('image = ?');
      params.push(`/uploads/${req.file.filename}`);
      if (product.image) {
        const fp = path.join(__dirname, '..', product.image);
        fs.unlink(fp, ()=>{});
      }
    }

    if (!fields.length) return res.status(400).json({ error: 'No updatable fields provided' });

    params.push(id);
    await runAsync(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);

    
    if (req.body.stock !== undefined && Number(req.body.stock) !== Number(product.stock)) {
      const oldStock = Number(product.stock);
      const newStock = Number(req.body.stock);
      await runAsync(
        `INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy, timestamp) VALUES (?, ?, ?, ?, ?)`,
        [id, oldStock, newStock, req.body.changedBy || req.body.user_info || 'admin', new Date().toISOString()]
      );
      
      const updatedStatus = newStock > 0 ? 'In Stock' : 'Out of Stock';
      await runAsync('UPDATE products SET status = ? WHERE id = ?', [updatedStatus, id]);
    }

    const updated = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await getAsync('SELECT * FROM products WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    await runAsync('DELETE FROM products WHERE id = ?', [id]);
    
    if (row.image) {
      const fp = path.join(__dirname, '..', row.image);
      fs.unlink(fp, ()=>{});
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.history = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await allAsync('SELECT * FROM inventory_logs WHERE productId = ? ORDER BY timestamp DESC', [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Import CSV  expects name,unit,category,brand,stock,status,image
exports.importCSV = async (req, res) => {
  try {
    if (!req.file || req.file.fieldname !== 'csvFile') return res.status(400).json({ error: 'CSV file required under field csvFile' });

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const stream = fs.createReadStream(filePath).pipe(csvParser());

    const results = { added: 0, skipped: 0, duplicates: [] };
    const rows = [];

    stream.on('data', (row) => rows.push(row));
    stream.on('end', async () => {
      for (const r of rows) {
        const name = (r.name || '').trim();
        if (!name) { results.skipped++; continue; }

        // dup check
        const dup = await getAsync('SELECT id FROM products WHERE LOWER(name) = ?', [name.toLowerCase()]);
        if (dup) {
          results.skipped++;
          results.duplicates.push({ name, existingId: dup.id });
          continue;
        }

        const unit = r.unit || null;
        const category = r.category || null;
        const brand = r.brand || null;
        const stock = Number(r.stock) || 0;
        const status = r.status && String(r.status).trim() ? r.status : (stock > 0 ? 'In Stock' : 'Out of Stock');
        const image = r.image && r.image.trim() ? r.image.trim() : null;

        try {
          await runAsync(
            `INSERT INTO products (name, unit, category, brand, stock, status, image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, unit, category, brand, stock, status, image]
          );
          results.added++;
        } catch (e) {
          results.skipped++;
        }
      }
      res.json(results);
    });
    stream.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  

exports.exportCSV = async (req, res) => {
  try {
    const rows = await allAsync('SELECT id, name, unit, category, brand, stock, status, image FROM products', []);
    const fields = ['id','name','unit','category','brand','stock','status','image'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows || []);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
