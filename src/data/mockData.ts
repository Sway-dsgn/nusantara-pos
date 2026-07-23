/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Produk, Transaksi, PergerakanStok, Absensi, CatatanHarian, StoreProfile } from "../types";

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  nama: "NUSANTARA POS",
  alamat: "Jl. Pembangunan No. 42, Kota Jakarta",
  no_hp: "0812-3456-7890",
  footer: "Terima kasih atas kunjungan Anda!"
};

// Only 1 Owner Account as requested ("dibuat dari 0 dan buat akun 1 owner aja yang bakal bisa buat akun untuk karyawan")
export const DEFAULT_USERS: User[] = [
  {
    id: "usr-1",
    nama: "Hendra Wijaya",
    role: "owner",
    username: "owner",
    password: "123",
    no_hp: "081234567890",
    aktif: true
  }
];

// All initial collections start empty (from 0)
export const DEFAULT_PRODUK: Produk[] = [];
export const DEFAULT_TRANSAKSI: Transaksi[] = [];
export const DEFAULT_STOK_PERGERAKAN: PergerakanStok[] = [];
export const DEFAULT_ABSENSI: Absensi[] = [];
export const DEFAULT_CATATAN: CatatanHarian[] = [];
