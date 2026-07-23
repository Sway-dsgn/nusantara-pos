import { Router } from 'express';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/daily-logs
router.get('/', verifyToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'owner') {
      result = await pool.query('SELECT * FROM daily_logs ORDER BY tanggal DESC');
    } else {
      result = await pool.query(`
        SELECT * FROM daily_logs 
        WHERE user_id = $1 OR kategori = 'Operasional'
        ORDER BY tanggal DESC
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-logs
router.post('/', verifyToken, async (req, res) => {
  const { kategori, isi, lampiran } = req.body;
  if (!isi || !isi.trim()) {
    return res.status(400).json({ error: 'Isi catatan harus diisi' });
  }

  try {
    const id = `NOTE-${nanoid(6)}`;
    const tanggal = new Date().toISOString();
    const user = await pool.query('SELECT id, nama FROM users WHERE id = $1', [req.user.id]);

    await pool.query(`
      INSERT INTO daily_logs (id, user_id, user_nama, tanggal, kategori, isi, lampiran)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [id, user.rows[0].id, user.rows[0].nama, tanggal, kategori || 'Operasional', isi.trim(), lampiran || null]);

    const newLog = await pool.query('SELECT * FROM daily_logs WHERE id = $1', [id]);
    res.status(201).json(newLog.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/daily-logs/:id
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM daily_logs WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    if (req.user.role !== 'owner' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Tidak memiliki akses untuk menghapus catatan ini' });
    }

    await pool.query('DELETE FROM daily_logs WHERE id = $1', [id]);
    res.json({ message: 'Catatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
