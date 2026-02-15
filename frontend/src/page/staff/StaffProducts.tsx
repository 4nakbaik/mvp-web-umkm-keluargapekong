import { useState, useEffect } from 'react';
import { api } from '../../service/api';
import { useCartStore } from '../../hooks/useCartStore';
import { useToastStore } from '../../hooks/useToastStore';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export default function StaffProducts() {
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Customer type: 'member' or 'walkin'
  const [customerType, setCustomerType] = useState<'member' | 'walkin'>('walkin');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Walk-in customer form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.getProducts(),
          api.getCustomer(),
        ]);
        setProducts(productsRes.data || []);
        setMembers(customersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateOrder = async () => {
    if (customerType === 'walkin' && !customerName.trim()) {
      setError('Nama pelanggan wajib diisi');
      return;
    }
    if (customerType === 'member' && !selectedMemberId) {
      setError('Pilih member terlebih dahulu');
      return;
    }
    if (items.length === 0) {
      setError('Keranjang kosong');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let customerId: string;

      if (customerType === 'member') {
        // Use existing member ID
        customerId = selectedMemberId;
      } else {
        // Create walk-in customer (isMember defaults to false)
        const customerRes = await api.createCustomer({
          name: customerName.trim(),
          phone: customerPhone.trim() || undefined,
          email: customerEmail.trim() || undefined,
        });

        if (!customerRes.data?.id) {
          throw new Error('Gagal membuat data pelanggan');
        }
        customerId = customerRes.data.id;
      }

      // Create order
      await api.createOrder({
        customerId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Reset form
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedMemberId('');
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
      setShowCart(false);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      MAKANAN: 'bg-orange-100 text-orange-700',
      MINUMAN: 'bg-blue-100 text-blue-700',
      SNACK: 'bg-purple-100 text-purple-700',
      JASA: 'bg-green-100 text-green-700',
      LAINNYA: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.LAINNYA;
  };

  const CATEGORIES = [
    { value: 'all', label: 'Semua' },
    { value: 'MAKANAN', label: 'Makanan' },
    { value: 'MINUMAN', label: 'Minuman' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'JASA', label: 'Jasa' },
    { value: 'LAINNYA', label: 'Lainnya' },
  ];

  const filteredProducts = products.filter(
    (product) => categoryFilter === 'all' || product.category === categoryFilter
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Produk</h1>
          <p className="text-slate-500 mt-1">Pilih produk untuk membuat pesanan</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 px-6 py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-all duration-200 shadow-lg shadow-[#5c4033]/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Keranjang
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="mb-6 p-4 bg-[#ded9d6] border border-[#beb3ad] rounded text-[#5c4033] flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Pesanan berhasil dibuat!
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
              categoryFilter === cat.value
                ? 'bg-[#5c4033] text-white shadow-lg shadow-[#5c4033]/25'
                : 'bg-white text-[#6c5347] hover:bg-[#efeceb] border border-[#cec6c2]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded p-4 shadow-sm animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-slate-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-slate-500">Tidak ada produk dalam kategori ini</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(product.category)}`}
                    >
                      {product.category}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#5c4033]">{formatPrice(product.price)}</p>
                    <button
                      onClick={() => {
                        const success = addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          stock: product.stock,
                        });
                        if (!success) {
                          addToast('Stok tidak mencukupi', 'error');
                        }
                      }}
                      className="p-2 bg-[#ded9d6] text-[#5c4033] rounded hover:bg-[#cec6c2] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Stok: {product.stock}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Keranjang</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-slate-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-slate-500">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded"
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-slate-200 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.product.name}</p>
                        <p className="text-sm text-[#5c4033]">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const success = updateQuantity(item.productId, item.quantity + 1);
                            if (!success) {
                              addToast('Stok tidak mencukupi', 'error');
                            }
                          }}
                          className="w-8 h-8 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 space-y-4">
              {/* Customer Type Toggle */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Data Pelanggan</h3>
                <div className="flex rounded border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('member');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      customerType === 'member'
                        ? 'bg-[#5c4033] text-white'
                        : 'bg-white text-[#6c5347] hover:bg-[#efeceb]'
                    }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('walkin');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      customerType === 'walkin'
                        ? 'bg-[#5c4033] text-white'
                        : 'bg-white text-[#6c5347] hover:bg-[#efeceb]'
                    }`}
                  >
                    Walk-in
                  </button>
                </div>

                {/* Member Dropdown */}
                {customerType === 'member' ? (
                  <div className="relative">
                    <label className="block text-xs text-slate-500 mb-1">
                      Cari Member <span className="text-red-500">*</span>
                    </label>
                    {selectedMemberId ? (
                      // Selected member card
                      (() => {
                        const selected = members.find((m) => m.id === selectedMemberId);
                        return selected ? (
                          <div className="flex items-center justify-between p-3 bg-[#efeceb] border border-[#cec6c2] rounded">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{selected.name}</p>
                              {selected.phone && (
                                <p className="text-xs text-slate-500">📱 {selected.phone}</p>
                              )}
                              {selected.email && (
                                <p className="text-xs text-slate-500">✉️ {selected.email}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMemberId('');
                                setMemberSearch('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      // Search input + dropdown
                      <>
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            value={memberSearch}
                            onChange={(e) => {
                              setMemberSearch(e.target.value);
                              setShowMemberDropdown(true);
                            }}
                            onFocus={() => setShowMemberDropdown(true)}
                            placeholder="Ketik nama, telepon, atau email..."
                            className="w-full pl-9 pr-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] focus:border-[#8d7970] outline-none"
                          />
                        </div>

                        {showMemberDropdown && (
                          <>
                            {/* Backdrop to close dropdown */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMemberDropdown(false)}
                            />
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#cec6c2] rounded shadow-lg max-h-48 overflow-auto z-20">
                              {(() => {
                                const q = memberSearch.toLowerCase();
                                const filtered = members.filter(
                                  (m) =>
                                    m.name.toLowerCase().includes(q) ||
                                    (m.phone && m.phone.toLowerCase().includes(q)) ||
                                    (m.email && m.email.toLowerCase().includes(q))
                                );
                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-3 text-sm text-slate-400 text-center">
                                      {members.length === 0
                                        ? 'Belum ada member terdaftar'
                                        : 'Member tidak ditemukan'}
                                    </div>
                                  );
                                }
                                return filtered.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMemberId(m.id);
                                      setMemberSearch('');
                                      setShowMemberDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 hover:bg-[#efeceb] transition-colors border-b border-slate-100 last:border-b-0"
                                  >
                                    <p className="font-medium text-slate-800 text-sm">{m.name}</p>
                                    <div className="flex gap-3 mt-0.5">
                                      {m.phone && (
                                        <span className="text-xs text-slate-500">📱 {m.phone}</span>
                                      )}
                                      {m.email && (
                                        <span className="text-xs text-slate-500">✉️ {m.email}</span>
                                      )}
                                    </div>
                                  </button>
                                ));
                              })()}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Walk-in Customer Form */
                  <>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Nama <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nama pelanggan"
                        className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] focus:border-[#8d7970] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        No. HP <span className="text-slate-400">(opsional)</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] focus:border-[#8d7970] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Email <span className="text-slate-400">(opsional)</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] focus:border-[#8d7970] outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-600">Total:</span>
                <span className="text-xl font-bold text-slate-800">{formatPrice(getTotal())}</span>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={
                  items.length === 0 ||
                  submitting ||
                  (customerType === 'walkin' && !customerName.trim()) ||
                  (customerType === 'member' && !selectedMemberId)
                }
                className="w-full py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
