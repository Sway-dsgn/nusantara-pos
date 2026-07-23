import { Router } from 'express';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = Router();

// GET /api/attendance
router.get('/', verifyToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'owner') {
      result = await pool.query('SELECT * FROM attendance ORDER BY tanggal DESC, jam_masuk DESC');
    } else {
      result = await pool.query('SELECT * FROM attendance WHERE user_id = $1 ORDER BY tanggal DESC, jam_masuk DESC', [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance
router.post('/', verifyToken, async (req, res) => {
  const { user_id, user_nama, tanggal, jam_masuk, jam_pulang, status, keterangan, foto, gps } = req.body;

  try {
    const today = tanggal || new Date().toISOString().split('T')[0];
    const targetUserId = user_id || req.user.id;

    // Check if already clocked in today
    const existing = await pool.query('SELECT * FROM attendance WHERE user_id = $1 AND tanggal = $2', [targetUserId, today]);

    if (existing.rows.length > 0 && !existing.rows[0].jam_pulang && jam_pulang) {
      // Clock out
      await pool.query('UPDATE attendance SET jam_pulang = $1, keterangan = keterangan || $2 WHERE id = $3', [jam_pulang, ' & Absen pulang diselesaikan.', existing.rows[0].id]);
      const updated = await pool.query('SELECT * FROM attendance WHERE id = $1', [existing.rows[0].id]);
      return res.json(updated.rows[0]);
    }

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Sudah melakukan absen hari ini' });
    }

    // Get user info
    const user = await pool.query('SELECT id, nama FROM users WHERE id = $1', [targetUserId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const id = `ABS-${nanoid(6)}`;
    await pool.query(`
      INSERT INTO attendance (id, user_id, user_nama, tanggal, jam_masuk, jam_pulang, status, keterangan, foto, gps)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, user.rows[0].id, user.rows[0].nama, today, jam_masuk || null, jam_pulang || null, status || 'Hadir', keterangan || '', foto || null, gps || null]);

    const newAttendance = await pool.query('SELECT * FROM attendance WHERE id = $1', [id]);
    res.status(201).json(newAttendance.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/attendance/:id
router.put('/:id', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM attendance WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Data absensi tidak ditemukan' });
    }

    const old = existing.rows[0];
    const { user_id, user_nama, tanggal, jam_masuk, jam_pulang, status, keterangan, foto, gps } = req.body;

    await pool.query(`
      UPDATE attendance SET user_id = $1, user_nama = $2, tanggal = $3, jam_masuk = $4, jam_pulang = $5,
      status = $6, keterangan = $7, foto = $8, gps = $9
      WHERE id = $10
    `, [
      user_id ?? old.user_id,
      user_nama ?? old.user_nama,
      tanggal ?? old.tanggal,
      jam_masuk ?? old.jam_masuk,
      jam_pulang ?? old.jam_pulang,
      status ?? old.status,
      keterangan ?? old.keterangan,
      foto ?? old.foto,
      gps ?? old.gps,
      id
    ]);

    const updated = await pool.query('SELECT * FROM attendance WHERE id = $1', [id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
