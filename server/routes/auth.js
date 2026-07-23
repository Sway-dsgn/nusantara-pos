import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { verifyToken, generateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username atau Kata Sandi salah!' });
    }

    const user = result.rows[0];
    if (!user.aktif) {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan oleh Owner!' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau Kata Sandi salah!' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout berhasil' });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
