/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = "owner" | "kasir";

export interface User {
  id: string;
  nama: string;
  role: Role;
  username: string;
  password?: string;
  no_hp: string;
  domisili?: string;
  aktif: boolean;
}

export interface Produk {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  stok_minimum: number;
}

export interface DetailTransaksi {
  produk_id: string;
  produk_nama: string;
  qty: number;
  harga_saat_jual: number;
  subtotal: number;
}

export type MetodeBayar = "tunai" | "transfer" | "qris" | "kartu";
export type StatusTransaksi = "lunas" | "retur";

export interface Transaksi {
  id: string;
  tanggal: string; // ISO String
  kasir_id: string;
  kasir_nama: string;
  total: number;
  diskon: number; // nominal discount
  metode_bayar: MetodeBayar;
  status: StatusTransaksi;
  retur_alasan?: string;
  items: DetailTransaksi[];
}

export type JenisPergerakan = "masuk" | "keluar" | "penjualan" | "opname";

export interface PergerakanStok {
  id: string;
  produk_id: string;
  produk_nama: string;
  jenis: JenisPergerakan;
  jumlah: number; // positive or negative
  tanggal: string; // ISO String
  oleh_user_id: string;
  oleh_user_nama: string;
  keterangan: string;
}

export type StatusAbsensi = "Hadir" | "Telat" | "Izin" | "Sakit" | "Alpha";

export interface Absensi {
  id: string;
  user_id: string;
  user_nama: string;
  tanggal: string; // YYYY-MM-DD
  jam_masuk?: string; // HH:MM
  jam_pulang?: string; // HH:MM
  status: StatusAbsensi;
  keterangan: string;
  foto?: string; // base64 or placeholder URL
  gps?: string; // coordinates e.g., "-6.2088, 106.8456"
}

export type KategoriCatatan = "Operasional" | "Keuangan" | "Stok" | "Lainnya";

export interface StoreProfile {
  nama: string;
  alamat: string;
  no_hp: string;
  footer: string;
}

export interface CatatanHarian {
  id: string;
  user_id: string;
  user_nama: string;
  tanggal: string; // ISO String
  kategori: KategoriCatatan;
  isi: string;
  lampiran?: string; // placeholder image URL or custom uploads
}
