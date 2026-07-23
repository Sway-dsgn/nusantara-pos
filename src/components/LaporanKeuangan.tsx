/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Lock,
  ArrowRight,
  Package,
  Users,
  ClipboardList,
  BarChart2,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { User, Produk, Transaksi, PergerakanStok, Absensi } from "../types";

interface LaporanKeuanganProps {
  currentUser: User;
  users: User[];
  products: Produk[];
  transactions: Transaksi[];
  stockMovements: PergerakanStok[];
  attendanceList: Absensi[];
}

export default function LaporanKeuangan({
  currentUser,
  users,
  products,
  transactions,
  stockMovements,
  attendanceList
}: LaporanKeuanganProps) {
  // Tabs: "omzet", "labarugi", "stok_laporan", "absensi_laporan"
  const [activeTab, setActiveTab] = useState<"omzet" | "labarugi" | "stok_laporan" | "absensi_laporan">("omzet");
  
  // Date range filter
  const [dateRange, setDateRange] = useState<"hari_ini" | "7hari" | "sebulan" | "setahun">("7hari");

  const todayStr = new Date().toISOString().split("T")[0];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper to parse dates
  const isWithinRange = (dateIso: string) => {
    const txDate = new Date(dateIso.split("T")[0]);
    const today = new Date(todayStr);
    
    if (dateRange === "hari_ini") {
      return dateIso.split("T")[0] === todayStr;
    } else if (dateRange === "7hari") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return txDate >= sevenDaysAgo && txDate <= today;
    } else if (dateRange === "sebulan") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return txDate >= thirtyDaysAgo && txDate <= today;
    } else { // setahun
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return txDate >= oneYearAgo && txDate <= today;
    }
  };

  // 1. Transaction stats filtered by date range and permissions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchRange = isWithinRange(tx.tanggal);
      const isOwner = currentUser.role === "owner";
      const isMyTx = tx.kasir_id === currentUser.id;
      // Cashier can only see their own transactions for the range
      return matchRange && (isOwner || isMyTx);
    });
  }, [transactions, dateRange, currentUser]);

  const activeLunasTx = useMemo(() => {
    return filteredTransactions.filter(t => t.status === "lunas");
  }, [filteredTransactions]);

  const totalRevenue = useMemo(() => {
    return activeLunasTx.reduce((sum, tx) => sum + tx.total, 0);
  }, [activeLunasTx]);

  const totalDiscount = useMemo(() => {
    return activeLunasTx.reduce((sum, tx) => sum + tx.diskon, 0);
  }, [activeLunasTx]);

  // 2. Simple Cost of Goods Sold (COGS / HPP) calculations
  const totalHPP = useMemo(() => {
    return activeLunasTx.reduce((sum, tx) => {
      const txHPP = tx.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.produk_id);
        const costPrice = prod ? prod.harga_beli : 0;
        return itemSum + (costPrice * item.qty);
      }, 0);
      return sum + txHPP;
    }, 0);
  }, [activeLunasTx, products]);

  // 3. Operational Overhead simulation
  const operationalCosts = 450000; // salary and electric mockups
  const netProfit = useMemo(() => {
    return totalRevenue - totalHPP - totalDiscount - operationalCosts;
  }, [totalRevenue, totalHPP, totalDiscount]);

  // 4. Stock Statistics
  const stockSummary = useMemo(() => {
    // Collect stats: total stock in, out, sales
    const itemsStats: Record<string, { nama: string; in: number; out: number; sales: number; sisa: number }> = {};
    
    products.forEach(p => {
      itemsStats[p.id] = { nama: p.nama, in: 0, out: 0, sales: 0, sisa: p.stok };
    });

    stockMovements.forEach(move => {
      if (itemsStats[move.produk_id]) {
        if (move.jenis === "masuk") {
          itemsStats[move.produk_id].in += move.jumlah;
        } else if (move.jenis === "keluar") {
          itemsStats[move.produk_id].out += Math.abs(move.jumlah);
        } else if (move.jenis === "penjualan") {
          itemsStats[move.produk_id].sales += Math.abs(move.jumlah);
        } else if (move.jenis === "opname") {
          if (move.jumlah > 0) itemsStats[move.produk_id].in += move.jumlah;
          else itemsStats[move.produk_id].out += Math.abs(move.jumlah);
        }
      }
    });

    return Object.entries(itemsStats).map(([id, val]) => ({
      id,
      ...val
    }));
  }, [products, stockMovements]);

  // 5. Attendance recap aggregates
  const attendanceRecap = useMemo(() => {
    const recap: Record<string, { nama: string; hadir: number; telat: number; izin: number; sakit: number; alpha: number }> = {};
    
    users.filter(u => u.role === "kasir").forEach(u => {
      recap[u.id] = { nama: u.nama, hadir: 0, telat: 0, izin: 0, sakit: 0, alpha: 0 };
    });

    attendanceList.forEach(abs => {
      if (recap[abs.user_id]) {
        if (abs.status === "Hadir") recap[abs.user_id].hadir++;
        else if (abs.status === "Telat") recap[abs.user_id].telat++;
        else if (abs.status === "Izin") recap[abs.user_id].izin++;
        else if (abs.status === "Sakit") recap[abs.user_id].sakit++;
        else if (abs.status === "Alpha") recap[abs.user_id].alpha++;
      }
    });

    return Object.entries(recap).map(([id, stats]) => ({
      id,
      ...stats
    }));
  }, [users, attendanceList]);

  // Chart Data calculations
  const dailyTrendData = useMemo(() => {
    const trendMap: Record<string, { date: string; label: string; omzet: number; count: number }> = {};
    const monthsName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

    activeLunasTx.forEach(tx => {
      const dateParts = tx.tanggal.split("T")[0].split("-"); // [YYYY, MM, DD]
      if (dateParts.length < 3) return;
      const year = dateParts[0];
      const monthIdx = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      if (dateRange === "setahun") {
        // Group by Month: YYYY-MM
        const monthKey = `${year}-${dateParts[1]}`;
        if (!trendMap[monthKey]) {
          trendMap[monthKey] = { 
            date: monthKey, 
            label: `${monthsName[monthIdx]} ${year}`, 
            omzet: 0, 
            count: 0 
          };
        }
        trendMap[monthKey].omzet += tx.total;
        trendMap[monthKey].count += 1;
      } else {
        // Group by Day: YYYY-MM-DD
        const dKey = tx.tanggal.split("T")[0];
        if (!trendMap[dKey]) {
          trendMap[dKey] = { 
            date: dKey, 
            label: `${day} ${monthsName[monthIdx]}`, 
            omzet: 0, 
            count: 0 
          };
        }
        trendMap[dKey].omzet += tx.total;
        trendMap[dKey].count += 1;
      }
    });

    return Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeLunasTx, dateRange]);

  const paymentMethodData = useMemo(() => {
    let tunai = 0;
    let qris = 0;
    activeLunasTx.forEach(tx => {
      if (tx.metode_bayar.toLowerCase() === "qris") qris += tx.total;
      else tunai += tx.total;
    });
    return [
      { name: "Tunai (Cash)", value: tunai, color: "#4f46e5" },
      { name: "QRIS / Digital", value: qris, color: "#06b6d4" }
    ];
  }, [activeLunasTx]);

  const profitLossBarData = useMemo(() => {
    return [
      { name: "Pendapatan Kotor", amount: totalRevenue + totalDiscount, color: "#4f46e5" },
      { name: "Diskon Belanja", amount: totalDiscount, color: "#f43f5e" },
      { name: "Modal Barang (HPP)", amount: totalHPP, color: "#f59e0b" },
      { name: "Biaya Operasional", amount: operationalCosts, color: "#06b6d4" },
      { name: "Laba Bersih", amount: netProfit, color: netProfit >= 0 ? "#10b981" : "#e11d48" }
    ];
  }, [totalRevenue, totalDiscount, totalHPP, operationalCosts, netProfit]);

  // 6. CSV/Excel export simulator
  const handleExportCSV = (reportName: string, headers: string[], rows: any[][]) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add Headers
    csvContent += headers.join(",") + "\n";
    
    // Add Rows
    rows.forEach(row => {
      csvContent += row.map(v => `"${v}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}_${dateRange}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Laporan ${reportName} berhasil diekspor sebagai file CSV!`);
  };

  const exportSalesCSV = () => {
    const headers = ["ID Transaksi", "Tanggal", "Nama Kasir", "Total Belanja (IDR)", "Diskon (IDR)", "Metode Bayar", "Status"];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.tanggal).toLocaleString("id-ID"),
      t.kasir_nama,
      t.total,
      t.diskon,
      t.metode_bayar,
      t.status
    ]);
    handleExportCSV("Laporan_Penjualan_Toko", headers, rows);
  };

  const exportStockCSV = () => {
    const headers = ["ID Produk", "Nama Produk", "Total Pengadaan Masuk", "Total Barang Keluar/Rusak", "Total Terjual", "Sisa Stok Akhir"];
    const rows = stockSummary.map(s => [
      s.id,
      s.nama,
      s.in,
      s.out,
      s.sales,
      s.sisa
    ]);
    handleExportCSV("Laporan_Audit_Gudang", headers, rows);
  };

  return (
    <div className="space-y-6" id="reports-main">
      
      {/* Date filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Laporan Keuangan & Operasional</h3>
            <p className="text-xs text-slate-400 mt-0.5">Analisis omzet penjualan, laba rugi sederhana, mutasi barang, dan keaktifan absen</p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center space-x-1 border border-slate-200 p-1 bg-slate-50 rounded-lg flex-wrap">
          {[
            { id: "hari_ini", label: "Hari Ini" },
            { id: "7hari", label: "7 Hari" },
            { id: "sebulan", label: "Bulan Ini (30 Hari)" },
            { id: "setahun", label: "Tahun Ini (12 Bulan)" }
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={() => setDateRange(opt.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                dateRange === opt.id 
                ? 'bg-white text-indigo-600 shadow-xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports navigation list tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab("omzet")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap focus:outline-none transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "omzet" 
            ? 'border-indigo-600 text-indigo-700 font-extrabold' 
            : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Laporan Penjualan & Omzet
        </button>
        <button 
          onClick={() => {
            if (currentUser.role !== "owner") {
              alert("Laba Rugi toko adalah rahasia finansial and hanya boleh dilihat oleh Owner.");
              return;
            }
            setActiveTab("labarugi");
          }}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap focus:outline-none transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "labarugi" 
            ? 'border-indigo-600 text-indigo-700 font-extrabold' 
            : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Laba Rugi Sederhana {currentUser.role !== "owner" && <Lock className="w-3 h-3 text-slate-300 ml-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab("stok_laporan")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap focus:outline-none transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "stok_laporan" 
            ? 'border-indigo-600 text-indigo-700 font-extrabold' 
            : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Laporan Stok Gudang
        </button>
        <button 
          onClick={() => {
            if (currentUser.role !== "owner") {
              alert("Rekap absensi karyawan harian hanya diizinkan untuk Owner.");
              return;
            }
            setActiveTab("absensi_laporan");
          }}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap focus:outline-none transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "absensi_laporan" 
            ? 'border-indigo-600 text-indigo-700 font-extrabold' 
            : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Rekap Absensi {currentUser.role !== "owner" && <Lock className="w-3 h-3 text-slate-300 ml-0.5" />}
        </button>
      </div>

      {/* TAB 1: OMZET PENJUALAN */}
      {activeTab === "omzet" && (
        <div className="space-y-6 animate-fade-in" id="sales-report-tab">
          
          {/* Sales metrics boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan Bersih (Lunas)</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{formatRupiah(totalRevenue)}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Omzet bersih terpotong diskon langsung</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diskon Diberikan</p>
              <h3 className="text-2xl font-black text-rose-500 mt-1">{formatRupiah(totalDiscount)}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Total pengurangan harga belanja</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faktur Transaksi Terbit</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{activeLunasTx.length} Nota</h3>
              <p className="text-[10px] text-slate-400 mt-1">Dari total {filteredTransactions.length} percobaan transaksi</p>
            </div>
          </div>

          {/* Charts Row for Sales Trend and Payment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-indigo-600" /> Grafik Tren Omzet Penjualan
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Grafik dinamika pendapatan berdasarkan rentang filter</p>
                </div>
              </div>
              
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                              <p className="font-bold text-indigo-300">Tanggal: {data.date}</p>
                              <p className="text-sm font-black mt-1 text-white">{formatRupiah(data.omzet)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{data.count} Transaksi</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="omzet" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#omzetGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Distribution Pie Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" /> Metode Pembayaran
                </h4>
                <p className="text-xs text-slate-400 mb-2">Tunai vs QRIS Digital</p>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [formatRupiah(Number(val) || 0), 'Total']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '11px', border: 'none' }}
                      />
                      <Legend 
                        iconType="circle" 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        formatter={(value) => <span className="text-[10px] text-slate-600 font-bold">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Listing Card with Export Button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rincian Transaksi POS</h4>
              <button 
                onClick={exportSalesCSV}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 focus:outline-none cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Excel/CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-3">Kode TX</th>
                    <th className="py-2 px-3">Tanggal / Waktu</th>
                    <th className="py-2 px-3">Melayani</th>
                    <th className="py-2 px-3">Barang Terbeli</th>
                    <th className="py-2 px-3">Subtotal Diskon</th>
                    <th className="py-2 px-3">Total Akhir</th>
                    <th className="py-2 px-3">Pembayaran</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {new Date(t.tanggal).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{t.kasir_nama}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-bold max-w-xs truncate">
                        {t.items.map(item => `${item.produk_nama} (${item.qty}x)`).join(", ")}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-rose-500">- {formatRupiah(t.diskon)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{formatRupiah(t.total)}</td>
                      <td className="py-2.5 px-3 uppercase font-semibold text-[10px] text-slate-600">{t.metode_bayar}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === "lunas" ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LABA RUGI SEDERHANA (OWNER ONLY) */}
      {activeTab === "labarugi" && currentUser.role === "owner" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="profit-loss-tab">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-600" /> Laporan Laba Rugi Sederhana Toko
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Pendapatan kotor dikurangi modal harga beli barang (HPP) dan biaya tetap operasional harian.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table breakdown */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs font-medium h-fit">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between font-bold text-xs text-slate-400">
                <span>URAIAN TRANSAKSI</span>
                <span>JUMLAH NOMINAL (RP)</span>
              </div>

              <div className="p-4 space-y-3.5 text-xs text-slate-700">
                {/* Pendapatan Penjualan */}
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Pendapatan Kotor Penjualan
                  </span>
                  <span className="font-bold font-mono">{formatRupiah(totalRevenue + totalDiscount)}</span>
                </div>

                {/* Potongan Diskon */}
                <div className="flex justify-between items-center text-rose-500 pl-4 border-l-2 border-rose-100">
                  <span>Potongan Diskon Belanja</span>
                  <span className="font-mono">- {formatRupiah(totalDiscount)}</span>
                </div>

                {/* Pendapatan Bersih */}
                <div className="flex justify-between items-center font-bold text-slate-800 border-t border-slate-200 pt-3">
                  <span>Pendapatan Bersih (Net Sales)</span>
                  <span className="font-mono text-indigo-600">{formatRupiah(totalRevenue)}</span>
                </div>

                {/* HPP modal */}
                <div className="flex justify-between items-center text-slate-600 pl-4 border-l-2 border-slate-200">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-slate-400" /> Modal Barang Terjual (HPP)
                  </span>
                  <span className="font-mono">- {formatRupiah(totalHPP)}</span>
                </div>

                {/* Gaji & Operasional */}
                <div className="flex justify-between items-center text-slate-600 pl-4 border-l-2 border-slate-200">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" /> Biaya Operasional Tetap
                  </span>
                  <span className="font-mono">- {formatRupiah(operationalCosts)}</span>
                </div>

                {/* LABA BERSIH AKHIR */}
                <div className="flex justify-between items-center font-black text-sm border-t-2 border-slate-200 pt-4 text-slate-900 bg-slate-50 p-3 rounded-lg">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <DollarSign className="w-5 h-5 text-indigo-600" /> LABA BERSIH OPERASIONAL
                  </span>
                  <span className={`font-mono text-base ${netProfit >= 0 ? 'text-indigo-700' : 'text-rose-500'}`}>
                    {formatRupiah(netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart breakdown */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Visualisasi Komposisi Keuangan</h4>
                <p className="text-xs text-slate-400 mb-4">Perbandingan nominal pendapatan vs modal & laba</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitLossBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#64748b' }}
                        interval={0}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                                <p className="font-bold text-indigo-300">{data.name}</p>
                                <p className="text-sm font-black mt-1 text-white">{formatRupiah(data.amount)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={36}>
                        {profitLossBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT STOK */}
      {activeTab === "stok_laporan" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in" id="stock-audit-tab">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Laporan Audit Stok & Mutasi Barang</h4>
              <p className="text-xs text-slate-400 mt-0.5">Analisis barang masuk supplier, barang terbuang (rusak), dan produk terjual</p>
            </div>
            <button 
              onClick={exportStockCSV}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Excel/CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3">Kode Barang</th>
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3 text-center text-indigo-700 bg-indigo-50/30">Total Masuk (Supplier)</th>
                  <th className="py-2.5 px-3 text-center text-rose-700 bg-rose-50/30">Total Keluar (Rusak)</th>
                  <th className="py-2.5 px-3 text-center text-blue-700 bg-blue-50/30">Terjual Kasir</th>
                  <th className="py-2.5 px-3 text-center">Sisa Stok Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {stockSummary.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{row.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{row.nama}</td>
                    <td className="py-2.5 px-3 text-center text-indigo-700 font-mono font-bold bg-indigo-50/10">+{row.in}</td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-mono font-bold bg-rose-50/10">-{row.out}</td>
                    <td className="py-2.5 px-3 text-center text-blue-700 font-mono font-bold bg-blue-50/10">-{row.sales}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 font-mono">{row.sisa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REKAP ABSENSI (OWNER ONLY) */}
      {activeTab === "absensi_laporan" && currentUser.role === "owner" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="attendance-report-tab">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Rekap Kehadiran Bulanan Karyawan
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Penilaian kedisiplinan dan total absensi masuk tepat waktu.</p>
          </div>

          {/* Attendance Visual Bar Chart */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Grafik Perbandingan Kedisiplinan</h5>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceRecap} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Legend iconType="circle" formatter={(value) => <span className="text-[11px] text-slate-600 font-semibold">{value}</span>} />
                  <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="telat" name="Telat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sakit" name="Sakit" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alpha" name="Alpha" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4">Nama Karyawan</th>
                  <th className="py-3 px-4 text-center">Hadir</th>
                  <th className="py-3 px-4 text-center">Terlambat (Telat)</th>
                  <th className="py-3 px-4 text-center">Izin</th>
                  <th className="py-3 px-4 text-center">Sakit</th>
                  <th className="py-3 px-4 text-center">Alpha (Tanpa Kabar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {attendanceRecap.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/20">
                    <td className="py-3 px-4 font-bold text-slate-800">{rec.nama}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold font-mono">{rec.hadir} Hari</td>
                    <td className="py-3 px-4 text-center text-amber-500 font-bold font-mono">{rec.telat} Hari</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-bold font-mono">{rec.izin} Hari</td>
                    <td className="py-3 px-4 text-center text-purple-600 font-bold font-mono">{rec.sakit} Hari</td>
                    <td className="py-3 px-4 text-center text-rose-600 font-bold font-mono">{rec.alpha} Hari</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
