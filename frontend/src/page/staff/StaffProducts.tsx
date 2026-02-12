import { useState, useEffect } from 'react';
import { api } from '../../service/api';
import { useCartStore } from '../../hooks/useCartStore';

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
          className="relative flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
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
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-xl text-blue-700 flex items-center gap-3">
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
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              categoryFilter === cat.value
                ? 'bg-linear-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded-xl mb-4"></div>
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
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
                    <p className="font-bold text-blue-600">{formatPrice(product.price)}</p>
                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                        })
                      }
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
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
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
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
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
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
                        <p className="text-sm text-blue-600">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('member');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      customerType === 'member'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
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
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Walk-in
                  </button>
                </div>

                {/* Member Dropdown */}
                {customerType === 'member' ? (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Pilih Member <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Pilih member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {m.phone ? ` (${m.phone})` : ''}
                        </option>
                      ))}
                    </select>
                    {members.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">Belum ada member terdaftar</p>
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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
                className="w-full py-3 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
