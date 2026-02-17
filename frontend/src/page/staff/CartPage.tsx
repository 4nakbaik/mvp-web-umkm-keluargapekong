import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../service/api';
import { useCartStore } from '../../hooks/useCartStore';
import { useToastStore } from '../../hooks/useToastStore';
import ReceiptModal from '../../components/ReceiptModal';
import RandomQR from '../../components/RandomQR';

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer type: 'member' or 'walkin'
  const [customerType, setCustomerType] = useState<'member' | 'walkin'>('walkin');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Walk-in customer form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Payment Type
  const [paymentType, setPaymentType] = useState('CASH');
  const PAYMENT_METHODS = ['CASH', 'QRIS', 'GOPAY', 'DANA', 'TRANSFER'];

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // QRIS Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.getCustomer();
        setMembers(res.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
        customerId = selectedMemberId;
      } else {
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

      const orderRes = await api.createOrder({
        customerId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentType,
      });

      if (orderRes.data?.id) {
        setCreatedOrderId(orderRes.data.id);
      } else if (orderRes.data?.code) {
        setCreatedOrderId(orderRes.data.id);
      } else if (orderRes.data?.data?.id) {
        setCreatedOrderId(orderRes.data.data.id);
      }

      setLastOrderTotal(getTotal());
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedMemberId('');
      setPaymentType('CASH');

      setOrderSuccess(true);
      setOrderSuccess(true);

      if (paymentType === 'QRIS') {
        setShowQRModal(true);
      } else {
        setShowReceiptModal(true);
      }

      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Keranjang</h1>
          <p className="text-slate-500 mt-1">Selesaikan pesanan pelanggan</p>
        </div>
        <button
          onClick={() => navigate('/staff/products')}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div className="bg-white rounded shadow-sm p-6 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Item Pesanan</h2>
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
              <button
                onClick={() => navigate('/staff/products')}
                className="mt-4 text-[#5c4033] font-medium hover:underline"
              >
                Tambah Produk
              </button>
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
                      className="w-8 h-8 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center transition-colors"
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
                      className="w-8 h-8 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total</span>
                <span className="text-2xl font-bold text-[#5c4033]">{formatPrice(getTotal())}</span>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded shadow-sm p-6 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Data Pelanggan & Pembayaran</h2>

          <div className="space-y-6">
            {/* Customer Type Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Tipe Pelanggan</label>
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
            </div>

            {/* Member Search / Walk-in Form */}
            {customerType === 'member' ? (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cari Member <span className="text-red-500">*</span>
                </label>
                {selectedMemberId ? (
                  (() => {
                    const selected = members.find((m) => m.id === selectedMemberId);
                    return selected ? (
                      <div className="flex items-center justify-between p-3 bg-[#efeceb] border border-[#cec6c2] rounded">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{selected.name}</p>
                          <div className="flex gap-2 text-xs text-slate-500">
                            {selected.phone && <span>📱 {selected.phone}</span>}
                            {selected.email && <span>✉️ {selected.email}</span>}
                          </div>
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
                        placeholder="Cari nama, no. hp, atau email..."
                        className="w-full pl-9 pr-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] outline-none"
                      />
                    </div>
                    {showMemberDropdown && (
                      <>
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
                                  Tidak ditemukan
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
                                <div className="flex gap-2 text-xs text-slate-500">
                                  {m.phone && <span>{m.phone}</span>}
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
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] outline-none"
                    placeholder="Nama pelanggan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      No. HP <span className="text-slate-400">(opsional)</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] outline-none"
                      placeholder="08..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email <span className="text-slate-400">(opsional)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#cec6c2] rounded text-sm focus:ring-2 focus:ring-[#8d7970] outline-none"
                      placeholder="email@..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentType(method)}
                    className={`px-2 py-2 rounded text-xs font-medium transition-colors border ${
                      paymentType === method
                        ? 'bg-[#5c4033] text-white border-[#5c4033]'
                        : 'bg-white text-slate-600 border-[#cec6c2] hover:bg-[#efeceb]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={
                items.length === 0 ||
                submitting ||
                (customerType === 'walkin' && !customerName.trim()) ||
                (customerType === 'member' && !selectedMemberId)
              }
              className="w-full py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5c4033]/25"
            >
              {submitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && createdOrderId && (
        <ReceiptModal
          orderId={createdOrderId}
          onClose={() => {
            setShowReceiptModal(false);
            setCreatedOrderId(null);
          }}
        />
      )}

      {/* QRIS Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Scan QRIS</h3>
            <p className="text-slate-500 mb-6 text-center text-sm">
              Scan kode QR di bawah untuk melakukan pembayaran
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-100 mb-6">
              <RandomQR size={200} color="#000000" />
            </div>

            <p className="font-semibold text-lg text-[#5c4033] mb-6 text-center">
              Total: {formatPrice(lastOrderTotal)}
              <br />
              <span className="text-sm font-normal text-slate-500">Silakan Lakukan Pembayaran</span>
            </p>

            <button
              onClick={() => {
                setShowQRModal(false);
                setShowReceiptModal(true);
              }}
              className="w-full py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-all duration-200"
            >
              Selesai / Cek Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
