import { Router } from 'express';
import pool from '../db.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = Router();

// GET /api/store-profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_profile WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profil toko tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/store-profile
router.put('/', verifyToken, requireOwner, async (req, res) => {
  const { nama, alamat, no_hp, no_wa, footer, pajak_aktif, pajak_persen, no_rekening } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM store_profile WHERE id = 1');
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Profil toko tidak ditemukan' });
    }

    const old = existing.rows[0];

    await pool.query(`
      UPDATE store_profile SET nama = $1, alamat = $2, no_hp = $3, no_wa = $4, footer = $5,
      pajak_aktif = $6, pajak_persen = $7, no_rekening = $8
      WHERE id = 1
    `, [
      nama ?? old.nama,
      alamat ?? old.alamat,
      no_hp ?? old.no_hp,
      no_wa ?? old.no_wa,
      footer ?? old.footer,
      pajak_aktif ?? old.pajak_aktif,
      pajak_persen ?? old.pajak_persen,
      no_rekening ?? old.no_rekening
    ]);

    const updated = await pool.query('SELECT * FROM store_profile WHERE id = 1');
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
