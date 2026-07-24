/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Search, 
  Calendar, 
  Plus, 
  Filter, 
  Paperclip, 
  Trash2, 
  CheckCircle, 
  X,
  MessageSquare
} from "lucide-react";
import { User, CatatanHarian, KategoriCatatan } from "../types";

interface CatatanHarianTokoProps {
  currentUser: User;
  dailyLogs: CatatanHarian[];
  onAddLog: (newLog: CatatanHarian) => void;
  onDeleteLog: (id: string) => void;
}

export default function CatatanHarianToko({
  currentUser,
  dailyLogs,
  onAddLog,
  onDeleteLog
}: CatatanHarianTokoProps) {
  // Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [formKategori, setFormKategori] = useState<KategoriCatatan>("Operasional");
  const [formIsi, setFormIsi] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Dynamic lists of logs
  const filteredLogs = useMemo(() => {
    return dailyLogs.filter(log => {
      // Cashiers can read their own logs and other logs, owner can read all.
      // Filter by category
      const matchCat = selectedCategory === "Semua" || log.kategori === selectedCategory;
      // Filter by search query
      const matchSearch = log.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user_nama.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isOwner = currentUser.role === "owner";
      const isMyLog = log.user_id === currentUser.id;
      
      // Let cashiers see all operational/general store notes, but only delete their own!
      return matchCat && matchSearch && (isOwner || isMyLog || log.kategori === "Operasional");
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [dailyLogs, currentUser, selectedCategory, searchQuery]);

  // Handle attachment simulator
  const handleSimulateAttachment = () => {
    const mockImages = [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=300&q=80", // credit card terminal
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80"  // products in shelf
    ];
    // Attach card terminal if category is Operational or Finance, else products
    const img = (formKategori === "Operasional" || formKategori === "Keuangan") ? mockImages[0] : mockImages[1];
    setAttachedImage(img);
    alert("Simulator: Foto bukti pendukung berhasil dilampirkan!");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIsi.trim()) {
      alert("Isi catatan tidak boleh kosong!");
      return;
    }

    const newLog: CatatanHarian = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      user_id: currentUser.id,
      user_nama: currentUser.nama,
      tanggal: new Date().toISOString(),
      kategori: formKategori,
      isi: formIsi.trim(),
      lampiran: attachedImage || undefined
    };

    onAddLog(newLog);
    setFormIsi("");
    setAttachedImage(null);
    setShowFormModal(false);
    alert("Catatan harian operasional berhasil diterbitkan ke logbook toko.");
  };

  return (
    <div className="space-y-6" id="logbook-main">
      
      {/* Module Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Buku Catatan Harian Operasional (Logbook)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Mencatat kendala harian, keluhan pelanggan, dan laporan serah terima shift.</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setFormKategori("Operasional");
            setFormIsi("");
            setAttachedImage(null);
            setShowFormModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-indigo-100 flex items-center gap-1.5 focus:outline-none cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tulis Catatan Baru
        </button>
      </div>

      {/* Filter and Content Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Category filters (3 Cols) */}
        <div className="lg:col-span-3 space-y-3" id="logbook-filters">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Filter</span>
            
            <div className="flex flex-col space-y-1">
              {[
                { id: "Semua", label: "Semua Kategori" },
                { id: "Operasional", label: "Operasional" },
                { id: "Keuangan", label: "Keuangan" },
                { id: "Stok", label: "Stok & Gudang" },
                { id: "Lainnya", label: "Lainnya" }
              ].map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus:outline-none cursor-pointer ${
                    selectedCategory === cat.id 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' 
                    : 'bg-transparent hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-500 space-y-2">
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Aturan Visibilitas</p>
            <p className="text-[10px] leading-relaxed">
              - **Kasir** dapat menulis catatan operasional dan melihat catatan miliknya sendiri. <br />
              - **Owner** memiliki hak akses penuh untuk meninjau logbook seluruh karyawan demi keterbukaan keuangan dan operasional.
            </p>
          </div>
        </div>

        {/* Right Side: Feed (9 Cols) */}
        <div className="lg:col-span-9 space-y-4" id="logbook-feed">
          
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Cari catatan berdasarkan isi teks atau nama pelapor..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 shadow-sm"
            />
          </div>

          {/* Logs Stack */}
          {filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map(log => {
                const isMyLog = log.user_id === currentUser.id;
                const isOwner = currentUser.role === "owner";

                return (
                  <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors space-y-4 relative">
                    {/* Log Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                          {log.user_nama.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-800">{log.user_nama}</span>
                            <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{log.user_id}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {new Date(log.tanggal).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          log.kategori === "Operasional" ? 'bg-blue-50 text-blue-700' :
                          log.kategori === "Keuangan" ? 'bg-emerald-50 text-emerald-700' :
                          log.kategori === "Stok" ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {log.kategori}
                        </span>

                        {/* Delete option for Owner, or Cashier if it's their own log */}
                        {(isOwner || isMyLog) && (
                          <button 
                            onClick={() => {
                              if (confirm("Apakah Anda yakin ingin menghapus catatan harian ini?")) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Log Content body */}
                    <div className="space-y-3">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                        "{log.isi}"
                      </p>

                      {log.lampiran && (
                        <div className="max-w-sm rounded-lg overflow-hidden border border-slate-200 mt-2 shadow-sm">
                          <img 
                            src={log.lampiran} 
                            alt="Bukti Lampiran Operasional" 
                            className="w-full max-h-48 object-cover referrerPolicy='no-referrer'" 
                          />
                          <div className="bg-slate-50 px-3 py-1 text-[9px] text-slate-400 flex items-center gap-1">
                            <Paperclip className="w-3 h-3" /> Bukti Lampiran Visual Foto
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Buku Catatan Masih Kosong</p>
              <p className="text-xs text-slate-400 mt-1">Belum ada rincian catatan operasional atau serah terima shift harian.</p>
            </div>
          )}

        </div>

      </div>

      {/* FORM MODAL: WRITE NEW COMMENT */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white md:rounded-2xl rounded-none md:max-w-md w-full max-w-none min-h-screen md:min-h-0 p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-base font-bold text-slate-800">Tulis Catatan Logbook Baru</span>
              <button onClick={() => setShowFormModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block mb-1 text-slate-500 font-medium">Pilih Kategori Catatan *</label>
                <select 
                  value={formKategori}
                  onChange={e => setFormKategori(e.target.value as KategoriCatatan)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:bg-white cursor-pointer"
                >
                  <option value="Operasional">Operasional Toko</option>
                  <option value="Keuangan">Keuangan & Laporan Kas</option>
                  <option value="Stok">Masalah Stok & Bahan Baku</option>
                  <option value="Lainnya">Lainnya / Ide Masukan</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">Isi Deskripsi Catatan Harian *</label>
                <textarea 
                  rows={4}
                  placeholder="Ketik rincian kejadian, komplain pelanggan, serah terima jumlah kas kasir, kerusakan alat, atau restock..."
                  value={formIsi}
                  onChange={e => setFormIsi(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Simulated camera attachment */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Lampiran / Pendukung</label>
                <button 
                  type="button" 
                  onClick={handleSimulateAttachment}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs text-slate-600 font-bold flex items-center gap-1 shadow-sm transition-colors focus:outline-none cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500" /> Lampirkan Foto Kamera (Mock)
                </button>

                {attachedImage && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
                    <img src={attachedImage} alt="Simulated Attachment" className="w-12 h-12 object-cover rounded border referrerPolicy='no-referrer'" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Lampiran_Operasional.png</p>
                      <button 
                        type="button" 
                        onClick={() => setAttachedImage(null)}
                        className="text-[9px] text-red-500 hover:underline font-bold mt-1 block cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Terbitkan Catatan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
