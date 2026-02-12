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
  total: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  user: { name: string };
  customer: { name: string; phone: string } | null;
  items: OrderItem[];
}

export default function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

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
      FAILED: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[status] || styles.PENDING;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      PAID: 'Lunas',
      CANCELLED: 'Dibatalkan',
      FAILED: 'Gagal',
    };
    return labels[status] || status;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pesanan</h1>
          <p className="text-slate-500 mt-1">Lihat semua pesanan pelanggan</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex justify-between">
                <div className="w-1/3">
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada pesanan</h3>
          <p className="text-slate-500">
            {filter === 'ALL'
              ? 'Belum ada pesanan masuk.'
              : `Tidak ada pesanan dengan status ${getStatusLabel(filter)}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-medium text-slate-800">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Pelanggan</p>
                    <p className="font-medium text-slate-800">
                      {order.customer?.name || order.user?.name || '-'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="font-semibold text-slate-800">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
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
                <div className="px-6 pb-6 border-t border-slate-100">
                  <div className="pt-4">
                    <p className="text-sm font-medium text-slate-600 mb-3">Item Pesanan:</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                        >
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-slate-400"
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
                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-slate-800">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
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
