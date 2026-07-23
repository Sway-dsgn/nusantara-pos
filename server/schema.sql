CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  role VARCHAR(10) CHECK(role IN ('owner','kasir')) NOT NULL DEFAULT 'kasir',
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(20) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  satuan VARCHAR(20) NOT NULL,
  harga_beli DECIMAL(12,2) NOT NULL DEFAULT 0,
  harga_jual DECIMAL(12,2) NOT NULL DEFAULT 0,
  stok INTEGER NOT NULL DEFAULT 0,
  stok_minimum INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(20) PRIMARY KEY,
  tanggal TIMESTAMPTZ NOT NULL,
  kasir_id VARCHAR(20) NOT NULL REFERENCES users(id),
  kasir_nama VARCHAR(100) NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  diskon DECIMAL(12,2) NOT NULL DEFAULT 0,
  metode_bayar VARCHAR(10) CHECK(metode_bayar IN ('tunai','transfer','qris','kartu')) NOT NULL,
  status VARCHAR(10) CHECK(status IN ('lunas','retur')) NOT NULL DEFAULT 'lunas',
  retur_alasan TEXT
);

CREATE TABLE IF NOT EXISTS detail_transactions (
  id SERIAL PRIMARY KEY,
  transaksi_id VARCHAR(20) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  produk_id VARCHAR(20) NOT NULL REFERENCES products(id),
  produk_nama VARCHAR(100) NOT NULL,
  qty INTEGER NOT NULL,
  harga_saat_jual DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(20) PRIMARY KEY,
  produk_id VARCHAR(20) NOT NULL REFERENCES products(id),
  produk_nama VARCHAR(100) NOT NULL,
  jenis VARCHAR(10) CHECK(jenis IN ('masuk','keluar','penjualan','opname')) NOT NULL,
  jumlah INTEGER NOT NULL,
  tanggal TIMESTAMPTZ NOT NULL,
  oleh_user_id VARCHAR(20) NOT NULL REFERENCES users(id),
  oleh_user_nama VARCHAR(100) NOT NULL,
  keterangan TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id),
  user_nama VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk VARCHAR(5),
  jam_pulang VARCHAR(5),
  status VARCHAR(10) CHECK(status IN ('Hadir','Telat','Izin','Sakit','Alpha')) NOT NULL,
  keterangan TEXT NOT NULL DEFAULT '',
  foto TEXT,
  gps VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id),
  user_nama VARCHAR(100) NOT NULL,
  tanggal TIMESTAMPTZ NOT NULL,
  kategori VARCHAR(20) CHECK(kategori IN ('Operasional','Keuangan','Stok','Lainnya')) NOT NULL,
  isi TEXT NOT NULL,
  lampiran TEXT
);

CREATE TABLE IF NOT EXISTS store_profile (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  nama VARCHAR(100) NOT NULL DEFAULT 'NUSANTARA POS',
  alamat TEXT NOT NULL DEFAULT '',
  no_hp VARCHAR(20) NOT NULL DEFAULT '',
  footer TEXT NOT NULL DEFAULT 'Terima kasih atas kunjungan Anda!'
);

INSERT INTO users (id, nama, role, username, password, no_hp, aktif)
VALUES ('usr-1', 'Hendra Wijaya', 'owner', 'owner', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '081234567890', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO store_profile (id, nama, alamat, no_hp, footer)
VALUES (1, 'NUSANTARA POS', 'Jl. Pembangunan No. 42, Kota Jakarta', '0812-3456-7890', 'Terima kasih atas kunjungan Anda!')
ON CONFLICT (id) DO NOTHING;
