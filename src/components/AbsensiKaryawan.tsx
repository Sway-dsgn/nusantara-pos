/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Fingerprint, 
  Clock, 
  Camera, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Edit2,
  Calendar,
  X,
  FileCheck
} from "lucide-react";
import { User, Absensi, StatusAbsensi } from "../types";

interface AbsensiKaryawanProps {
  currentUser: User;
  users: User[];
  attendanceList: Absensi[];
  onAddAttendance: (newAbs: Absensi) => void;
  onUpdateAttendance: (updatedList: Absensi[]) => void;
}

export default function AbsensiKaryawan({
  currentUser,
  users,
  attendanceList,
  onAddAttendance,
  onUpdateAttendance
}: AbsensiKaryawanProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // States
  const [activeView, setActiveView] = useState<"absen_hari_ini" | "riwayat">("absen_hari_ini");
  
  // Selfie simulation state
  const [simulatedSelfieUrl, setSimulatedSelfieUrl] = useState<string | null>(null);
  const [simulatedGps, setSimulatedGps] = useState<string | null>(null);
  const [attendanceNote, setAttendanceNote] = useState("");
  const [statusSelector, setStatusSelector] = useState<StatusAbsensi>("Hadir");

  // Owner Edit Attendance Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAbsId, setEditingAbsId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState("");
  const [editTanggal, setEditTanggal] = useState("");
  const [editJamMasuk, setEditJamMasuk] = useState("");
  const [editJamPulang, setEditJamPulang] = useState("");
  const [editStatus, setEditStatus] = useState<StatusAbsensi>("Hadir");
  const [editKeterangan, setEditKeterangan] = useState("");

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  };

  // Find current cashier's attendance record of today
  const myTodayRecord = useMemo(() => {
    return attendanceList.find(abs => abs.tanggal === todayStr && abs.user_id === currentUser.id);
  }, [attendanceList, currentUser]);

  // Capture simulated selfie helper
  const handleTakeSelfie = () => {
    // Array of beautiful avatar/selfie mocks of smiling baristas/employees
    const baristas = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    ];
    const randomIndex = currentUser.id === "usr-2" ? 1 : 0; // consistent avatar per user
    setSimulatedSelfieUrl(baristas[randomIndex]);
    
    // Set mock coordinates
    setSimulatedGps("-6.2088, 106.8456"); // Jakarta dynamic coordinates mockup
  };

  // Submit clock in
  const handleClockIn = () => {
    if (myTodayRecord) {
      alert("Anda sudah melakukan absen masuk untuk hari ini!");
      return;
    }

    if (!simulatedSelfieUrl) {
      alert("Silakan ambil foto selfie terlebih dahulu untuk validasi kehadiran!");
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const jamMasukStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Automatically flag as "Telat" (Late) if past 08:00 AM
    let finalStatus: StatusAbsensi = "Hadir";
    if (currentHour > 8 || (currentHour === 8 && currentMinute > 0)) {
      finalStatus = "Telat";
    }

    const newAttendance: Absensi = {
      id: `ABS-${Date.now().toString().slice(-4)}`,
      user_id: currentUser.id,
      user_nama: currentUser.nama,
      tanggal: todayStr,
      jam_masuk: jamMasukStr,
      status: finalStatus,
      keterangan: attendanceNote.trim() || (finalStatus === "Telat" ? "Terlambat clock-in masuk shift" : "Hadir tepat waktu"),
      foto: simulatedSelfieUrl,
      gps: simulatedGps || undefined
    };

    onAddAttendance(newAttendance);
    setSimulatedSelfieUrl(null);
    setSimulatedGps(null);
    setAttendanceNote("");
    alert(`Absen Masuk Berhasil! Jam: ${jamMasukStr}. Status: ${finalStatus}`);
  };

  // Submit clock out
  const handleClockOut = () => {
    if (!myTodayRecord) {
      alert("Anda belum absen masuk hari ini!");
      return;
    }

    if (myTodayRecord.jam_pulang) {
      alert("Anda sudah melakukan absen pulang hari ini!");
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const jamPulangStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const updatedList = attendanceList.map(abs => {
      if (abs.id === myTodayRecord.id) {
        return {
          ...abs,
          jam_pulang: jamPulangStr,
          keterangan: abs.keterangan + " & Absen pulang diselesaikan."
        };
      }
      return abs;
    });

    onUpdateAttendance(updatedList);
    alert(`Absen Pulang Berhasil! Jam: ${jamPulangStr}`);
  };

  // Filtered attendance list (Cashiers only see their own sheets, owner sees all)
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter(abs => {
      const isOwner = currentUser.role === "owner";
      const isMyAbs = abs.user_id === currentUser.id;
      return isOwner || isMyAbs;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [attendanceList, currentUser]);

  // Handle owner adding or editing employee attendance manual
  const openEditAttendanceModal = (abs?: Absensi) => {
    if (currentUser.role !== "owner") {
      alert("Hanya Owner yang dapat melakukan koreksi data absensi karyawan.");
      return;
    }

    if (abs) {
      // Edit mode
      setEditingAbsId(abs.id);
      setEditUserId(abs.user_id);
      setEditTanggal(abs.tanggal);
      setEditJamMasuk(abs.jam_masuk || "");
      setEditJamPulang(abs.jam_pulang || "");
      setEditStatus(abs.status);
      setEditKeterangan(abs.keterangan);
    } else {
      // New record mode
      setEditingAbsId(null);
      setEditUserId(users.find(u => u.role === "kasir")?.id || "");
      setEditTanggal(todayStr);
      setEditJamMasuk("08:00");
      setEditJamPulang("17:00");
      setEditStatus("Hadir");
      setEditKeterangan("Koreksi kehadiran manual dari owner");
    }
    setShowEditModal(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId || !editTanggal) {
      alert("Harap lengkapi semua kolom!");
      return;
    }

    const userObj = users.find(u => u.id === editUserId);
    if (!userObj) return;

    if (editingAbsId) {
      // Update
      const updated = attendanceList.map(abs => {
        if (abs.id === editingAbsId) {
          return {
            ...abs,
            user_id: editUserId,
            user_nama: userObj.nama,
            tanggal: editTanggal,
            jam_masuk: editJamMasuk || undefined,
            jam_pulang: editJamPulang || undefined,
            status: editStatus,
            keterangan: editKeterangan
          };
        }
        return abs;
      });
      onUpdateAttendance(updated);
    } else {
      // Create new
      const newAbs: Absensi = {
        id: `ABS-${Date.now().toString().slice(-4)}`,
        user_id: editUserId,
        user_nama: userObj.nama,
        tanggal: editTanggal,
        jam_masuk: editJamMasuk || undefined,
        jam_pulang: editJamPulang || undefined,
        status: editStatus,
        keterangan: editKeterangan
      };
      onAddAttendance(newAbs);
    }

    setShowEditModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="absensi-main">
      
      {/* LEFT: Active punch in clock card (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4" id="absensi-punch">
        
        {/* Cashier Punch Terminal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Fingerprint className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Terminal Absensi Kehadiran</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Sesi Masuk & Pulang Shift Harian</p>
            </div>
          </div>

          {/* Clock visualization */}
          <div className="py-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <Clock className="w-10 h-10 text-indigo-500 mb-1" />
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
              20 Juli 2026
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Mulai Shift Kerja: 08:00 WIB
            </p>
          </div>

          {/* Verification photo & GPS captures */}
          {!myTodayRecord && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200" id="absensi-verification">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Metode Validasi Kamera & GPS</span>
              
              <div className="flex gap-3">
                {/* Take selfie button */}
                <button 
                  onClick={handleTakeSelfie}
                  className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-center text-xs font-semibold text-slate-600 transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-indigo-500" />
                  Ambil Selfie (Mock)
                </button>
              </div>

              {simulatedSelfieUrl && (
                <div className="flex items-center gap-3 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/40 animate-fade-in">
                  <img 
                    src={simulatedSelfieUrl} 
                    alt="Selfie" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 referrerPolicy='no-referrer'" 
                  />
                  <div className="text-[10px]">
                    <p className="font-bold text-indigo-800 flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Wajah Terdeteksi
                    </p>
                    <p className="text-slate-500 flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" /> GPS: {simulatedGps}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Catatan Tambahan (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Lampiran kendala jika terlambat..." 
                  value={attendanceNote}
                  onChange={e => setAttendanceNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action trigger buttons */}
          <div className="space-y-2">
            {!myTodayRecord ? (
              <button 
                onClick={handleClockIn}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" /> Absen Masuk Shift Pagi
              </button>
            ) : !myTodayRecord.jam_pulang ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold">Sesi Masuk Aktif</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Anda absen masuk tepat jam {myTodayRecord.jam_masuk} WIB</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleClockOut}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-100 flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
                >
                  <Clock className="w-4 h-4" /> Clock-Out Pulang Shift
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-center border border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Absensi Hari Ini Lengkap</p>
                <p className="text-[10px] text-slate-400 mt-1">Anda sudah clock-in jam {myTodayRecord.jam_masuk} dan clock-out jam {myTodayRecord.jam_pulang}.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT: Attendance record lists (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4" id="absensi-history">
        
        {/* Attendance Ledger */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {currentUser.role === "owner" ? "Laporan Absensi Karyawan Toko" : "Riwayat Kehadiran Saya"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Daftar presensi, jam masuk-pulang, dan catatan verifikasi</p>
            </div>

            {currentUser.role === "owner" && (
              <button 
                onClick={() => openEditAttendanceModal()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-indigo-100/10 focus:outline-none cursor-pointer"
              >
                + Input Absen Manual
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Masuk</th>
                  <th className="py-2.5 px-3">Pulang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Validasi / Ket</th>
                  {currentUser.role === "owner" && <th className="py-2.5 px-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium">
                {filteredAttendance.map(abs => (
                  <tr key={abs.id} className="hover:bg-slate-50/20">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">{abs.tanggal}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{abs.user_nama}</div>
                      <span className="text-[9px] text-slate-400">ID: {abs.user_id}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                      {abs.jam_masuk ? `${abs.jam_masuk} WIB` : "-"}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                      {abs.jam_pulang ? `${abs.jam_pulang} WIB` : "-"}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        abs.status === "Hadir" ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        abs.status === "Telat" ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        abs.status === "Izin" ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        abs.status === "Sakit" ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {abs.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[150px] truncate" title={abs.keterangan}>
                      {abs.foto && (
                        <span className="inline-block w-4 h-4 rounded-full overflow-hidden align-middle mr-1.5 border border-slate-300">
                          <img src={abs.foto} alt="Selfie validation" className="w-full h-full object-cover" />
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 italic">{abs.keterangan}</span>
                    </td>
                    {currentUser.role === "owner" && (
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => openEditAttendanceModal(abs)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Ubah Data Absensi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* OWNER ATTENDANCE EDIT MODAL */}
      {showEditModal && currentUser.role === "owner" && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-base font-bold text-slate-800">
                {editingAbsId ? "Ubah Kehadiran Karyawan" : "Input Absen Manual Karyawan"}
              </span>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block mb-1 text-slate-500 font-medium">Pilih Karyawan *</label>
                  <select 
                    value={editUserId}
                    onChange={e => setEditUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    disabled={!!editingAbsId}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Tanggal Kehadiran *</label>
                  <input 
                    type="date" 
                    value={editTanggal}
                    onChange={e => setEditTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Status Absensi *</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as StatusAbsensi)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Telat">Telat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Jam Masuk (HH:MM) *</label>
                  <input 
                    type="text" 
                    placeholder="08:00"
                    value={editJamMasuk}
                    onChange={e => setEditJamMasuk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Jam Pulang (HH:MM)</label>
                  <input 
                    type="text" 
                    placeholder="17:00"
                    value={editJamPulang}
                    onChange={e => setEditJamPulang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 text-slate-500 font-medium">Keterangan Koreksi / Alasan *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Koreksi jam masuk karena dinas luar..."
                    value={editKeterangan}
                    onChange={e => setEditKeterangan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Simpan Absensi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
