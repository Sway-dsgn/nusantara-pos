import { Router } from 'express';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/stock-movements
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stock_movements ORDER BY tanggal DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stock-movements
router.post('/', verifyToken, async (req, res) => {
  const { produk_id, produk_nama, jenis, jumlah, keterangan } = req.body;
  if (!produk_id || !jenis || jumlah === undefined) {
    return res.status(400).json({ error: 'produk_id, jenis, dan jumlah harus diisi' });
  }

  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [produk_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    const prod = product.rows[0];
    const finalQty = jenis === 'keluar' ? -Math.abs(jumlah) : Math.abs(jumlah);
    const newStok = prod.stok + finalQty;

    if (newStok < 0) {
      return res.status(400).json({ error: `Stok tidak mencukupi. Stok saat ini: ${prod.stok}` });
    }

    await pool.query('UPDATE products SET stok = $1 WHERE id = $2', [newStok, produk_id]);

    const id = `STK-${nanoid(6)}`;
    const tanggal = new Date().toISOString();
    const user = await pool.query('SELECT id, nama FROM users WHERE id = $1', [req.user.id]);

    await pool.query(`
      INSERT INTO stock_movements (id, produk_id, produk_nama, jenis, jumlah, tanggal, oleh_user_id, oleh_user_nama, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, produk_id, prod.nama, jenis, finalQty, tanggal, user.rows[0].id, user.rows[0].nama, keterangan || '']);

    const movement = await pool.query('SELECT * FROM stock_movements WHERE id = $1', [id]);
    res.status(201).json(movement.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
