import React, { useState, useEffect, useCallback } from "react";
import {
  authApi,
  usersApi,
  productsApi,
  transactionsApi,
  stockMovementsApi,
  attendanceApi,
  dailyLogsApi,
  storeProfileApi,
  setToken,
  getToken,
} from "./api/client";
import { User, Produk, Transaksi, PergerakanStok, Absensi, CatatanHarian, StoreProfile } from "./types";

// Import custom modules
import DashboardOwner from "./components/DashboardOwner";
import DashboardKasir from "./components/DashboardKasir";
import KasirPOS from "./components/KasirPOS";
import GudangInventory from "./components/GudangInventory";
import AbsensiKaryawan from "./components/AbsensiKaryawan";
import CatatanHarianToko from "./components/CatatanHarianToko";
import LaporanKeuangan from "./components/LaporanKeuangan";
import KelolaAkun from "./components/KelolaAkun";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";

// Icon imports
import {
  Store,
  LayoutDashboard,
  Calculator,
  Package,
  Fingerprint,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  User as UserIcon,
  Shield,
  Bell,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // ─── Data States ──────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Produk[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [stockMovements, setStockMovements] = useState<PergerakanStok[]>([]);
  const [attendanceList, setAttendanceList] = useState<Absensi[]>([]);
  const [dailyLogs, setDailyLogs] = useState<CatatanHarian[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    nama: "NUSANTARA POS",
    alamat: "",
    no_hp: "",
    footer: "Terima kasih atas kunjungan Anda!",
  });

  // ─── Auth States ──────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true until initial auth check completes

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [landingScreen, setLandingScreen] = useState<"landing" | "login">("landing");
  const [activeView, setActiveView] = useState<string>("dashboard");

  // ─── Notifications ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<{ id: string; type: "low_stock" | "alert"; text: string }[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // ─── Data Fetching Functions ──────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      const [usersData, productsData, txData, stockData, absData, logsData, profileData] = await Promise.all([
        usersApi.list(),
        productsApi.list(),
        transactionsApi.list(),
        stockMovementsApi.list(),
        attendanceApi.list(),
        dailyLogsApi.list(),
        storeProfileApi.get(),
      ]);
      setUsers(usersData);
      setProducts(productsData);
      setTransactions(txData);
      setStockMovements(stockData);
      setAttendanceList(absData);
      setDailyLogs(logsData);
      setStoreProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  // ─── On mount: check existing token ──────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me()
        .then((res) => {
          setCurrentUser(res.user);
          return fetchAllData();
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchAllData]);

  // ─── Low-stock notifications (derived from products) ─────────────────
  useEffect(() => {
    const lowStock = products.filter(p => p.stok <= p.stok_minimum);
    const newAlerts = lowStock.map(p => ({
      id: `low-${p.id}`,
      type: "low_stock" as const,
      text: `Stok ${p.nama} menipis! Sisa ${p.stok} ${p.satuan} (Min ${p.stok_minimum})`
    }));
    setNotifications(newAlerts);
  }, [products]);

  // ─── Login Handler ───────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Harap masukkan username dan password!");
      return;
    }

    try {
      const { token, user } = await authApi.login(loginUsername.trim(), loginPassword);
      setToken(token);
      setCurrentUser(user);
      setActiveView("dashboard");
      setLoginUsername("");
      setLoginPassword("");
      setLoginError("");
      // Fetch all data after login
      await fetchAllData();
    } catch (err: any) {
      setLoginError(err.message || "Username atau Kata Sandi salah!");
    }
  };

  const triggerQuickLogin = (uname: string) => {
    setLoginUsername(uname);
    setLoginPassword("123");
    setLoginError("");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // ─── Global State Mutations (API + local update) ─────────────────────

  const handleAddTransaction = async (newTx: Transaksi) => {
    // newTx already has the server response (from KasirPOS which calls API)
    setTransactions(prev => [newTx, ...prev]);
    // Refresh products to get updated stock
    const freshProducts = await productsApi.list();
    setProducts(freshProducts);
  };

  const handleUpdateProducts = (updatedProducts: Produk[]) => {
    setProducts(updatedProducts);
  };

  const handleAddProduct = async (newProd: Produk) => {
    setProducts(prev => [...prev, newProd]);
  };

  const handleAddStockMovement = async (newMove: PergerakanStok) => {
    setStockMovements(prev => [newMove, ...prev]);
    // Refresh products to get updated stock
    const freshProducts = await productsApi.list();
    setProducts(freshProducts);
  };

  const handleAddAttendance = (newAbs: Absensi) => {
    setAttendanceList(prev => [newAbs, ...prev]);
  };

  const handleUpdateAttendance = (updatedList: Absensi[]) => {
    setAttendanceList(updatedList);
  };

  const handleAddLog = (newLog: CatatanHarian) => {
    setDailyLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await dailyLogsApi.remove(id);
      setDailyLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const handleAddUser = async (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && updatedUser.id === currentUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ─── UNAUTHENTICATED VIEW ────────────────────────────────────────────
  if (!currentUser) {
    if (landingScreen === "login") {
      return (
        <LoginPage
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loginError={loginError}
          onLoginSubmit={handleLoginSubmit}
          onBackToLanding={() => {
            setLandingScreen("landing");
            setLoginError("");
          }}
        />
      );
    }

    return (
      <LandingPage
        onGoToLogin={() => {
          setLandingScreen("login");
          setLoginError("");
        }}
      />
    );
  }

  // ─── AUTHENTICATED WORKSPACE ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row" id="app-workspace">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white text-slate-600 flex flex-col justify-between border-r border-slate-200 shadow-xs" id="sidebar-panel">
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shadow-indigo-200">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-800 text-sm tracking-wide leading-tight">NUSANTARA POS</h2>
              <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3 text-indigo-600" /> Sesi Operasional
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black uppercase border border-indigo-200">
              {currentUser.nama.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser.nama}</p>
              <span className={`inline-block text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                currentUser.role === "owner" ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5" id="navigation-links">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Modul Toko</p>

            {[
              { key: "dashboard", icon: LayoutDashboard, label: `Dashboard ${currentUser.role === "owner" ? "Owner" : "Kasir"}` },
              { key: "kasir", icon: Calculator, label: "Kasir (POS)" },
              { key: "gudang", icon: Package, label: "Gudang & Persediaan" },
              { key: "absensi", icon: Fingerprint, label: "Absensi Karyawan" },
              { key: "catat_harian", icon: FileText, label: "Catatan Harian" },
              { key: "laporan", icon: ClipboardList, label: "Laporan Laba Rugi" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                  activeView === key
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}

            {currentUser.role === "owner" && (
              <button
                onClick={() => setActiveView("settings")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                  activeView === "settings"
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan & Akun</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-indigo-700 font-extrabold text-xs uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
              Modul: {activeView.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 relative transition-colors focus:outline-none cursor-pointer"
                title="Notifikasi Stok & Alerts"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifDropdown && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifDropdown(false)}
                />
              )}

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-80 text-xs space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-800 text-xs">Pemberitahuan Sistem</span>
                      {notifications.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {notifications.length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 hover:bg-slate-100 rounded"
                    >
                      X
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => { setActiveView("gudang"); setShowNotifDropdown(false); }}
                          className="bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 p-2.5 rounded-xl cursor-pointer transition-all text-amber-900 flex items-start gap-2.5"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-xs leading-snug">{notif.text}</p>
                            <p className="text-[10px] text-amber-700 mt-1 font-bold underline flex items-center gap-1">
                              <span>Buka Stok Gudang</span> -
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-slate-600 font-medium text-xs">Semua stok aman</p>
                        <p className="text-[10px] text-slate-400">Tidak ada peringatan stok rendah saat ini.</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-center">
                      <button
                        onClick={() => { setActiveView("gudang"); setShowNotifDropdown(false); }}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Kelola Stok di Gudang
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Jam Sistem</p>
              <p className="text-xs font-extrabold text-slate-700 font-mono mt-0.5">
                {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} - {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {activeView === "dashboard" && (
            currentUser.role === "owner" ? (
              <DashboardOwner
                transactions={transactions}
                products={products}
                attendance={attendanceList}
                dailyLogs={dailyLogs}
                onNavigate={setActiveView}
              />
            ) : (
              <DashboardKasir
                currentUser={currentUser}
                transactions={transactions}
                attendance={attendanceList}
                dailyLogs={dailyLogs}
                onNavigate={setActiveView}
              />
            )
          )}

          {activeView === "kasir" && (
            <KasirPOS
              currentUser={currentUser}
              products={products}
              transactions={transactions}
              storeProfile={storeProfile}
              onAddTransaction={handleAddTransaction}
              onUpdateProducts={handleUpdateProducts}
              onLogStockMovement={handleAddStockMovement}
            />
          )}

          {activeView === "gudang" && (
            <GudangInventory
              currentUser={currentUser}
              products={products}
              stockMovements={stockMovements}
              onAddProduct={handleAddProduct}
              onUpdateProducts={handleUpdateProducts}
              onAddStockMovement={handleAddStockMovement}
            />
          )}

          {activeView === "absensi" && (
            <AbsensiKaryawan
              currentUser={currentUser}
              users={users}
              attendanceList={attendanceList}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
            />
          )}

          {activeView === "catat_harian" && (
            <CatatanHarianToko
              currentUser={currentUser}
              dailyLogs={dailyLogs}
              onAddLog={handleAddLog}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {activeView === "laporan" && (
            <LaporanKeuangan
              currentUser={currentUser}
              users={users}
              products={products}
              transactions={transactions}
              stockMovements={stockMovements}
              attendanceList={attendanceList}
            />
          )}

          {activeView === "settings" && currentUser.role === "owner" && (
            <KelolaAkun
              currentUser={currentUser}
              users={users}
              storeProfile={storeProfile}
              onUpdateStoreProfile={setStoreProfile}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4" id="logout-confirm-modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <span className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <LogOut className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-800">Keluar dari Sesi?</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari aplikasi kasir? Sesi operasional Anda saat ini akan diakhiri.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setToken(null);
                  setCurrentUser(null);
                  setActiveView("dashboard");
                  setShowLogoutModal(false);
                  // Clear all data
                  setUsers([]);
                  setProducts([]);
                  setTransactions([]);
                  setStockMovements([]);
                  setAttendanceList([]);
                  setDailyLogs([]);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-rose-100 cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
