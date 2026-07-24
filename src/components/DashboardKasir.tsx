/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Calculator, 
  Package, 
  FileEdit, 
  Fingerprint,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  FileText,
  BarChart2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { User, Transaksi, Absensi, CatatanHarian } from "../types";

interface DashboardKasirProps {
  currentUser: User;
  transactions: Transaksi[];
  attendance: Absensi[];
  dailyLogs: CatatanHarian[];
  onNavigate: (view: string) => void;
}

export default function DashboardKasir({
  currentUser,
  transactions,
  attendance,
  dailyLogs,
  onNavigate
}: DashboardKasirProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate shift stats for CURRENT CASHIER
  const shiftTransactions = transactions.filter(tx => {
    const txDate = tx.tanggal.split("T")[0];
    return txDate === todayStr && tx.kasir_id === currentUser.id && tx.status === "lunas";
  });

  const shiftRevenue = shiftTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const shiftTxCount = shiftTransactions.length;

  // Shift progress chart data by transaction
  const shiftChartData = shiftTransactions.map((tx, idx) => {
    const timeStr = new Date(tx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return {
      time: timeStr || `TX-${idx + 1}`,
      total: tx.total,
      id: tx.id
    };
  });

  // Current attendance status
  const myTodayAttendance = attendance.find(abs => {
    return abs.tanggal === todayStr && abs.user_id === currentUser.id;
  });

  const myLogsToday = dailyLogs.filter(log => {
    const logDate = log.tanggal.split("T")[0];
    return logDate === todayStr && log.user_id === currentUser.id;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="kasir-dashboard">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Selamat Bekerja, {currentUser.nama}!</h2>
          <p className="text-indigo-50 text-xs sm:text-sm mt-1">
            Gunakan dashboard ini untuk memantau ringkasan penjualan shift Anda dan akses cepat menu operasional.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-700/30 px-3 py-1.5 rounded-lg border border-indigo-400/20 text-xs font-medium backdrop-blur-sm">
          <Clock className="w-4 h-4 text-indigo-200" />
          <span>Shift Pagi · 20 Juli 2026</span>
        </div>
      </div>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Omzet Shift Ini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Omzet Shift Ini</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatRupiah(shiftRevenue)}</h3>
            <p className="text-xs text-indigo-600 mt-1 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Sesi aktif Anda hari ini
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Transaksi Shift Ini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Terlayani</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{shiftTxCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Selesai dicetak struk</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Status Absensi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kehadiran Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {myTodayAttendance ? myTodayAttendance.status : "Belum Absen Masuk"}
            </h3>
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              {myTodayAttendance?.jam_masuk ? (
                `Masuk jam ${myTodayAttendance.jam_masuk}`
              ) : (
                "Silakan isi absensi terlebih dahulu"
              )}
            </p>
          </div>
          <div className={`p-3 rounded-xl flex items-center justify-center flex-shrink-0 ${myTodayAttendance ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
            <Fingerprint className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Shift Sales Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Grafik Penjualan Shift Aktif Anda
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Dinamika nominal per transaksi yang Anda layani hari ini</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {shiftTxCount} Transaksi
          </span>
        </div>

        {shiftChartData.length > 0 ? (
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shiftChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="shiftGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
                          <p className="font-bold text-indigo-300">Waktu: {data.time}</p>
                          <p className="font-black text-sm text-white mt-0.5">{formatRupiah(data.total)}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">TX: {data.id}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#shiftGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Belum ada transaksi lunas pada shift Anda hari ini. Klik kasir (POS) di bawah untuk mulai melayani pelanggan.
          </div>
        )}
      </div>

      {/* 2. Quick Actions Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-indigo-600" /> Akses Cepat Fitur Utama
        </h4>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* POS/Kasir */}
          <button 
            onClick={() => onNavigate("kasir")}
            className="flex flex-col items-center p-5 bg-indigo-50/20 hover:bg-indigo-50/50 hover:scale-[1.02] border border-indigo-100 hover:border-indigo-200 rounded-xl text-center transition-all group focus:outline-none cursor-pointer"
            id="action-pos"
          >
            <div className="p-3 bg-indigo-600 text-white rounded-xl mb-3 shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Kasir (POS)</span>
            <span className="text-[10px] text-slate-400 mt-1">Mulai Transaksi Baru</span>
          </button>

          {/* Gudang */}
          <button 
            onClick={() => onNavigate("gudang")}
            className="flex flex-col items-center p-5 bg-indigo-50/20 hover:bg-indigo-50/50 hover:scale-[1.02] border border-indigo-100 hover:border-indigo-200 rounded-xl text-center transition-all group focus:outline-none cursor-pointer"
            id="action-gudang"
          >
            <div className="p-3 bg-indigo-600 text-white rounded-xl mb-3 shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Gudang & Stok</span>
            <span className="text-[10px] text-slate-400 mt-1">Input Barang Masuk/Keluar</span>
          </button>

          {/* Catatan Harian */}
          <button 
            onClick={() => onNavigate("catat_harian")}
            className="flex flex-col items-center p-5 bg-indigo-50/20 hover:bg-indigo-50/50 hover:scale-[1.02] border border-indigo-100 hover:border-indigo-200 rounded-xl text-center transition-all group focus:outline-none cursor-pointer"
            id="action-catatan"
          >
            <div className="p-3 bg-indigo-600 text-white rounded-xl mb-3 shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform">
              <FileEdit className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Tulis Catatan</span>
            <span className="text-[10px] text-slate-400 mt-1">Catat Kendala & Shift</span>
          </button>

          {/* Absensi */}
          <button 
            onClick={() => onNavigate("absensi")}
            className="flex flex-col items-center p-5 bg-indigo-50/20 hover:bg-indigo-50/50 hover:scale-[1.02] border border-indigo-100 hover:border-indigo-200 rounded-xl text-center transition-all group focus:outline-none cursor-pointer"
            id="action-absen"
          >
            <div className="p-3 bg-indigo-600 text-white rounded-xl mb-3 shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Absensi</span>
            <span className="text-[10px] text-slate-400 mt-1">Keluar / Masuk Shift</span>
          </button>

        </div>
      </div>

      {/* 3. My Daily Logs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" /> Catatan Harian Saya (Hari Ini)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Semua laporan kendala & serah terima shift aktif Anda</p>
          </div>
          <button 
            onClick={() => onNavigate("catat_harian")}
            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {myLogsToday.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLogsToday.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    log.kategori === "Operasional" ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    log.kategori === "Keuangan" ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    log.kategori === "Stok" ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-purple-50 text-purple-700 border border-purple-100'
                  }`}>
                    {log.kategori}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{log.isi}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-600">Belum ada catatan hari ini</p>
            <p className="text-[10px] text-slate-400 mt-1">Tulis kejadian operasional hari ini demi transparansi.</p>
            <button 
              onClick={() => onNavigate("catat_harian")}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Tulis Catatan Pertama
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
