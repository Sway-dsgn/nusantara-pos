/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Settings, 
  UserCheck, 
  UserMinus, 
  Edit2, 
  X, 
  Info, 
  Store,
  Phone,
  MapPin,
  FileText
} from "lucide-react";
import { User, StoreProfile } from "../types";

interface KelolaAkunProps {
  currentUser: User;
  users: User[];
  storeProfile: StoreProfile;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onAddUser: (newUser: User) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function KelolaAkun({
  currentUser,
  users,
  storeProfile,
  onUpdateStoreProfile,
  onAddUser,
  onUpdateUser
}: KelolaAkunProps) {
  // Store Settings states
  const [storeName, setStoreName] = useState(storeProfile.nama);
  const [storeAddress, setStoreAddress] = useState(storeProfile.alamat);
  const [storePhone, setStorePhone] = useState(storeProfile.no_hp);
  const [storeFooter, setStoreFooter] = useState(storeProfile.footer);

  React.useEffect(() => {
    setStoreName(storeProfile.nama);
    setStoreAddress(storeProfile.alamat);
    setStorePhone(storeProfile.no_hp);
    setStoreFooter(storeProfile.footer);
  }, [storeProfile]);

  // User form states
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [formNama, setFormNama] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formDomisili, setFormDomisili] = useState("");
  const [formRole, setFormRole] = useState<"owner" | "kasir">("kasir");

  const openAddUserModal = () => {
    setModalMode("tambah");
    setEditingUserId(null);
    setFormNama("");
    setFormUsername("");
    setFormPassword("");
    setFormNoHp("");
    setFormDomisili("");
    setFormRole("kasir");
    setShowUserModal(true);
  };

  const openEditUserModal = (u: User) => {
    setModalMode("edit");
    setEditingUserId(u.id);
    setFormNama(u.nama);
    setFormUsername(u.username);
    setFormPassword(u.password || "");
    setFormNoHp(u.no_hp);
    setFormDomisili(u.domisili || "");
    setFormRole(u.role);
    setShowUserModal(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formUsername.trim() || !formPassword.trim() || !formNoHp.trim()) {
      alert("Harap lengkapi semua kolom formulir karyawan!");
      return;
    }

    if (modalMode === "tambah") {
      const isUsernameTaken = users.some(u => u.username.toLowerCase() === formUsername.toLowerCase());
      if (isUsernameTaken) {
        alert("Username sudah digunakan karyawan lain, gunakan nama pengguna lain!");
        return;
      }

      const nextId = `usr-${users.length + 1}`;
      const newUser: User = {
        id: nextId,
        nama: formNama,
        role: formRole,
        username: formUsername,
        password: formPassword,
        no_hp: formNoHp,
        domisili: formDomisili,
        aktif: true
      };
      onAddUser(newUser);
      alert("Akun Karyawan baru berhasil ditambahkan!");
    } else {
      if (!editingUserId) return;
      const targetUser = users.find(u => u.id === editingUserId);
      if (!targetUser) return;

      const updatedUser: User = {
        ...targetUser,
        nama: formNama,
        username: formUsername,
        password: formPassword,
        no_hp: formNoHp,
        domisili: formDomisili,
        role: formRole
      };
      onUpdateUser(updatedUser);
      alert("Akun Karyawan berhasil dimutasi / diperbarui.");
    }

    setShowUserModal(false);
  };

  const toggleUserStatus = (u: User) => {
    if (u.id === currentUser.id) {
      alert("Anda tidak dapat menonaktifkan akun Owner Anda sendiri!");
      return;
    }

    const updatedUser: User = {
      ...u,
      aktif: !u.aktif
    };
    updatedUser.domisili = u.domisili;
    onUpdateUser(updatedUser);
    alert(`Status akun ${u.nama} berhasil dirubah menjadi ${!u.aktif ? 'AKTIF' : 'NON-AKTIF'}.`);
  };

