# Deploy Nusantara POS

## Architecture
```
Frontend (React)  →  Vercel (port 443)
Backend (Express) →  Railway (port 3001)
Database          →  Supabase PostgreSQL (cloud)
File Storage      →  Supabase Storage (1GB free)
```

---

## Step 1: Setup Supabase (Database)

1. Buka https://supabase.com → Sign up/Login
2. Klik "New Project"
3. Isi:
   - Project name: `nusantara-pos`
   - Database password: (simpan!)
   - Region: `Southeast Asia (Singapore)`
4. Tunggu selesai (~1 min)
5. Buka **Settings → Database**
6. Copy **Connection string → URI**
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. Simpan string ini, nanti dipake di backend

---

## Step 2: Deploy Backend ke Railway

1. Buka https://railway.app → Login
2. Klik "New Project" → "Deploy from GitHub repo"
3. Pilih repo `nusantara-pos` (push dulu ke GitHub)
4. Di Railway, klik tab **Variables** tambahkan:
   ```
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   JWT_SECRET=your-super-secret-key-here
   NODE_ENV=production
   ```
5. Di **Settings**:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node index.js`
   - Port: `3001`
6. Railway akan auto-deploy
7. Copy Railway app URL (contoh: `https://nusantara-pos-server.up.railway.app`)

---

## Step 3: Deploy Frontend ke Vercel

1. Buka https://vercel.com → Login
2. Klik "New Project" → Import GitHub repo `nusantara-pos`
3. Di **Environment Variables** tambahkan:
   ```
   VITE_API_URL=https://nusantara-pos-server.up.railway.app
   ```
4. Build Settings:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik "Deploy"
6. Selesai! Frontend bisa diakses di URL Vercel

---

## Step 4: Update Frontend API URL

Di `src/api/client.ts`, ubah API_BASE:

```typescript
// Development (local)
const API_BASE = '/api';

// Production (deployed)
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';
```

---

## Step 5: Test

1. Buka URL Vercel
2. Login: `owner` / `123`
3. Tambah produk, buat transaksi
4. Cek di Supabase → Table Editor → data sudah masuk

---

## Environment Variables Summary

### Backend (Railway)
| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Supabase connection string |
| `JWT_SECRET` | `random-secret` | Secret key for JWT tokens |
| `NODE_ENV` | `production` | Enable SSL for DB |
| `PORT` | `3001` | Server port |

### Frontend (Vercel)
| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://xxx.up.railway.app` | Backend URL |

---

## Troubleshooting

### Backend can't connect to DB
- Pastikan `DATABASE_URL` format benar
- Cek Supabase → Settings → Database → Connection pooling harus aktif
- Pastikan SSL mode: `require`

### Frontend can't reach backend
- Cek `VITE_API_URL` sudah benar
- Pastikan Railway app status "Active"
- Cek CORS sudah di-enable di backend

### File upload fails
- Untuk sekarang upload simpan ke folder `uploads/` di backend
- Untuk production, pertimbangkan pakai Supabase Storage atau Cloudinary
