import { Router } from 'express';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = Router();

// GET /api/products
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/low-stock
router.get('/low-stock', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE stok <= stok_minimum');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', verifyToken, requireOwner, async (req, res) => {
  const { nama, kategori, satuan, harga_beli, harga_jual, stok, stok_minimum } = req.body;
  if (!nama || !kategori || !satuan) {
    return res.status(400).json({ error: 'Nama, kategori, dan satuan harus diisi' });
  }

  try {
    const id = `prod-${nanoid(6)}`;
    await pool.query(`
      INSERT INTO products (id, nama, kategori, satuan, harga_beli, harga_jual, stok, stok_minimum)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, nama, kategori, satuan, harga_beli || 0, harga_jual || 0, stok || 0, stok_minimum || 10]);

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    const old = existing.rows[0];
    const { nama, kategori, satuan, harga_beli, harga_jual, stok, stok_minimum } = req.body;

    await pool.query(`
      UPDATE products SET nama = $1, kategori = $2, satuan = $3, harga_beli = $4, harga_jual = $5, stok = $6, stok_minimum = $7
      WHERE id = $8
    `, [
      nama ?? old.nama,
      kategori ?? old.kategori,
      satuan ?? old.satuan,
      harga_beli ?? old.harga_beli,
      harga_jual ?? old.harga_jual,
      stok ?? old.stok,
      stok_minimum ?? old.stok_minimum,
      id
    ]);

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
