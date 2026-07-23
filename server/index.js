import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
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
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Initialize DB and start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Nusantara POS Server running on http://localhost:${PORT}`);
      console.log(`📦 Database: PostgreSQL (Supabase)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
