/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  PackageCheck,
  Calendar,
  Star,
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
import { Transaksi, Produk, CatatanHarian } from "../types";

interface DashboardOwnerProps {
  transactions: Transaksi[];
  products: Produk[];
  dailyLogs: CatatanHarian[];
  onNavigate: (view: string) => void;
}

export default function DashboardOwner({
  transactions,
  products,
  dailyLogs,
  onNavigate
}: DashboardOwnerProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [timeRange, setTimeRange] = useState<"7hari" | "bulan" | "tahun">("7hari");

  // 1. Calculations for KPIs
  const todayStr = new Date().toISOString().split("T")[0];

  // Get active transactions of today
  const todayTransactions = transactions.filter(tx => {
    const txDate = tx.tanggal.split("T")[0];
    return txDate === todayStr && tx.status === "lunas";
  });

  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const todayTxCount = todayTransactions.length;
  const todayItemsSold = todayTransactions.reduce((sum, tx) => {
    return sum + (tx.items || []).reduce((s, item) => s + item.qty, 0);
  }, 0);

  // Stock alerts
  const lowStockProducts = products.filter(p => p.stok <= p.stok_minimum);
  const lowStockCount = lowStockProducts.length;

  // 2. Data for Sales Chart based on timeRange (7 Hari, Bulan, or Tahun)
  const getSalesChartData = () => {
    const data: { label: string; fullLabel: string; date: string; amount: number; count: number }[] = [];
    const baseDate = new Date();

    if (timeRange === "7hari") {
      const daysName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        
        const dayTransactions = transactions.filter(tx => {
          return tx.tanggal.split("T")[0] === dateStr && tx.status === "lunas";
        });
        
        const dayRevenue = dayTransactions.reduce((sum, tx) => sum + tx.total, 0);
        
        data.push({
          label: daysName[d.getDay()],
          fullLabel: `${daysName[d.getDay()]}, ${d.getDate()} Jul 2026`,
          date: dateStr,
          amount: dayRevenue,
          count: dayTransactions.length
        });
      }
    } else if (timeRange === "bulan") {
      // 30 Days breakdown
      const monthsName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const dayTransactions = transactions.filter(tx => {
          return tx.tanggal.split("T")[0] === dateStr && tx.status === "lunas";
        });

        const dayRevenue = dayTransactions.reduce((sum, tx) => sum + tx.total, 0);

        data.push({
          label: `${d.getDate()} ${monthsName[d.getMonth()]}`,
          fullLabel: `${d.getDate()} ${monthsName[d.getMonth()]} 2026`,
          date: dateStr,
          amount: dayRevenue,
          count: dayTransactions.length
        });
      }
    } else {
      // 12 Months breakdown
      const monthsName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        const year = d.getFullYear();
        const monthIndex = d.getMonth();
        const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

        const monthTransactions = transactions.filter(tx => {
          return tx.tanggal.startsWith(monthKey) && tx.status === "lunas";
        });

        const monthRevenue = monthTransactions.reduce((sum, tx) => sum + tx.total, 0);

        data.push({
          label: monthsName[monthIndex],
          fullLabel: `Bulan ${monthsName[monthIndex]} ${year}`,
          date: monthKey,
          amount: monthRevenue,
          count: monthTransactions.length
        });
      }
    }
    return data;
  };

  const chartData = getSalesChartData();

  // Category sales distribution for Pie Chart
  const getCategoryData = () => {
    const categoryMap: Record<string, number> = {};
    transactions.filter(t => t.status === "lunas").forEach(tx => {
      tx.items.forEach(item => {
        const prod = products.find(p => p.id === item.produk_id);
        const cat = prod?.kategori || "Lainnya";
        categoryMap[cat] = (categoryMap[cat] || 0) + item.subtotal;
      });
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const categoryData = getCategoryData();
  const CATEGORY_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

  // 3. Top-selling products
  const getTopProducts = () => {
    const salesMap: Record<string, { nama: string; qty: number; total: number }> = {};
    
    // Aggregate lunas transactions
    transactions.filter(t => t.status === "lunas").forEach(tx => {
      tx.items.forEach(item => {
        if (!salesMap[item.produk_id]) {
          salesMap[item.produk_id] = { nama: item.produk_nama, qty: 0, total: 0 };
        }
        salesMap[item.produk_id].qty += item.qty;
        salesMap[item.produk_id].total += item.subtotal;
      });
    });

    return Object.values(salesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  };

  const topProducts = getTopProducts();

  // 4. Format numbers to Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="owner-dashboard">
      {/* 1. Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Omzet Hari Ini */}
        <div 
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-all"
          onClick={() => onNavigate("laporan")}
          id="kpi-revenue"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Omzet Hari Ini</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatRupiah(todayRevenue)}</h3>
            <p className="text-xs text-indigo-600 mt-1 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Dari {todayTxCount} transaksi
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Transaksi Hari Ini */}
        <div 
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-all"
          onClick={() => onNavigate("laporan")}
          id="kpi-transactions"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{todayTxCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Hari ini ({todayStr})</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Stok Menipis Warning */}
        <div 
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-200 transition-all"
          onClick={() => onNavigate("gudang")}
          id="kpi-low-stock"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stok Menipis</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{lowStockCount}</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center">
              {lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Perlu restock segera
                </>
              ) : (
                <>
                  <PackageCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Semua stok aman
                </>
              )}
            </p>
          </div>
          <div className={`p-3 rounded-xl flex items-center justify-center flex-shrink-0 ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Visual Charts & Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Sales Chart Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between" id="owner-weekly-chart-container">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Grafik Omzet Penjualan
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mode: <span className="font-semibold text-slate-700 capitalize">{timeRange === "7hari" ? "7 Hari Terakhir" : timeRange === "bulan" ? "30 Hari (Bulan)" : "12 Bulan (Tahun)"}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Time Range Selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button 
                    onClick={() => setTimeRange("7hari")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === "7hari" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    7 Hari
                  </button>
                  <button 
                    onClick={() => setTimeRange("bulan")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === "bulan" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Bulan
                  </button>
                  <button 
                    onClick={() => setTimeRange("tahun")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === "tahun" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Tahun
                  </button>
                </div>

                {/* Chart Type Selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button 
                    onClick={() => setChartType("area")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      chartType === "area" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Area
                  </button>
                  <button 
                    onClick={() => setChartType("bar")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      chartType === "bar" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Batang
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Chart Container */}
            <div className="h-64 w-full pt-2" id="recharts-weekly-sales">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
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
                              <p className="font-bold text-indigo-300">{data.fullLabel}</p>
                              <p className="text-sm font-black mt-1 text-white">{formatRupiah(data.amount)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{data.count} Transaksi Lunas</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                              <p className="font-bold text-indigo-300">{data.fullLabel}</p>
                              <p className="text-sm font-black mt-1 text-white">{formatRupiah(data.amount)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{data.count} Transaksi Lunas</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-xs text-slate-400">
            <span>Hover / sentuh grafik untuk melihat angka pasti</span>
            <button 
              onClick={() => onNavigate("laporan")} 
              className="text-indigo-600 font-semibold flex items-center hover:underline focus:outline-none"
            >
              Lihat Laporan Lengkap <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Stock Alerts Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="owner-restock-alerts">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Perlu Restock
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                {lowStockCount} Barang
              </span>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 hover:bg-amber-50/50 rounded-lg border border-slate-200 transition-colors flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.nama}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Kategori: {p.kategori}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                          Stok: {p.stok} {p.satuan}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Min: {p.stok_minimum} {p.satuan}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigate("gudang")}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-amber-600 hover:border-amber-200 transition-colors"
                      title="Tambah Stok"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-center">
                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full mb-2">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Semua Stok Terpenuhi</p>
                <p className="text-[10px] text-slate-400 mt-1">Tidak ada produk di bawah stok minimum.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate("gudang")}
            className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors mt-4"
          >
            Buka Pengelolaan Stok
          </button>
        </div>

      </div>

      {/* 3. Category Distribution & Product Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Sales Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="owner-category-chart">
          <div>
            <h4 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-indigo-600" /> Proporsi Omzet Kategori
            </h4>
            <p className="text-xs text-slate-400 mb-4">Distribusi total pendapatan berdasarkan kategori produk</p>

            {categoryData.length > 0 ? (
              <div className="h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatRupiah(Number(val) || 0), 'Omzet']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '11px', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      iconType="circle" 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      formatter={(value) => <span className="text-[11px] text-slate-600 font-semibold">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">Belum ada data omzet kategori.</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="owner-best-sellers">
          <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Produk Terlaris Teratas
          </h4>
          {topProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.nama}</p>
                      <p className="text-[10px] text-slate-400">Total Terjual: {p.qty} item</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{formatRupiah(p.total)}</p>
                    <p className="text-[10px] text-slate-400">Penerimaan</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Belum ada data transaksi lunas.</p>
          )}
        </div>

        {/* Latest Logbook Snippets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="owner-recent-logs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Catatan Harian Terbaru
              </h4>
              <button 
                onClick={() => onNavigate("catat_harian")}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {dailyLogs.slice(0, 3).map(log => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                        {log.user_nama.split(" ")[0]}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        log.kategori === "Operasional" ? 'bg-blue-50 text-blue-700' :
                        log.kategori === "Keuangan" ? 'bg-indigo-50 text-indigo-700' :
                        log.kategori === "Stok" ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {log.kategori}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.tanggal).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic leading-relaxed">
                    "{log.isi}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("catat_harian")}
            className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 rounded-lg text-xs font-semibold transition-colors mt-4 flex items-center justify-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Buka Logbook Toko
          </button>
        </div>

      </div>
    </div>
  );
}

// Simple internal icon to avoid extra imports
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
