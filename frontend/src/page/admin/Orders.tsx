import { useState, useEffect } from 'react';
import { api } from '../../service/api';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  code: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  total: number;
  paymentType: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  user: { name: string };
  customer: { name: string; phone: string; isMember: boolean } | null;
  voucher: { code: string } | null;
  items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async (statusFilter = filter) => {
    try {
      setLoading(true);
      const res = await api.getOrders(statusFilter);
      setOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);

      // Update local state: remove if it doesn't match current filter (except ALL)
      setOrders((prevOrders) => {
        if (filter !== 'ALL' && newStatus !== filter) {
          return prevOrders.filter((order) => order.id !== orderId);
        }
        return prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        );
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status pesanan');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  // Auto-PAID for DINE_IN orders (Admin handles this since Staff lacks permissions)
  useEffect(() => {
    const pendingDineInOrders = orders.filter(
      (o) => o.status === 'PENDING' && o.paymentType?.includes('DINE_IN')
    );

    pendingDineInOrders.forEach((order) => {
      // Small delay to prevent rapid overlapping requests during initial load
      setTimeout(() => {
        handleStatusUpdate(order.id, 'PAID');
      }, 500);
    });
  }, [orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      PAID: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      FAILED: 'bg-[#e5e5e8] text-[#555559] border-[#d8d8dc]',
    };
    return styles[status] || styles.PENDING;
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Lunas' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1e]">Pesanan</h1>
          <p className="text-[#6e6e73] mt-1">Kelola semua pesanan pelanggan</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                filter === status
                  ? 'bg-[#2a2a2e] text-white'
                  : 'bg-white text-[#555559] hover:bg-[#e5e5e8] border border-[#d8d8dc]'
              }`}
            >
              {status === 'ALL'
                ? 'Semua'
                : status === 'PENDING'
                  ? 'Pending'
                  : status === 'PAID'
                    ? 'Lunas'
                    : 'Dibatalkan'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded p-6 shadow-sm animate-pulse">
              <div className="flex justify-between">
                <div className="w-1/3">
                  <div className="h-4 bg-[#d8d8dc] rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-[#d8d8dc] rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-[#d8d8dc] rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-[#c8c8cc] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold text-[#1a1a1e] mb-2">Tidak ada pesanan</h3>
          <p className="text-[#6e6e73]">
            {filter === 'ALL'
              ? 'Belum ada pesanan masuk.'
              : `Tidak ada pesanan dengan status ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded shadow-sm overflow-hidden">
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-[#e5e5e8]/50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-medium text-[#1a1a1e]">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-[#6e6e73]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[#6e6e73]">Staff</p>
                    <p className="font-medium text-[#1a1a1e]">{order.user?.name || '-'}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[#6e6e73]">Total</p>
                    <p className="font-semibold text-[#1a1a1e]">
                      {formatPrice(
                        Number(order.totalAmount) ||
                          order.total ||
                          order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}
                  >
                    {order.status === 'PENDING'
                      ? 'Pending'
                      : order.status === 'PAID'
                        ? 'Lunas'
                        : order.status === 'CANCELLED'
                          ? 'Dibatalkan'
                          : order.status}
                  </span>
                  {/* Order Type Badge */}
                  {(() => {
                    const isTakeOut = order.paymentType?.includes('TAKE_OUT');
                    const isDineIn = order.paymentType?.includes('DINE_IN');
                    if (isTakeOut) {
                      // Extract the option in parentheses if it exists
                      const match = order.paymentType?.match(/\(([^)]+)\)/);
                      const option = match ? ` (${match[1]})` : '';
                      return (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                          Take Out{option}
                        </span>
                      );
                    }
                    if (isDineIn) {
                      return (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                          Dine In
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <div className="relative">
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none bg-white text-[#1a1a1e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#9e9ea3] transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
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
              </div>

              {expandedOrder === order.id && (
                <div className="px-6 pb-6 border-t border-[#e5e5e8]">
                  <div className="pt-4">
                    <p className="text-sm font-medium text-[#555559] mb-3">Item Pesanan:</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-[#e5e5e8]/50 rounded"
                        >
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-[#d8d8dc] flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#9e9ea3]"
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
                            <p className="font-medium text-[#1a1a1e]">{item.product.name}</p>
                            <p className="text-sm text-[#6e6e73]">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-[#1a1a1e]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Financial Breakdown */}
                    <div className="mt-4 pt-4 border-t border-[#e5e5e8] space-y-1.5 max-w-xs ml-auto">
                      <div className="flex justify-between text-sm text-[#6e6e73]">
                        <span>Subtotal</span>
                        <span>
                          {formatPrice(
                            Number(order.subtotal) ||
                              order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
                          )}
                        </span>
                      </div>
                      {Number(order.discountAmount) > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Diskon {order.voucher?.code ? `(${order.voucher.code})` : ''}</span>
                          <span>-{formatPrice(Number(order.discountAmount))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-[#6e6e73]">
                        <span>PPN 11%</span>
                        <span>{formatPrice(Number(order.taxAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#1a1a1e] pt-1.5 border-t border-[#d8d8dc]">
                        <span>Total</span>
                        <span>{formatPrice(Number(order.totalAmount) || order.total || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#9e9ea3] pt-1">
                        <span>Tipe Pesanan & Pembayaran</span>
                        <span className="font-medium">
                          {order.paymentType
                            ? order.paymentType
                                .replace(/ - TAKE_OUT( \([^)]+\))?/, '')
                                .replace(' - DINE_IN', '') +
                              (order.paymentType.includes('TAKE_OUT')
                                ? ` (Take Out${order.paymentType.match(/\(([^)]+)\)/) ? ' - ' + order.paymentType.match(/\(([^)]+)\)/)?.[1] : ''})`
                                : order.paymentType.includes('DINE_IN')
                                  ? ' (Dine In)'
                                  : '')
                            : 'CASH'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
