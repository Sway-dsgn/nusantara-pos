import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import pool from '../db.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = Router();

// GET /api/users
router.get('/', verifyToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'owner') {
      result = await pool.query('SELECT id, nama, role, username, no_hp, domisili, aktif FROM users');
    } else {
      result = await pool.query('SELECT id, nama, role, username, no_hp, domisili, aktif FROM users WHERE id = $1', [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post('/', verifyToken, requireOwner, async (req, res) => {
  const { nama, role, username, password, no_hp, domisili } = req.body;
  if (!nama || !username || !password || !no_hp) {
    return res.status(400).json({ error: 'Semua kolom harus diisi' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }

    const id = `usr-${nanoid(6)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    await pool.query(`
      INSERT INTO users (id, nama, role, username, password, no_hp, domisili, aktif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    `, [id, nama, role || 'kasir', username, hashedPassword, no_hp, domisili || '']);

    const result = await pool.query('SELECT id, nama, role, username, no_hp, domisili, aktif FROM users WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;
  const { nama, role, username, password, no_hp, domisili, aktif } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const old = existing.rows[0];

    if (username && username !== old.username) {
      const dup = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, id]);
      if (dup.rows.length > 0) return res.status(409).json({ error: 'Username sudah digunakan' });
    }

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : old.password;

    await pool.query(`
      UPDATE users SET nama = $1, role = $2, username = $3, password = $4, no_hp = $5, domisili = $6, aktif = $7
      WHERE id = $8
    `, [
      nama || old.nama,
      role || old.role,
      username || old.username,
      hashedPassword,
      no_hp || old.no_hp,
      domisili !== undefined ? domisili : old.domisili,
      aktif !== undefined ? aktif : old.aktif,
      id
    ]);

    const result = await pool.query('SELECT id, nama, role, username, no_hp, domisili, aktif FROM users WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
