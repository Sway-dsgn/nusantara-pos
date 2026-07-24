/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Percent, 
  Receipt, 
  CheckCircle, 
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Undo2,
  Lock,
  ArrowRight
} from "lucide-react";
import { User, Produk, Transaksi, DetailTransaksi, MetodeBayar, StatusTransaksi, StoreProfile } from "../types";

interface KasirPOSProps {
  currentUser: User;
  products: Produk[];
  transactions: Transaksi[];
  storeProfile?: StoreProfile;
  onAddTransaction: (newTx: Transaksi) => void;
  onUpdateProducts: (updatedProducts: Produk[]) => void;
  onLogStockMovement: (produkId: string, jenis: "masuk" | "keluar" | "penjualan" | "opname", qty: number, keterangan: string) => void;
}

interface CartItem {
  produk: Produk;
  qty: number;
}

export default function KasirPOS({
  currentUser,
  products,
  transactions,
  storeProfile,
  onAddTransaction,
  onUpdateProducts,
  onLogStockMovement
}: KasirPOSProps) {
  // POS States
  const todayStr = new Date().toISOString().split("T")[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [customerDomisili, setCustomerDomisili] = useState("");

  // Discount & Approvals
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalPassword, setApprovalPassword] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [tempDiscountToApply, setTempDiscountToApply] = useState<number | null>(null);

  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState<MetodeBayar>("tunai");
  const [cashAmountInput, setCashAmountInput] = useState<string>("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaksi | null>(null);

  // Return Transaction States
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<Transaksi | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Categories listing dynamically
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

  // 3. Add item to cart
  const addToCart = (product: Produk) => {
    if (product.stok <= 0) {
      alert(`Stok ${product.nama} habis! Silakan lakukan pengisian gudang.`);
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.produk.id === product.id);
      if (existing) {
        if (existing.qty >= product.stok) {
          alert(`Tidak dapat membeli melebihi stok yang tersedia (${product.stok} ${product.satuan})!`);
          return prev;
        }
        return prev.map(item => 
          item.produk.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { produk: product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.produk.id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.produk.stok) {
            alert(`Tidak dapat membeli melebihi stok yang tersedia (${item.produk.stok} ${item.produk.satuan})!`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.produk.id !== productId));
  };

  // Barcode quick adder simulator
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = barcodeQuery.trim();
    if (!cleanId) return;
    
    // Check if matching ID
    const product = products.find(p => p.id.toLowerCase() === cleanId.toLowerCase() || p.nama.toLowerCase() === cleanId.toLowerCase());
    if (product) {
      addToCart(product);
      setBarcodeQuery("");
    } else {
      alert(`Produk dengan ID/Nama "${cleanId}" tidak ditemukan.`);
    }
  };

  // 4. Cart Totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.produk.harga_jual * item.qty), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    const tot = cartSubtotal - appliedDiscount;
    return tot < 0 ? 0 : tot;
  }, [cartSubtotal, appliedDiscount]);

  // 5. Discount Approval logic
  const DISCOUNT_THRESHOLD = 15000; // Above 15,000 needs owner password "123"

  const applyDiscount = () => {
    const val = Number(discountInput);
    if (isNaN(val) || val < 0) {
      alert("Masukkan nilai diskon yang valid!");
      return;
    }

    if (val > cartSubtotal) {
      alert("Diskon tidak boleh melebihi nilai belanja!");
      return;
    }

    if (val > DISCOUNT_THRESHOLD) {
      // Needs owner approval
      setTempDiscountToApply(val);
      setShowApprovalModal(true);
      setApprovalPassword("");
      setApprovalError("");
    } else {
      setAppliedDiscount(val);
    }
  };

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvalPassword === "123") {
      if (tempDiscountToApply !== null) {
        setAppliedDiscount(tempDiscountToApply);
        setShowApprovalModal(false);
        setTempDiscountToApply(null);
      }
    } else {
      setApprovalError("Sandi Owner Salah! Hanya Owner yang dapat mengizinkan diskon besar.");
    }
  };

  // 6. Cash payment shortcut helpers
  const cashShortcuts = [10000, 20000, 50000, 100000];
  const calculatedChange = useMemo(() => {
    const cash = Number(cashAmountInput);
    if (isNaN(cash) || cash < cartTotal) return 0;
    return cash - cartTotal;
  }, [cashAmountInput, cartTotal]);

  // 7. Complete Checkout transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (paymentMethod === "tunai") {
      const cashVal = Number(cashAmountInput);
      if (isNaN(cashVal) || cashVal < cartTotal) {
        alert("Jumlah uang tunai yang dibayar kurang!");
        return;
      }
    }

    // Prepare transaction record
    const nextTxId = `TX-${Date.now().toString().slice(-4)}`;
    
    const detailItems: DetailTransaksi[] = cart.map(item => ({
      produk_id: item.produk.id,
      produk_nama: item.produk.nama,
      qty: item.qty,
      harga_saat_jual: item.produk.harga_jual,
      subtotal: item.produk.harga_jual * item.qty
    }));

    const newTransaction: Transaksi = {
      id: nextTxId,
      tanggal: new Date().toISOString(),
      kasir_id: currentUser.id,
      kasir_nama: currentUser.nama,
      total: cartTotal,
      diskon: appliedDiscount,
      metode_bayar: paymentMethod,
      status: "lunas",
      pelanggan_nama: customerName.trim() || undefined,
      pelanggan_wa: customerWa.trim() || undefined,
      pelanggan_domisili: customerDomisili.trim() || undefined,
      items: detailItems
    };

    // Server will deduct stock and log movement on transaction create
    onAddTransaction(newTransaction);
    
    // Setup receipt popup
    setCreatedTx(newTransaction);
    setCheckoutSuccess(true);
  };

  const handleResetPOS = () => {
    setCart([]);
    setDiscountInput(0);
    setAppliedDiscount(0);
    setCustomerName("");
    setCustomerWa("");
    setCustomerDomisili("");
    setPaymentMethod("tunai");
    setCashAmountInput("");
    setCheckoutSuccess(false);
    setCreatedTx(null);
  };

  // 8. Handle Refund/Retur submission
  const handleRequestRefund = (tx: Transaksi) => {
    setSelectedTxForRefund(tx);
    setRefundReason("");
    setRefundError("");
    setShowRefundModal(true);
  };

  const submitRefund = () => {
    if (!refundReason.trim()) {
      setRefundError("Alasan pembatalan/retur wajib diisi!");
      return;
    }

    if (!selectedTxForRefund) return;

    // Refund Logic:
    // Update transaction status to 'retur' and append retur_alasan
    const updatedTransactionsList = transactions.map(tx => {
      if (tx.id === selectedTxForRefund.id) {
        return { ...tx, status: "retur" as StatusTransaksi, retur_alasan: refundReason };
      }
      return tx;
    });

    // Restore stock back to products & log stock restoration
    const updatedProductsList = products.map(prod => {
      const returnedItem = selectedTxForRefund.items.find(it => it.produk_id === prod.id);
      if (returnedItem) {
        const restoredStok = prod.stok + returnedItem.qty;
        
        // Log stock movement
        onLogStockMovement(
          prod.id, 
          "masuk", 
          returnedItem.qty, 
          `Retur pengembalian transaksi ${selectedTxForRefund.id}. Alasan: ${refundReason}`
        );

        return { ...prod, stok: restoredStok };
      }
      return prod;
    });

    // Notify parent
    onUpdateProducts(updatedProductsList);
    // Since we're modifying transactions array directly in App state via callbacks, we'll pass it up
    // In our App.tsx we'll define robust handlers
    // To update transaction status in state, we'll implement state changes in App.tsx
    // Let's call callback or let App handled it
    (window as any)._updateTransactionStatus?.(selectedTxForRefund.id, "retur", refundReason);

    setShowRefundModal(false);
    setSelectedTxForRefund(null);
    setRefundReason("");
    alert("Transaksi berhasil dibatalkan dan stok dikembalikan ke gudang.");
  };

  // Filter daily transactions for login session
  const filteredMyTransactions = useMemo(() => {
    const todayString = todayStr;
    return transactions.filter(t => {
      const isToday = t.tanggal.split("T")[0] === todayString;
      // Cashiers can only view their own transactions, owner views all!
      const isOwner = currentUser.role === "owner";
      const isMyTx = t.kasir_id === currentUser.id;
      return isToday && (isOwner || isMyTx);
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [transactions, currentUser]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pos-main">
      
      {/* LEFT: Product catalog (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4" id="pos-catalog">
        
        {/* Search, Barcode & Filter Row */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search by text */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Cari produk berdasarkan nama atau ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
              />
            </div>

            {/* Simulated barcode scanner */}
            <form onSubmit={handleBarcodeSubmit} className="sm:w-56 flex gap-2">
              <input 
                type="text" 
                placeholder="ID Barcode..." 
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
              />
              <button 
                type="submit" 
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors focus:outline-none cursor-pointer ${
                  selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic product list Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1" id="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(prod => {
              const isLowStock = prod.stok <= prod.stok_minimum;
              const isOutOfStock = prod.stok <= 0;
              
              return (
                <div 
                  key={prod.id} 
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`p-3 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex flex-col justify-between group ${
                    isOutOfStock ? 'opacity-55 cursor-not-allowed border-rose-200 bg-rose-50/10' : 
                    isLowStock ? 'border-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">{prod.id}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        isOutOfStock ? 'bg-red-50 text-red-700' :
                        isLowStock ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        Stok: {prod.stok}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 mt-2 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-relaxed">
                      {prod.nama}
                    </h5>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] text-slate-400 font-medium">{prod.satuan}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-extrabold text-slate-800">{formatRupiah(prod.harga_jual)}</span>
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm font-semibold">Produk tidak ditemukan</p>
              <p className="text-xs mt-1">Gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          )}
        </div>

        {/* Receipt / Cancellations History Table */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="pos-history">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            {currentUser.role === "owner" ? "Semua Transaksi Hari Ini" : "Transaksi Saya Hari Ini"}
          </h4>

          {filteredMyTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-3">Waktu</th>
                    <th className="py-2 px-3">Kode TX</th>
                    {currentUser.role === "owner" && <th className="py-2 px-3">Kasir</th>}
                    <th className="py-2 px-3">Total</th>
                    <th className="py-2 px-3">Metode</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMyTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono">
                        {new Date(tx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-700">{tx.id}</td>
                      {currentUser.role === "owner" && (
                        <td className="py-2 px-3 text-slate-600">{tx.kasir_nama.split(" ")[0]}</td>
                      )}
                      <td className="py-2 px-3 font-semibold text-slate-800">{formatRupiah(tx.total)}</td>
                      <td className="py-2 px-3 uppercase text-[10px] font-bold text-slate-600">{tx.metode_bayar}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === "lunas" ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setCreatedTx(tx);
                            setCheckoutSuccess(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                          title="Lihat Struk"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        {tx.status === "lunas" && (
                          <button 
                            onClick={() => handleRequestRefund(tx)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Batalkan/Retur"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi tercatat hari ini.</p>
          )}
        </div>

      </div>

      {/* RIGHT: Cart & Checkout flow (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4" id="pos-checkout">
        
        {/* Cart Listing Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[480px] justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-800">Keranjang Belanja</h4>
              </div>
              <button 
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700 font-semibold focus:outline-none cursor-pointer"
              >
                Kosongkan
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[280px]">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.produk.id} className="flex items-center justify-between border-b border-slate-200/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.produk.nama}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatRupiah(item.produk.harga_jual)} / {item.produk.satuan}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateCartQty(item.produk.id, -1)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-6 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateCartQty(item.produk.id, 1)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.produk.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded ml-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-xs font-semibold">Keranjang belanja kosong</p>
                  <p className="text-[10px] text-slate-400 mt-1">Pilih barang dari katalog di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info (opsional) */}
          <div className="px-4 py-2 border-t border-slate-200 space-y-2">
            <input
              type="text"
              placeholder="Nama Pelanggan (opsional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="No. WA (opsional)"
                value={customerWa}
                onChange={e => setCustomerWa(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Domisili (opsional)"
                value={customerDomisili}
                onChange={e => setCustomerDomisili(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Pricing & Checkout Methods Form */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-4">
            
            {/* Discount Section */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                <input 
                  type="number" 
                  placeholder="Potongan Diskon (Rp)"
                  value={discountInput || ""}
                  onChange={e => setDiscountInput(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
              <button 
                onClick={applyDiscount}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Terapkan
              </button>
            </div>

            {/* Calculations summaries */}
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-indigo-600 font-medium">
                <span>Diskon Terpilih</span>
                <span>- {formatRupiah(appliedDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1.5 border-t border-slate-200">
                <span>TOTAL AKHIR</span>
                <span className="text-indigo-700 text-base">{formatRupiah(cartTotal)}</span>
              </div>
            </div>

            {/* Methods Tabs */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Metode Pembayaran</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: "tunai", icon: DollarSign, label: "Tunai" },
                  { key: "transfer", icon: ArrowRight, label: "Transfer" },
                  { key: "qris", icon: QrCode, label: "QRIS" },
                  { key: "kartu", icon: CreditCard, label: "Kartu" }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(item.key as MetodeBayar);
                        if (item.key !== "tunai") setCashAmountInput("");
                      }}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg border text-center focus:outline-none transition-all cursor-pointer ${
                        paymentMethod === item.key 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' 
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Paid input section */}
            {paymentMethod === "tunai" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uang Tunai Dibayar</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Contoh: 50000"
                    value={cashAmountInput}
                    onChange={e => setCashAmountInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setCashAmountInput(cartTotal.toString())}
                    className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Pas
                  </button>
                </div>

                {/* Quick cash shortcuts */}
                <div className="grid grid-cols-4 gap-1.5">
                  {cashShortcuts.map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => setCashAmountInput(val.toString())}
                      className="py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer"
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>

                {/* Change return calculations */}
                {Number(cashAmountInput) >= cartTotal && (
                  <div className="p-2.5 bg-indigo-50 text-indigo-800 rounded-lg flex justify-between items-center text-xs font-semibold border border-indigo-100">
                    <span>Uang Kembali:</span>
                    <span className="text-sm font-extrabold">{formatRupiah(calculatedChange)}</span>
                  </div>
                )}
              </div>
            )}

            {/* QRIS confirmation simulation */}
            {paymentMethod === "qris" && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2 animate-fade-in">
                <p className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Simulasi Dinamis QRIS Pembayaran
                </p>
                <p className="text-[9px] text-indigo-600">Pelanggan dapat melakukan scan barcode QRIS yang akan muncul di struk belanja setelah menekan tombol "Proses Transaksi".</p>
              </div>
            )}

            {/* Pay Button */}
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl text-center font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none ${
                cart.length > 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Proses Transaksi ({formatRupiah(cartTotal)})
            </button>

          </div>
        </div>

      </div>

      {/* 9. MODAL: OWNER approval for discounts above Rp 15.000 */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white md:rounded-2xl rounded-none md:max-w-md w-full max-w-none min-h-screen md:min-h-0 p-6 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-full">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Persetujuan Diskon Owner</h3>
                <p className="text-xs text-slate-400">Pengurangan harga di atas Rp 15.000 butuh otorisasi Owner.</p>
              </div>
            </div>

            <form onSubmit={handleApprovalSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal belanja:</span>
                  <span className="font-semibold">{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Permintaan diskon:</span>
                  <span className="font-bold">{formatRupiah(tempDiscountToApply || 0)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Masukkan Kata Sandi Owner</label>
                <input 
                  type="password" 
                  placeholder="Ketik Sandi Owner (Tip: 123)"
                  value={approvalPassword}
                  onChange={e => setApprovalPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {approvalError && (
                <p className="text-xs text-red-500 font-semibold">{approvalError}</p>
              )}

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowApprovalModal(false);
                    setTempDiscountToApply(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Setujui & Terapkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: REFUND/RETUR transaction reason */}
      {showRefundModal && selectedTxForRefund && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white md:rounded-2xl rounded-none md:max-w-md w-full max-w-none min-h-screen md:min-h-0 p-6 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <Undo2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Retur / Pembatalan Transaksi</h3>
                <p className="text-xs text-slate-400">Batalkan penjualan dan pulihkan stok barang.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Kode Transaksi:</span>
                <span className="font-bold text-slate-800">{selectedTxForRefund.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir Melayani:</span>
                <span>{selectedTxForRefund.kasir_nama}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Pengembalian:</span>
                <span className="font-bold text-red-600">{formatRupiah(selectedTxForRefund.total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Alasan Retur / Pembatalan <span className="text-red-500">* Wajib</span>
                </label>
                <textarea 
                  rows={3}
                  placeholder="Ketik alasan pembatalan secara detail..."
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {refundError && (
                <p className="text-xs text-red-500 font-semibold">{refundError}</p>
              )}

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedTxForRefund(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button 
                  onClick={submitRefund}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  Konfirmasi Retur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL: thermal print-out simulated checkout receipt */}
      {checkoutSuccess && createdTx && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white md:rounded-2xl rounded-none md:max-w-sm w-full max-w-none min-h-screen md:min-h-0 p-5 shadow-xl border border-slate-200 md:my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Transaksi Berhasil
              </span>
              <button onClick={handleResetPOS} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Slip Content */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-4 shadow-inner" id="receipt-print-area">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold tracking-wider">{storeProfile?.nama || "NUSANTARA POS"}</h2>
                <p className="text-[10px] text-slate-500">{storeProfile?.alamat || "Jl. Pembangunan No. 42, Kota Jakarta"}</p>
                <p className="text-[9px] text-slate-400">Telp: {storeProfile?.no_hp || "0812-3456-7890"}</p>
                {storeProfile?.no_wa && <p className="text-[9px] text-slate-400">WA: {storeProfile.no_wa}</p>}
              </div>

                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Kode TX:</span>
                    <span className="font-bold">{createdTx.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(createdTx.tanggal).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{createdTx.kasir_nama}</span>
                  </div>
                  {createdTx.pelanggan_nama && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span>{createdTx.pelanggan_nama}</span>
                    </div>
                  )}
                  {createdTx.pelanggan_wa && (
                    <div className="flex justify-between">
                      <span>WA:</span>
                      <span>{createdTx.pelanggan_wa}</span>
                    </div>
                  )}
                  {createdTx.pelanggan_domisili && (
                    <div className="flex justify-between">
                      <span>Domisili:</span>
                      <span>{createdTx.pelanggan_domisili}</span>
                    </div>
                  )}
                </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5">
                {createdTx.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-semibold">{item.produk_nama}</span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>{item.qty} x {formatRupiah(item.harga_saat_jual)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatRupiah(createdTx.items.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                </div>
                {createdTx.diskon > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span>DISKON:</span>
                    <span>- {formatRupiah(createdTx.diskon)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-solid border-slate-300 pt-1 text-slate-900">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(createdTx.total)}</span>
                </div>
                <div className="flex justify-between text-[9px] font-normal text-slate-500">
                  <span>Metode Bayar:</span>
                  <span className="uppercase">{createdTx.metode_bayar}</span>
                </div>
              </div>

              {createdTx.metode_bayar === "qris" && (
                <div className="border-t border-dashed border-slate-300 pt-3 flex flex-col items-center space-y-1.5 pb-1">
                  <span className="text-[9px] font-bold text-indigo-700 uppercase">Scan QRIS Dinamis</span>
                  {/* Real Dynamic QR code mockup */}
                  <div className="bg-white p-2 border border-slate-300 rounded shadow-sm flex flex-col items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-800" />
                    <span className="text-[7px] font-bold text-slate-400 tracking-widest mt-1">NMID-82931083912</span>
                  </div>
                </div>
              )}

              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
                <p>{storeProfile?.footer || "Terima kasih atas kunjungan Anda!"}</p>
                <p className="mt-0.5 text-[8px]">Struk ini sah dikeluarkan oleh sistem POS</p>
              </div>
            </div>

            {/* Print and share triggers */}
            <div className="mt-5 space-y-2">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <Receipt className="w-4 h-4" /> Cetak Thermal / PDF Struk
              </button>
              <button 
                onClick={() => {
                  alert("Mockup: Struk belanja berhasil dikirimkan ke WhatsApp pelanggan!");
                }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 focus:outline-none"
              >
                Share ke WhatsApp (Mock)
              </button>
              <button 
                onClick={handleResetPOS}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold focus:outline-none"
              >
                Mulai Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
