/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  RotateCcw,
  PlusCircle,
  FileText,
  Trash2,
  Lock
} from "lucide-react";
import { User, Produk, PergerakanStok, JenisPergerakan } from "../types";

interface GudangInventoryProps {
  currentUser: User;
  products: Produk[];
  stockMovements: PergerakanStok[];
  onAddProduct: (newProduct: Produk) => void;
  onUpdateProducts: (updatedProducts: Produk[]) => void;
  onAddStockMovement: (newMovement: PergerakanStok) => void;
}

export default function GudangInventory({
  currentUser,
  products,
  stockMovements,
  onAddProduct,
  onUpdateProducts,
  onAddStockMovement
}: GudangInventoryProps) {
  // Tabs: "daftar", "mutasi", "opname"
  const [activeTab, setActiveTab] = useState<"daftar" | "mutasi" | "opname">("daftar");
  
  // Search & Category
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Edit / Add Product states
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<"tambah" | "edit">("tambah");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Product Form states
  const [formNama, setFormNama] = useState("");
  const [formKategori, setFormKategori] = useState("");
  const [formSatuan, setFormSatuan] = useState("");
  const [formHargaBeli, setFormHargaBeli] = useState<number>(0);
  const [formHargaJual, setFormHargaJual] = useState<number>(0);
  const [formStok, setFormStok] = useState<number>(0);
  const [formStokMinimum, setFormStokMinimum] = useState<number>(10);

  // Stock Adjustments (In / Out) states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<"masuk" | "keluar">("masuk");
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Produk | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustError, setAdjustError] = useState("");

  // Stock Opname States
  const [opnamePhysicalCounts, setOpnamePhysicalCounts] = useState<Record<string, number>>({});
  const [opnameNotes, setOpnameNotes] = useState<Record<string, string>>({});

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Categories listing
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.kategori));
    return ["Semua", ...Array.from(list)];
  }, [products]);

  // 2. Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "Semua" || p.kategori === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Sort stock movements by date descending
  const sortedStockMovements = useMemo(() => {
    return [...stockMovements].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [stockMovements]);

  // 3. Form control handlers (Owner only)
  const openAddProductModal = () => {
    if (currentUser.role !== "owner") {
      alert("Hanya Owner yang dapat menambahkan produk baru.");
      return;
    }
    setModalMode("tambah");
    setEditingProductId(null);
    setFormNama("");
    setFormKategori("Minuman");
    setFormSatuan("Cup");
    setFormHargaBeli(0);
    setFormHargaJual(0);
    setFormStok(0);
    setFormStokMinimum(10);
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Produk) => {
    if (currentUser.role !== "owner") {
      alert("Akses Terbatas: Kasir hanya boleh melihat harga, tidak boleh mengubah.");
      return;
    }
    setModalMode("edit");
    setEditingProductId(prod.id);
    setFormNama(prod.nama);
    setFormKategori(prod.kategori);
    setFormSatuan(prod.satuan);
    setFormHargaBeli(prod.harga_beli);
    setFormHargaJual(prod.harga_jual);
    setFormStok(prod.stok);
    setFormStokMinimum(prod.stok_minimum);
    setShowProductModal(true);
  };

  const saveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKategori.trim() || !formSatuan.trim()) {
      alert("Harap lengkapi seluruh kolom formulir!");
      return;
    }

    if (formHargaJual <= 0 || formHargaBeli < 0) {
      alert("Harga jual dan harga beli harus valid!");
      return;
    }

    if (modalMode === "tambah") {
      const nextId = `prod-${products.length + 1}`;
      const newProduct: Produk = {
        id: nextId,
        nama: formNama,
        kategori: formKategori,
        satuan: formSatuan,
        harga_beli: formHargaBeli,
        harga_jual: formHargaJual,
        stok: formStok,
        stok_minimum: formStokMinimum
      };

      onAddProduct(newProduct);

      // Create stock movement if initial stock > 0
      if (formStok > 0) {
        const move: PergerakanStok = {
          id: `STK-${Date.now().toString().slice(-4)}`,
          produk_id: nextId,
          produk_nama: formNama,
          jenis: "masuk",
          jumlah: formStok,
          tanggal: new Date().toISOString(),
          oleh_user_id: currentUser.id,
          oleh_user_nama: currentUser.nama,
          keterangan: "Stok awal produk baru ditambahkan"
        };
        onAddStockMovement(move);
      }
    } else {
      // Edit mode
      if (!editingProductId) return;
      
      const updatedList = products.map(p => {
        if (p.id === editingProductId) {
          // Check if stock changes manually (only owner)
          const diff = formStok - p.stok;
          if (diff !== 0) {
            const move: PergerakanStok = {
              id: `STK-${Date.now().toString().slice(-4)}`,
              produk_id: p.id,
              produk_nama: formNama,
              jenis: diff > 0 ? "masuk" : "keluar",
              jumlah: diff,
              tanggal: new Date().toISOString(),
              oleh_user_id: currentUser.id,
              oleh_user_nama: currentUser.nama,
              keterangan: `Koreksi stok manual oleh owner: ${formStok} ${formSatuan}`
            };
            onAddStockMovement(move);
          }

          return {
            ...p,
            nama: formNama,
            kategori: formKategori,
            satuan: formSatuan,
            harga_beli: formHargaBeli,
            harga_jual: formHargaJual,
            stok: formStok,
            stok_minimum: formStokMinimum
          };
        }
        return p;
      });

      onUpdateProducts(updatedList);
    }

    setShowProductModal(false);
  };

  const deleteProduct = (id: string) => {
    if (currentUser.role !== "owner") {
      alert("Hanya Owner yang dapat menghapus produk dari database.");
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.")) {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
    }
  };

  // 4. Quick Stock Adjustment In / Out (both Kasir & Owner can do this!)
  const openAdjustModal = (product: Produk, type: "masuk" | "keluar") => {
    setAdjustType(type);
    setSelectedProductForAdjust(product);
    setAdjustQty(1);
    setAdjustNote("");
    setAdjustError("");
    setShowAdjustModal(true);
  };

  const saveAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    if (adjustQty <= 0) {
      setAdjustError("Jumlah barang harus minimal 1!");
      return;
    }

    if (adjustType === "keluar") {
      if (adjustQty > selectedProductForAdjust.stok) {
        setAdjustError(`Stok tidak mencukupi! Sisa stok saat ini hanya ${selectedProductForAdjust.stok} ${selectedProductForAdjust.satuan}.`);
        return;
      }
      if (!adjustNote.trim()) {
        setAdjustError("Alasan barang keluar wajib diisi! (misal: rusak, pecah, expired)");
        return;
      }
    }

    // Process Adjustment
    const finalQtyDelta = adjustType === "masuk" ? adjustQty : -adjustQty;
    const finalStok = selectedProductForAdjust.stok + finalQtyDelta;

    const updatedList = products.map(p => {
      if (p.id === selectedProductForAdjust.id) {
        return { ...p, stok: finalStok };
      }
      return p;
    });

    onUpdateProducts(updatedList);

    // Create movement entry
    const move: PergerakanStok = {
      id: `STK-${Date.now().toString().slice(-4)}`,
      produk_id: selectedProductForAdjust.id,
      produk_nama: selectedProductForAdjust.nama,
      jenis: adjustType as JenisPergerakan,
      jumlah: finalQtyDelta,
      tanggal: new Date().toISOString(),
      oleh_user_id: currentUser.id,
      oleh_user_nama: currentUser.nama,
      keterangan: adjustNote.trim() || (adjustType === "masuk" ? "Pengadaan restock barang masuk" : "Penyesuaian stok keluar")
    };
    onAddStockMovement(move);

    setShowAdjustModal(false);
    setSelectedProductForAdjust(null);
  };

  // 5. Stock Opname physical verification
  const handlePhysicalCountChange = (productId: string, val: string) => {
    const num = val === "" ? 0 : Number(val);
    setOpnamePhysicalCounts(prev => ({ ...prev, [productId]: num }));
  };

  const handleOpnameNoteChange = (productId: string, val: string) => {
    setOpnameNotes(prev => ({ ...prev, [productId]: val }));
  };

  const submitStockOpname = () => {
    // Only compile discrepancy for filled fields
    const productIdsWithInput = Object.keys(opnamePhysicalCounts);
    
    if (productIdsWithInput.length === 0) {
      alert("Harap masukkan minimal 1 nilai stok fisik yang dicocokkan!");
      return;
    }

    if (!confirm(`Sistem akan melakukan penyesuaian untuk ${productIdsWithInput.length} produk berdasarkan stok fisik yang Anda input. Lanjutkan?`)) {
      return;
    }

    const updatedList = products.map(p => {
      if (opnamePhysicalCounts[p.id] !== undefined) {
        const physical = opnamePhysicalCounts[p.id];
        const discrepancy = physical - p.stok;

        if (discrepancy !== 0) {
          // Log opname adjustment
          const move: PergerakanStok = {
            id: `STK-${Date.now().toString().slice(-4)}`,
            produk_id: p.id,
            produk_nama: p.nama,
            jenis: "opname",
            jumlah: discrepancy,
            tanggal: new Date().toISOString(),
            oleh_user_id: currentUser.id,
            oleh_user_nama: currentUser.nama,
            keterangan: opnameNotes[p.id]?.trim() || `Discrepancy penyesuaian opname fisik (${physical} vs ${p.stok})`
          };
          onAddStockMovement(move);
        }

        return { ...p, stok: physical };
      }
      return p;
    });

    onUpdateProducts(updatedList);
    setOpnamePhysicalCounts({});
    setOpnameNotes({});
    setActiveTab("daftar");
    alert("Proses Stock Opname berhasil diselesaikan! Pergerakan stok opname telah dicatat.");
  };

  return (
    <div className="space-y-6" id="gudang-main">
      
      {/* Tab Selectors & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Manajemen Gudang & Persediaan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pantau, restock, edit harga produk, dan lakukan stock opname</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          <button 
            onClick={() => setActiveTab("daftar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap focus:outline-none transition-colors cursor-pointer ${
              activeTab === "daftar" ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Daftar Produk
          </button>
          <button 
            onClick={() => setActiveTab("mutasi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap focus:outline-none transition-colors cursor-pointer ${
              activeTab === "mutasi" ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Kartu Stok (Mutasi)
          </button>
          <button 
            onClick={() => setActiveTab("opname")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap focus:outline-none transition-colors cursor-pointer ${
              activeTab === "opname" ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Stock Opname Fisik
          </button>
        </div>
      </div>

      {/* VIEW 1: DAFTAR PRODUK */}
      {activeTab === "daftar" && (
        <div className="space-y-4 animate-fade-in" id="inventory-list-view">
          
          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm justify-between">
            <div className="flex flex-1 gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Cari produk berdasarkan nama atau ID..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {currentUser.role === "owner" && (
              <button 
                onClick={openAddProductModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-indigo-100 flex items-center gap-1 focus:outline-none cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Tambah Produk Baru
              </button>
            )}
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4">Harga Beli</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">Stok</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Kelola Stok</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium">
                {filteredProducts.map(p => {
                  const isLow = p.stok <= p.stok_minimum;
                  const isOut = p.stok <= 0;
                  const isOwner = currentUser.role === "owner";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{p.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{p.nama}</div>
                        {isLow && (
                          <span className="text-[9px] text-amber-600 flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Stok di bawah minimum ({p.stok_minimum})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{p.satuan}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono">
                        {isOwner ? formatRupiah(p.harga_beli) : (
                          <span className="text-slate-300 font-sans italic text-[10px] flex items-center gap-0.5" title="Harga beli dirahasiakan untuk kasir">
                            <Lock className="w-3 h-3" /> Rahasia
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-mono font-bold">
                        {formatRupiah(p.harga_jual)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                        {p.stok}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max ${
                          isOut ? 'bg-rose-50 text-rose-700' :
                          isLow ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isOut ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Habis
                            </>
                          ) : isLow ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Menipis
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aman
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openAdjustModal(p, "masuk")}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Masuk
                          </button>
                          <button 
                            onClick={() => openAdjustModal(p, "keluar")}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors"
                          >
                            <Minus className="w-3 h-3" /> Keluar
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openEditProductModal(p)}
                            className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                            title={isOwner ? "Edit Produk & Harga" : "Hanya Lihat"}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {isOwner && (
                            <button 
                              onClick={() => deleteProduct(p.id)}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded border border-rose-100"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: KARTU STOK (MUTASI LEDGER) */}
      {activeTab === "mutasi" && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in" id="inventory-history-view">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Riwayat Pergerakan Stok (Kartu Stok)</h4>
            <span className="text-[10px] bg-slate-100 px-2.5 py-1 text-slate-500 font-bold rounded-lg flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Total {stockMovements.length} Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3">Tanggal / Jam</th>
                  <th className="py-2.5 px-3">Produk</th>
                  <th className="py-2.5 px-3">Jenis Mutasi</th>
                  <th className="py-2.5 px-3 text-center">Jumlah</th>
                  <th className="py-2.5 px-3">Petugas</th>
                  <th className="py-2.5 px-3">Alasan / Bukti Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium">
                {sortedStockMovements.map(move => (
                  <tr key={move.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {new Date(move.tanggal).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{move.produk_nama}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        move.jenis === "masuk" ? 'bg-emerald-50 text-emerald-700' :
                        move.jenis === "keluar" ? 'bg-rose-50 text-rose-700' :
                        move.jenis === "penjualan" ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {move.jenis}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-center font-bold font-mono ${
                      move.jumlah > 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {move.jumlah > 0 ? `+${move.jumlah}` : move.jumlah}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{move.oleh_user_nama}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate" title={move.keterangan}>
                      {move.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: STOCK OPNAME FISIK */}
      {activeTab === "opname" && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in" id="inventory-opname-view">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Pencocokan Stock Opname Berkala</h4>
            <p className="text-xs text-slate-400 mt-0.5">Input jumlah stok fisik yang benar-benar ada di toko untuk mendeteksi kehilangan/kelebihan barang otomatis.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="py-3 px-3">Nama Produk</th>
                  <th className="py-3 px-3">Stok Sistem</th>
                  <th className="py-3 px-3 w-40">Stok Fisik Real</th>
                  <th className="py-3 px-3">Selisih (Sistem vs Fisik)</th>
                  <th className="py-3 px-3">Keterangan Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium">
                {products.map(p => {
                  const physicalVal = opnamePhysicalCounts[p.id];
                  const systemStok = p.stok;
                  const discrepancy = physicalVal !== undefined ? physicalVal - systemStok : 0;

                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{p.nama}</div>
                        <span className="text-[9px] text-slate-400">{p.satuan} · {p.kategori}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700 font-mono">{systemStok}</td>
                      <td className="py-3 px-3">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Pencocokan..."
                          value={physicalVal === undefined ? "" : physicalVal}
                          onChange={e => handlePhysicalCountChange(p.id, e.target.value)}
                          className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {physicalVal === undefined ? (
                          <span className="text-slate-300">-</span>
                        ) : discrepancy === 0 ? (
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Cocok
                          </span>
                        ) : (
                          <span className={`font-bold ${discrepancy > 0 ? 'text-blue-600' : 'text-rose-500'}`}>
                            {discrepancy > 0 ? `Lebih (+${discrepancy})` : `Kurang (${discrepancy})`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <input 
                          type="text" 
                          placeholder="Tulis alasan selisih..."
                          value={opnameNotes[p.id] || ""}
                          onChange={e => handleOpnameNoteChange(p.id, e.target.value)}
                          className="w-full max-w-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 mt-4">
            <button 
              onClick={() => {
                setOpnamePhysicalCounts({});
                setOpnameNotes({});
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
            >
              Reset Kolom
            </button>
            <button 
              onClick={submitStockOpname}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
            >
              Simpan Stok Opname & Sesuaikan
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL: TAMBAH / EDIT PRODUK FORM */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <span className="text-base font-bold text-slate-800">
                {modalMode === "tambah" ? "Tambah Produk Baru ke Toko" : "Ubah Informasi Produk"}
              </span>
              <button onClick={() => setShowProductModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveProductSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block mb-1 text-slate-500 font-medium">Nama Produk *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Kopi Caramel Macchiato"
                    value={formNama}
                    onChange={e => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Kategori *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Minuman, Makanan, Bahan"
                    value={formKategori}
                    onChange={e => setFormKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Satuan Takaran *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Cup, Porsi, Kg, Liter"
                    value={formSatuan}
                    onChange={e => setFormSatuan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Harga Beli Modal (Rp) *</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={formHargaBeli || ""}
                    onChange={e => setFormHargaBeli(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Harga Jual Toko (Rp) *</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={formHargaJual || ""}
                    onChange={e => setFormHargaJual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Stok Saat Ini *</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={formStok}
                    onChange={e => setFormStok(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 font-medium">Stok Batas Minimum *</label>
                  <input 
                    type="number" 
                    placeholder="10"
                    value={formStokMinimum}
                    onChange={e => setFormStokMinimum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: QUICK STOCK ADJUSTMENT (IN / OUT) */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className={`flex items-center space-x-3 mb-4 ${
              adjustType === "masuk" ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              <div className={`p-2 rounded-full ${adjustType === "masuk" ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {adjustType === "masuk" ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {adjustType === "masuk" ? "Input Stok Masuk (Restock)" : "Input Stok Keluar (Bocor/Rusak)"}
                </h3>
                <p className="text-xs text-slate-400">Sesuaikan jumlah barang fisik gudang secara manual.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 mb-4 border border-slate-100">
              <div className="flex justify-between">
                <span>Nama Barang:</span>
                <span className="font-bold text-slate-800">{selectedProductForAdjust.nama}</span>
              </div>
              <div className="flex justify-between">
                <span>Stok Saat Ini:</span>
                <span className="font-bold">{selectedProductForAdjust.stok} {selectedProductForAdjust.satuan}</span>
              </div>
            </div>

            <form onSubmit={saveAdjustSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 font-medium">Jumlah Barang ({selectedProductForAdjust.satuan}) *</label>
                <input 
                  type="number" 
                  min="1"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-medium">
                  Keterangan / Alasan * {adjustType === "keluar" && <span className="text-rose-500">(Wajib)</span>}
                </label>
                <textarea 
                  rows={2}
                  placeholder={adjustType === "masuk" ? "Contoh: Kiriman dari Supplier Utama Gula..." : "Contoh: Botol bocor / cup meleleh..."}
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {adjustError && (
                <p className="text-xs text-red-500 font-semibold">{adjustError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedProductForAdjust(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-2 text-white rounded-lg font-bold cursor-pointer ${
                    adjustType === "masuk" ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Konfirmasi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Internal standard icon
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
