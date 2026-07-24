import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDB, pool } from './db.js';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import stockMovementRoutes from './routes/stock-movements.js';
import attendanceRoutes from './routes/attendance.js';
import dailyLogRoutes from './routes/daily-logs.js';
import storeProfileRoutes from './routes/store-profile.js';
import uploadRoutes from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File tidak ditemukan' });
  }
});

// Wait for DB init before processing routes
app.use(async (req, res, next) => {
  await dbInit;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/daily-logs', dailyLogRoutes);
app.use('/api/store-profile', storeProfileRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/debug', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as cnt FROM users');
    res.json({ connected: true, users: result.rows[0].cnt });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

app.post('/api/reset-owner', async (req, res) => {
  try {
    const hash = bcrypt.hashSync('123', 10);
    await pool.query("UPDATE users SET password = $1 WHERE username = 'owner'", [hash]);
    const check = await pool.query("SELECT password FROM users WHERE username = 'owner'");
    if (check.rows.length > 0 && bcrypt.compareSync('123', check.rows[0].password)) {
      res.json({ success: true, message: 'Owner password reset to 123' });
    } else {
      res.json({ success: false, message: 'Reset failed - password mismatch' });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file terlalu besar (maks 5MB)' });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const dbInit = initDB().catch(err => {
  console.error('DB init error:', err);
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`🚀 Nusantara POS Server running on http://localhost:${PORT}`);
    console.log(`📦 Database: PostgreSQL (Supabase)`);
  });
}

export { initDB };
export default app;
