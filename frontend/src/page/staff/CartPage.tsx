import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../service/api';
import { useCartStore } from '../../hooks/useCartStore';
import { useToastStore } from '../../hooks/useToastStore';
import ReceiptModal from '../../components/ReceiptModal';

// Bank logos
import LogoSeabank from '../../assets/seabank.webp';
import LogoBCA from '../../assets/bca.webp';
import LogoMandiri from '../../assets/mandiri.webp';
import LogoBNI from '../../assets/bni.webp';
import LogoBRI from '../../assets/bri.webp';
import LogoBSI from '../../assets/bsi.webp';
import LogoPermata from '../../assets/permata.png';
import LogoCIMB from '../../assets/Cimb niaga.png';

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface Voucher {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  quota: number | null;
  usageCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
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
  const PAYMENT_METHODS = ['CASH', 'QRIS', 'GOPAY', 'DANA', 'MBanking'];

  // MBanking bank selection
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const BANK_LIST = [
    { id: 'seabank', name: 'SeaBank', color: '#00A5CF', logo: LogoSeabank },
    { id: 'bca', name: 'Bank BCA', color: '#003D79', logo: LogoBCA },
    { id: 'mandiri', name: 'Bank Mandiri', color: '#003366', logo: LogoMandiri },
    { id: 'bni', name: 'Bank BNI', color: '#F15A22', logo: LogoBNI },
    { id: 'bri', name: 'Bank BRI', color: '#00529C', logo: LogoBRI },
    { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', color: '#00A99D', logo: LogoBSI },
    { id: 'permata', name: 'Bank Permata', color: '#005BAA', logo: LogoPermata },
    { id: 'cimb', name: 'Bank CIMB Niaga', color: '#7B1B2D', logo: LogoCIMB },
    { id: 'lainnya', name: 'Bank Lainnya', color: '#8B7355', logo: null },
  ];

  // Voucher
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>('');

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // QRIS Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [orderQrCode, setOrderQrCode] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersRes = await api.getCustomer();
        setMembers(membersRes.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }

      try {
        const vouchersRes = await api.getVouchers();
        console.log('Vouchers response:', vouchersRes);
        setVouchers(vouchersRes.data || []);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate discount preview for a voucher
  const getDiscountPreview = (voucher: Voucher) => {
    const total = getTotal();
    let discount = 0;
    if (voucher.type === 'FIXED') {
      discount = Number(voucher.value);
    } else {
      discount = total * (Number(voucher.value) / 100);
      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    }
    if (discount > total) discount = total;
    return discount;
  };

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

      // Build payment type string (append bank name for MBanking)
      const finalPaymentType =
        paymentType === 'MBanking' && selectedBank ? `MBanking - ${selectedBank}` : paymentType;

      const orderPayload: any = {
        customerId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentType: finalPaymentType,
      };
      if (selectedVoucherCode) {
        orderPayload.voucherCode = selectedVoucherCode;
      }
      const orderRes = await api.createOrder(orderPayload);

      if (orderRes.data?.id) {
        setCreatedOrderId(orderRes.data.id);
        if (orderRes.data.qrCode) setOrderQrCode(orderRes.data.qrCode);
      } else if (orderRes.data?.code) {
        setCreatedOrderId(orderRes.data.id);
        if (orderRes.data.qrCode) setOrderQrCode(orderRes.data.qrCode);
      } else if (orderRes.data?.data?.id) {
        setCreatedOrderId(orderRes.data.data.id);
        if (orderRes.data.data.qrCode) setOrderQrCode(orderRes.data.data.qrCode);
      }

      // Use backend's totalAmount (includes discount & tax) for QRIS display
      const responseData = orderRes.data?.data || orderRes.data;
      setLastOrderTotal(Number(responseData?.totalAmount) || getTotal());
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedMemberId('');
      setPaymentType('CASH');
      setSelectedBank('');
      setSelectedVoucherCode('');

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
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart items skeleton */}
          <div className="bg-white rounded shadow-sm p-6">
            <div className="h-6 w-36 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded animate-pulse"
                >
                  <div className="w-16 h-16 bg-slate-200 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded" />
                    <div className="w-8 h-6 bg-slate-200 rounded" />
                    <div className="w-8 h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
                  <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout form skeleton */}
          <div className="bg-white rounded shadow-sm p-6">
            <div className="h-6 w-52 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="space-y-6">
              {/* Customer type toggle */}
              <div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="flex rounded overflow-hidden">
                  <div className="flex-1 h-10 bg-slate-200 animate-pulse" />
                  <div className="flex-1 h-10 bg-slate-100 animate-pulse" />
                </div>
              </div>
              {/* Name field */}
              <div>
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
              </div>
              {/* Payment methods */}
              <div>
                <div className="h-4 w-36 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-9 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              {/* Submit button */}
              <div className="h-12 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                {(() => {
                  const subtotal = getTotal();
                  const selectedV = vouchers.find((v) => v.code === selectedVoucherCode);
                  let discount = 0;
                  if (selectedV) {
                    discount = getDiscountPreview(selectedV);
                  }
                  const taxable = subtotal - discount;
                  const tax = Math.round(taxable * 0.11);
                  const grandTotal = taxable + tax;

                  return (
                    <>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Diskon ({selectedV?.code})</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>PPN 11%</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-slate-600 font-medium">Total</span>
                        <span className="text-2xl font-bold text-[#5c4033]">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>
                    </>
                  );
                })()}
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
                            {selected.phone && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {selected.phone}
                              </span>
                            )}
                            {selected.email && (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {selected.email}
                              </span>
                            )}
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
                    onClick={() => {
                      setPaymentType(method);
                      if (method !== 'MBanking') {
                        setSelectedBank('');
                        setShowBankDropdown(false);
                      } else {
                        setShowBankDropdown(true);
                      }
                    }}
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

              {/* MBanking Bank Selection Dropdown */}
              {paymentType === 'MBanking' && (
                <div
                  className="mt-3 border border-[#cec6c2] rounded-lg overflow-hidden"
                  style={{ animation: 'slideDown 0.25s ease-out' }}
                >
                  {/* Dropdown Header */}
                  <button
                    type="button"
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#5c4033] to-[#7a5a4a] text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
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
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">Mobile Banking</p>
                        <p className="text-xs text-white/70">
                          {selectedBank || 'Pilih bank tujuan'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBank && (
                        <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${showBankDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Bank List */}
                  {showBankDropdown && (
                    <div className="bg-white divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {BANK_LIST.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank.name);
                            setShowBankDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-150 hover:bg-[#faf8f7] ${
                            selectedBank === bank.name ? 'bg-[#efeceb]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {bank.logo ? (
                              <img
                                src={bank.logo}
                                alt={bank.name}
                                className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-100 p-1"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-100">
                                <svg
                                  className="w-5 h-5 text-[#8B7355]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 21v-2m0 0V9m0 10H7a2 2 0 01-2-2v-5h14v5a2 2 0 01-2 2h-5zM3 9h18M12 3l9 6H3l9-6z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="text-left">
                              <p className="text-sm font-medium text-slate-800">{bank.name}</p>
                              {bank.id === 'lainnya' && (
                                <p className="text-xs text-slate-400">
                                  Menerima transfer dari semua bank.
                                </p>
                              )}
                            </div>
                          </div>
                          {selectedBank === bank.name && (
                            <svg
                              className="w-5 h-5 text-[#5c4033]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keyframe animation for dropdown */}
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  max-height: 0;
                  transform: translateY(-8px);
                }
                to {
                  opacity: 1;
                  max-height: 500px;
                  transform: translateY(0);
                }
              }
            `}</style>

            {/* Voucher Selection */}
            {items.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Voucher Diskon
                </label>
                {vouchers.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-400 text-center">
                    Tidak ada voucher yang tersedia
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {/* Option: No voucher */}
                    <button
                      type="button"
                      onClick={() => setSelectedVoucherCode('')}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        !selectedVoucherCode
                          ? 'border-[#5c4033] bg-[#efeceb]'
                          : 'border-[#cec6c2] bg-white hover:bg-[#efeceb]'
                      }`}
                    >
                      <span className="text-sm text-slate-600">Tanpa Voucher</span>
                    </button>
                    {/* Voucher cards with status */}
                    {vouchers.map((v) => {
                      const now = new Date();
                      const isExpired = v.endDate && new Date(v.endDate) < now;
                      const isUpcoming = v.startDate && new Date(v.startDate) > now;
                      const isQuotaExhausted = v.quota !== null && v.usageCount >= v.quota;
                      const isInactive = !v.isActive;
                      const isUsable =
                        !isExpired && !isUpcoming && !isQuotaExhausted && !isInactive;

                      const discount = getDiscountPreview(v);
                      const isSelected = selectedVoucherCode === v.code;

                      // Determine status label and colors
                      let statusLabel = '';
                      let statusClass = '';
                      if (isInactive) {
                        statusLabel = 'Tidak Aktif';
                        statusClass = 'bg-slate-100 text-slate-500';
                      } else if (isExpired) {
                        statusLabel = 'Kadaluarsa';
                        statusClass = 'bg-red-50 text-red-500';
                      } else if (isUpcoming) {
                        statusLabel = 'Belum Aktif';
                        statusClass = 'bg-blue-50 text-blue-500';
                      } else if (isQuotaExhausted) {
                        statusLabel = 'Kuota Habis';
                        statusClass = 'bg-slate-100 text-slate-500';
                      } else {
                        statusLabel = 'Aktif';
                        statusClass = 'bg-green-50 text-green-600';
                      }

                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!isUsable}
                          onClick={() => {
                            if (isUsable) setSelectedVoucherCode(isSelected ? '' : v.code);
                          }}
                          className={`w-full text-left p-3 rounded border transition-all duration-200 ${
                            !isUsable
                              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'border-[#5c4033] bg-[#efeceb] shadow-sm'
                                : 'border-[#cec6c2] bg-white hover:bg-[#efeceb]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  !isUsable
                                    ? 'bg-slate-200 text-slate-400'
                                    : isSelected
                                      ? 'bg-[#5c4033] text-white'
                                      : 'bg-[#ded9d6] text-[#5c4033]'
                                }`}
                              >
                                {v.type === 'PERCENT' ? '%' : 'Rp'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`font-mono font-bold text-sm ${!isUsable ? 'text-slate-400' : 'text-slate-800'}`}
                                  >
                                    {v.code}
                                  </p>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusClass}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs ${!isUsable ? 'text-slate-400' : 'text-slate-500'}`}
                                >
                                  {v.type === 'PERCENT'
                                    ? `Diskon ${Number(v.value)}%${v.maxDiscount ? ` (maks ${formatPrice(Number(v.maxDiscount))})` : ''}`
                                    : `Diskon ${formatPrice(Number(v.value))}`}
                                  {v.minPurchase
                                    ? ` · Min. ${formatPrice(Number(v.minPurchase))}`
                                    : ''}
                                </p>
                                {isUpcoming && v.startDate && (
                                  <p className="text-[10px] text-blue-500 mt-0.5">
                                    Aktif mulai:{' '}
                                    {new Date(v.startDate).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {isUsable ? (
                                <>
                                  <p className="text-sm font-bold text-green-600">
                                    -{formatPrice(discount)}
                                  </p>
                                  {isSelected && (
                                    <svg
                                      className="w-5 h-5 text-[#5c4033] ml-auto"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                  )}
                                </>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-slate-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
              {orderQrCode ? (
                <img
                  src={orderQrCode}
                  alt="QR Code Pembayaran"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 text-sm">
                  Memuat QR...
                </div>
              )}
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
