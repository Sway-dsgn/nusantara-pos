import React from "react";
import {
  Store,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface LoginPageProps {
  loginUsername: string;
  setLoginUsername: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loginError: string;
  onLoginSubmit: (e: React.FormEvent) => void;
  onBackToLanding: () => void;
}

export function LoginPage({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  showPassword,
  setShowPassword,
  loginError,
  onLoginSubmit,
  onBackToLanding
}: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 font-sans antialiased flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Soft Background Accent Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-200/50 via-sky-100/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80 rounded-full text-xs font-bold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
            <Store className="w-4 h-4 text-white" />
          </span>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Nusantara POS
          </span>
        </div>
      </header>

      {/* Main Login Screen Body */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          
          {/* Header Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Masuk Operasional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-xs text-slate-500">
              Masukkan kredensial pengguna Anda untuk mengakses sistem kasir & dasbor.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" /> 
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Masukkan username..."
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Masukkan password..."
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none p-1"
                  title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Masuk Sesi Sekarang</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Kendala login? Hubungi Owner untuk reset atau ubah password akun Anda.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center text-xs text-slate-400">
        Nusantara POS &copy; 2026 &bull; Sistem Operasional Kasir, Stok & Keuangan
      </footer>

    </div>
  );
}
