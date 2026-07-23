import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDB } from './db.js';

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
app.use(express.json());
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File tidak ditemukan' });
  }
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file terlalu besar (maks 5MB)' });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

initDB().catch(err => {
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