  const handleSaveStoreSettings = () => {
    onUpdateStoreProfile({
      nama: storeName,
      alamat: storeAddress,
      no_hp: storePhone,
      footer: storeFooter
    });
    alert("Pengaturan Toko & Informasi Nota Thermal berhasil disimpan secara permanen!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="settings-main">
      
      {/* LEFT: Managing Cashier Accounts (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4" id="settings-accounts">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Kelola Akun Karyawan (Kasir)</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Tambah akun baru, reset sandi, atau batalkan otorisasi kasir</p>
              </div>
            </div>

            <button 
              onClick={openAddUserModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              + Tambah Karyawan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Domisili</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">No. HP WA</th>
                  <th className="py-2.5 px-3">Hak Akses</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/20">
                    <td className="py-3 px-3 font-bold text-slate-800">{u.nama}</td>
                    <td className="py-3 px-3 text-slate-600">{u.domisili || '-'}</td>
                    <td className="py-3 px-3 font-mono">{u.username}</td>
                    <td className="py-3 px-3">{u.no_hp}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          const newRole = e.target.value as "owner" | "kasir";
                          onUpdateUser({ ...u, role: newRole });
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all ${
                          u.role === "owner" 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`}
                        title="Ubah Hak Akses / Role"
                      >
                        <option value="owner">Owner (Akses Penuh)</option>
                        <option value="kasir">Kasir (Terbatas)</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <button 
                        onClick={() => toggleUserStatus(u)}
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 focus:outline-none cursor-pointer ${
                          u.aktif ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {u.aktif ? <UserCheck className="w-3 h-3" /> : <UserMinus className="w-3 h-3" />}
                        {u.aktif ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => openEditUserModal(u)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                        title="Edit Info Karyawan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT: Store Profile Configuration (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4" id="settings-store">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Pengaturan Profil & Struk Toko</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Ubah nama usaha, alamat struk belanja, dan rincian kontak</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1 text-slate-500 font-medium flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-400" /> Nama Usaha / Toko
              </label>
              <input 
                type="text" 
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alamat Fisik Toko
              </label>
              <input 
                type="text" 
                value={storeAddress}
                onChange={e => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Nomor Telepon Bisnis
              </label>
              <input 
                type="text" 
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Keterangan Kaki Struk (Thermal Footer)
              </label>
              <input 
                type="text" 
                value={storeFooter}
                onChange={e => setStoreFooter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 leading-relaxed font-normal">
              <p className="font-bold text-slate-700 mb-1 text-[10px] uppercase flex items-center gap-0.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" /> Catatan Integrasi Pembayaran
              </p>
              <p className="text-[10px]">
                Sistem pembayaran nontunai menggunakan standar QRIS dinamis yang di-generate langsung. Keamanan transaksi terjamin sandi otorisasi.
              </p>
            </div>

            <button 
              onClick={handleSaveStoreSettings}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors focus:outline-none cursor-pointer"
            >
              Simpan Pengaturan Profil
            </button>
          </div>
        </div>
      </div>

      {/* USER FORM MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-base font-bold text-slate-800">
                {modalMode === "tambah" ? "Daftarkan Karyawan Baru" : "Koreksi Profil Karyawan"}
              </span>
              <button onClick={() => setShowUserModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block mb-1 text-slate-500 font-medium">Nama Lengkap Karyawan *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Amanda Putri"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">Username Log-in *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: amanda"
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">Kata Sandi (Plain Text) *</label>
                <input 
                  type="password" 
                  placeholder="Ketik password..."
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">Nomor WhatsApp *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 0812-9876-1234"
                  value={formNoHp}
                  onChange={e => setFormNoHp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Domisili (opsional)
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: Jakarta Selatan"
                  value={formDomisili}
                  onChange={e => setFormDomisili(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">Peran / Hak Akses *</label>
                <select 
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white cursor-pointer"
                >
                  <option value="kasir">Kasir (Otorisasi Terbatas)</option>
                  <option value="owner">Owner (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  {modalMode === "tambah" ? "Daftarkan" : "Simpan Perubahan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
