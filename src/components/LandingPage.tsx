import React, { useState } from "react";
import {
  Store,
  BarChart2,
  ShoppingCart,
  Package,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Lock,
  User as UserIcon,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  Zap,
  Clock,
  Coffee,
  DollarSign,
  LineChart,
  Calendar,
  AlertTriangle,
  Receipt,
  Layers,
  ChevronRight,
  Upload,
  Check,
  Smartphone,
  X
} from "lucide-react";

interface LandingPageProps {
  onGoToLogin: () => void;
}

export function LandingPage({ onGoToLogin }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<"dashboard" | "pos" | "stok" | "keuangan" | "absensi">("dashboard");

  // Scroll smoothly to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Background Soft Blue Radial Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-200/40 via-sky-100/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[1600px] -right-48 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Floating Pill Top Navbar */}
      <div className="sticky top-4 z-40 px-4 sm:px-8 max-w-6xl mx-auto">
        <header className="bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-full px-5 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <Store className="w-4 h-4 text-white" />
            </span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                Nusantara POS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                v2.4
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => scrollToSection("preview-section")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Gambaran Dashboard
            </button>
            <button 
              onClick={() => scrollToSection("fitur-section")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Fitur Unggulan
            </button>
            <button 
              onClick={() => scrollToSection("keunggulan-section")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Keunggulan
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Masuk Sistem</span>
            </button>
          </div>
        </header>
      </div>

      {/* 2. Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Sistem Operasional Warkop & Kasir Modern</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Transformasi Bisnis Warkop Anda <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-slate-700">dengan Solusi </span>
            <span className="relative inline-block px-2">
              <span className="relative z-10 text-slate-900">POS Pintar</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-200/80 -z-10 rounded-sm" />
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tingkatkan omzet warkop dengan pengelolaan kasir POS cepat, pencatatan stok bahan baku real-time, rekap absensi selfie karyawan, dan analisis laba rugi otomatis.
          </p>

          {/* Filter Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              "Kasir POS Rapid",
              "Manajemen Stok Gudang",
              "Absensi Selfie Karyawan",
              "Laporan Laba Rugi Bersih"
            ].map((tag, idx) => (
              <span key={idx} className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium shadow-2xs">
                {tag}
              </span>
            ))}
          </div>

          {/* 3 Featured Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                  Baru
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Kasir POS Terintegrasi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proses transaksi kasir kurang dari 3 detik dengan cetak struk nota belanja langsung.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="px-2.5 py-0.5 bg-sky-200 text-sky-900 text-[10px] font-bold rounded-full">
                  Unggulan
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Kontrol Stok & HPP</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stok bahan kopi & mi otomatis terpotong saat transaksi lunas dengan kalkulasi HPP presisi.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                  Real-time
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Laporan Laba Rugi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pantau grafik pendapatan, biaya operasional, dan laba bersih harian dari mana saja.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SHOWCASE SECTION 1: "Buka Potensi Bisnis Warkop" */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-16">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Buka Potensi Maksimal <br className="hidden sm:inline" />
              Warkop Anda Sekarang
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
            Sistem operasional pintar mengoptimalkan alur kerja kasir, meningkatkan produktivitas karyawan, dan memberikan transparansi keuangan bagi pemilik usaha.
          </p>
        </div>

        {/* Feature Block 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Floating Cards Canvas */}
          <div className="p-6 bg-gradient-to-br from-blue-100/80 to-sky-100/50 border border-blue-200/60 rounded-3xl relative overflow-hidden min-h-[320px] flex items-center justify-center">
            
            {/* Background Accent Card */}
            <div className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 opacity-60 scale-95 -rotate-3 transition-transform">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400">Jadwal Shift Kasir</span>
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Pagi</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Shift Pagi: 07:00 - 15:00</div>
              <div className="text-[10px] text-slate-500 mt-1">Budi Santoso (Hadir Tepat Waktu)</div>
            </div>

            {/* Main Foreground Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border border-slate-200 absolute space-y-3 z-10 hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-extrabold text-slate-900">Pesanan Masuk #TX-892</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">Meja 04</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>2x Kopi Susu Aren</span>
                  <span className="font-bold">Rp 30.000</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>1x Indomie Nyemek</span>
                  <span className="font-bold">Rp 15.000</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-extrabold rounded-lg text-center shadow-2xs">
                  Konfirmasi Bayar
                </button>
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                  Cetak Struk
                </button>
              </div>
            </div>
          </div>

          {/* Right Text Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Transformasi Operasional dengan Hasil Teruji
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sistem Warkop POS telah membantu kelancaran pesanan jam sibuk, memangkas antrean pelanggan, dan mencegah kebocoran bahan baku.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                "Kasir POS Rapid",
                "Cetak Struk Nota",
                "Metode Bayar QRIS",
                "Cek Laporan Shift",
                "Kontrol Stok HPP",
                "Absensi Selfie"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Block 2 (Reversed Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8">
          {/* Left Text Description */}
          <div className="space-y-4 order-2 md:order-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Transparansi Keuangan & Monitoring Gudang Real-time
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dapatkan kepastian laba bersih usaha setiap hari tanpa pusing menghitung nota manual atau kwitansi yang hilang.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                "Laporan Laba Rugi",
                "Peringatan Stok Habis",
                "Top Produk Terlaris",
                "Grafik Trend Omzet",
                "Manajemen Hak Akses",
                "Rekap Kasir Lunas"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Floating Cards Canvas */}
          <div className="p-6 bg-gradient-to-br from-sky-100/60 to-blue-100/80 border border-sky-200/60 rounded-3xl relative overflow-hidden min-h-[320px] flex items-center justify-center order-1 md:order-2">
            
            {/* Card Preview */}
            <div className="w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3 z-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Ringkasan Hari Ini</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">Realtime</span>
              </div>

              <div className="flex justify-between items-end pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">Total Omzet Lunas</span>
                  <span className="text-xl font-black text-sky-400">Rp 1.450.000</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Laba Bersih</span>
                  <span className="text-sm font-bold text-blue-300">Rp 820.000</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 text-[11px]">Bahan: SKM Carnation</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">Sisa 3 Klg</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 4. INTERACTIVE DASHBOARD SHOWCASE ("Gambaran Dashboard dll") */}
      <section id="preview-section" className="py-16 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-blue-700" /> Gambaran Dasbor & Modul
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Simulasi Tampilan Interaktif Aplikasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Klik tab di bawah untuk mencoba dan melihat langsung gambaran visual setiap modul sistem.
            </p>
          </div>

          {/* Interactive Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {[
              { id: "dashboard", label: "Dasbor Owner", icon: BarChart2 },
              { id: "pos", label: "Kasir POS", icon: ShoppingCart },
              { id: "stok", label: "Stok Gudang", icon: Package },
              { id: "keuangan", label: "Laporan Keuangan", icon: FileText },
              { id: "absensi", label: "Absensi Selfie", icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mock Preview Display Frame */}
          <div className="bg-[#f0f7ff] border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Window Bar Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
                <span className="text-xs text-slate-500 font-mono pl-2">nusantara-pos.app / {activePreviewTab}</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-full flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Live Preview
              </span>
            </div>

            {/* TAB CONTENT 1: DASHBOARD OWNER PREVIEW */}
            {activePreviewTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in text-slate-800">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Omzet Hari Ini</span>
                    <span className="text-lg font-black text-blue-600 block mt-1">Rp 1.450.000</span>
                    <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +14.2% dari kemarin
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">48 Pesanan</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Rata-rata Rp 30.200 / tx</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimasi Laba Bersih</span>
                    <span className="text-lg font-black text-indigo-600 block mt-1">Rp 820.000</span>
                    <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">Margin Laba 56.5%</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Karyawan Hadir</span>
                    <span className="text-lg font-black text-amber-600 block mt-1">3 / 3 Orang</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Shift Pagi & Siang Aktif</span>
                  </div>
                </div>

                {/* Simulated Chart & Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">Grafik Omzet Penjualan (7 Hari Terakhir)</h4>
                        <p className="text-[10px] text-slate-400">Trend pendapatan lunas per hari</p>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-md">Realtime</span>
                    </div>

                    {/* Mock Bars */}
                    <div className="h-36 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
                      {[
                        { day: "16 Jul", h: "40%", val: "850rb" },
                        { day: "17 Jul", h: "60%", val: "1.1jt" },
                        { day: "18 Jul", h: "50%", val: "950rb" },
                        { day: "19 Jul", h: "80%", val: "1.3jt" },
                        { day: "20 Jul", h: "95%", val: "1.45jt" },
                        { day: "21 Jul", h: "75%", val: "1.2jt" },
                        { day: "22 Jul", h: "88%", val: "1.4jt" },
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[9px] font-bold text-slate-700">{bar.val}</span>
                          <div 
                            style={{ height: bar.h }} 
                            className="w-full bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-t-md transition-all" 
                          />
                          <span className="text-[9px] text-slate-400 font-medium">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <h4 className="text-xs font-extrabold text-slate-800 mb-3">Top Produk Terlaris</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Kopi Susu Gula Aren", qty: "32 Porsi", total: "Rp 480.000" },
                        { name: "Roti Bakar Coklat", qty: "18 Porsi", total: "Rp 270.000" },
                        { name: "Indomie Telur Kornet", qty: "15 Porsi", total: "Rp 225.000" },
                        { name: "Es Teh Manis", qty: "24 Porsi", total: "Rp 120.000" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 text-[11px]">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-700 block">{item.total}</span>
                            <span className="text-[9px] text-slate-400">{item.qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: KASIR POS PREVIEW */}
            {activePreviewTab === "pos" && (
              <div className="animate-fade-in text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Menu Catalog Grid */}
                  <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <ShoppingCart className="w-4 h-4 text-slate-900" /> Katalog Menu POS Rapid Select
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">12 Item Ready</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { name: "Kopi Susu Aren", price: "Rp 15.000", cat: "Minuman", bg: "bg-blue-50/60 border-blue-200" },
                        { name: "Kopi Hitam Tubruk", price: "Rp 8.000", cat: "Minuman", bg: "bg-blue-50/60 border-blue-200" },
                        { name: "Indomie Nyemek", price: "Rp 15.000", cat: "Makanan", bg: "bg-amber-50/60 border-amber-200" },
                        { name: "Roti Bakar Keju", price: "Rp 14.000", cat: "Snack", bg: "bg-sky-50/60 border-sky-200" },
                        { name: "Kentang Goreng", price: "Rp 12.000", cat: "Snack", bg: "bg-sky-50/60 border-sky-200" },
                        { name: "Es Teh Manis", price: "Rp 5.000", cat: "Minuman", bg: "bg-blue-50/60 border-blue-200" },
                      ].map((prod, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border ${prod.bg} hover:border-slate-400 transition-all cursor-pointer`}>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">{prod.cat}</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{prod.name}</span>
                          <span className="text-xs font-black text-slate-900 block mt-1">{prod.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cart & Receipt Mock */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-slate-900" /> Keranjang Belanja
                        </span>
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">Meja 04</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[11px]">
                          <span>2x Kopi Susu Aren</span>
                          <span className="font-bold">Rp 30.000</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>1x Indomie Nyemek</span>
                          <span className="font-bold">Rp 15.000</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>1x Es Teh Manis</span>
                          <span className="font-bold">Rp 5.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Total Pembayaran</span>
                        <span className="text-sm font-black text-blue-600">Rp 50.000</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <div className="p-2 bg-blue-600 text-white text-[10px] font-bold text-center rounded-lg shadow-2xs">
                          Tunai (Uang Pas)
                        </div>
                        <div className="p-2 bg-slate-100 text-slate-600 text-[10px] font-bold text-center rounded-lg">
                          QRIS / Transfer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: STOK GUDANG PREVIEW */}
            {activePreviewTab === "stok" && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-slate-800 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-slate-900" /> Pelacakan Stok Bahan & HPP Produk
                    </h4>
                    <p className="text-[10px] text-slate-400">Otomatis berkurang saat transaksi kasir lunas</p>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-1 rounded-lg border border-rose-100">
                    1 Bahan Stok Menipis
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                        <th className="py-2 px-2">Nama Bahan / Barang</th>
                        <th className="py-2 px-2">Kategori</th>
                        <th className="py-2 px-2">Sisa Stok</th>
                        <th className="py-2 px-2">Harga Beli (HPP)</th>
                        <th className="py-2 px-2">Status Stok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="py-2.5 px-2 font-bold text-slate-800">Biji Kopi Robusta Dampit</td>
                        <td className="py-2.5 px-2 text-slate-500">Bahan Baku</td>
                        <td className="py-2.5 px-2 font-black text-slate-800">12.5 Kg</td>
                        <td className="py-2.5 px-2">Rp 95.000 / kg</td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">Aman</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 font-bold text-slate-800">Susu Kental Manis Carnation</td>
                        <td className="py-2.5 px-2 text-slate-500">Bahan Baku</td>
                        <td className="py-2.5 px-2 font-black text-rose-600">3 Kaleng</td>
                        <td className="py-2.5 px-2">Rp 12.000 / klg</td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" /> Restock
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 font-bold text-slate-800">Indomie Goreng Spesial</td>
                        <td className="py-2.5 px-2 text-slate-500">Barang Jadi</td>
                        <td className="py-2.5 px-2 font-black text-slate-800">42 Bungkus</td>
                        <td className="py-2.5 px-2">Rp 3.100 / pcs</td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">Aman</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: LAPORAN KEUANGAN PREVIEW */}
            {activePreviewTab === "keuangan" && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-slate-800 animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-900" /> Ringkasan Laporan Laba Rugi Bersih
                    </h4>
                    <p className="text-[10px] text-slate-400">Periode: Bulan Juli 2026</p>
                  </div>
                  <span className="text-xs font-black text-white bg-blue-600 px-2.5 py-1 rounded-lg">
                    Laba Bersih: Rp 12.450.000
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">TOTAL OMZET BRUTO</span>
                    <span className="text-sm font-black text-slate-800 block mt-1">Rp 28.500.000</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">Dari 890 transaksi</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">TOTAL HPP (MODAL BAHAN)</span>
                    <span className="text-sm font-black text-rose-600 block mt-1">Rp 12.800.000</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">HPP rata-rata 44.9%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">BEBAN OPERASIONAL & GAJI</span>
                    <span className="text-sm font-black text-amber-600 block mt-1">Rp 3.250.000</span>
                    <span className="text-[9px] text-slate-500 mt-1 block">Sewa, Listrik, Gaji</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: ABSENSI PREVIEW */}
            {activePreviewTab === "absensi" && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-slate-800 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-900" /> Rekap Absensi Selfie Karyawan & Shift
                    </h4>
                    <p className="text-[10px] text-slate-400">Bukti foto selfie waktu masuk & pulang kasir</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg">
                    3 Karyawan Hadir Hari Ini
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                        alt="Karyawan Selfie" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 block">Budi Santoso</span>
                      <span className="text-[10px] text-slate-500 block">Kasir Shift Pagi (07:00 - 15:00)</span>
                      <span className="text-[10px] font-bold text-blue-600 block mt-0.5">Hadir Tepat Waktu (06:52)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                        alt="Karyawan Selfie" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 block">Sinta Lestari</span>
                      <span className="text-[10px] text-slate-500 block">Kasir Shift Siang (15:00 - 23:00)</span>
                      <span className="text-[10px] font-bold text-blue-600 block mt-0.5">Hadir Tepat Waktu (14:48)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. KEY OFFERINGS GRID (3 Columns Bottom) */}
      <section id="fitur-section" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Temukan Fitur Utama Sistem
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Nikmati rangkaian alat bertenaga tinggi yang dirancang khusus untuk mempermudah alur kerja operasional warkop Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Prioritas Transaksi Cepat</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memproses pesanan pelanggan saat jam sibuk warkop dengan cepat agar antrean tidak mengular.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Pencatatan Tanpa Ribet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua transaksi otomatis tersimpan rapi tanpa perlu kalkulasi manual di akhir jam kerja shift kasir.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Sinkronisasi Real-Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Data penjualan, sisa stok gudang, dan absensi terhubung langsung ke dasbor Owner detik itu juga.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer id="keunggulan-section" className="py-8 px-4 sm:px-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-[#1d4ed8]" />
            <span className="font-extrabold text-slate-900">Nusantara POS &copy; 2026</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sistem Kasir & Operasional Terpadu untuk Efisiensi Bisnis Warkop Modern.
          </p>
          <button 
            onClick={onGoToLogin}
            className="text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer"
          >
            Portal Masuk &rarr;
          </button>
        </div>
      </footer>

    </div>
  );
}
