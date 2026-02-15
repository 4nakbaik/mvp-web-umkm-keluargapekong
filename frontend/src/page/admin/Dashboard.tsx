import { useEffect, useState } from 'react';
import { api } from '../../service/api';

interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

// Helper untuk manage activity log di localStorage
export const activityLogger = {
  log: (action: string, detail: string) => {
    const logs = activityLogger.getLogs();
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      detail,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep only last 50 logs
    const trimmedLogs = logs.slice(0, 50);
    localStorage.setItem('admin_activity_logs', JSON.stringify(trimmedLogs));
  },
  getLogs: (): ActivityLog[] => {
    try {
      const logs = localStorage.getItem('admin_activity_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  },
  clear: () => {
    localStorage.removeItem('admin_activity_logs');
  },
};

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsRes = await api.getProducts();
        const products = productsRes.data || [];
        setTotalProducts(products.length);

        const ordersRes = await api.getOrders();
        const orders = ordersRes.data || [];
        setTotalOrders(orders.length);

        const totalRevenue = orders
          .filter((o: any) => o.status === 'PAID')
          .reduce((sum: number, o: any) => {
            const orderTotal =
              o.total ||
              (o.items
                ? o.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
                : 0);
            return sum + orderTotal;
          }, 0);
        setRevenue(totalRevenue);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    setActivityLogs(activityLogger.getLogs());
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Tambah') || action.includes('Buat')) {
      return { icon: 'M12 4v16m8-8H4', color: 'text-green-500 bg-green-100' };
    }
    if (action.includes('Edit') || action.includes('Update')) {
      return {
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        color: 'text-[#555559] bg-[#e5e5e8]',
      };
    }
    if (action.includes('Hapus')) {
      return {
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        color: 'text-red-500 bg-red-100',
      };
    }
    if (action.includes('Login')) {
      return {
        icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
        color: 'text-purple-500 bg-purple-100',
      };
    }
    return {
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-[#6e6e73] bg-[#e5e5e8]',
    };
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1e]">Dashboard</h1>
        <p className="text-[#6e6e73] mt-1">Selamat datang di Admin Panel Keluarga Pekong</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded p-6 shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-[#d8d8dc] rounded mb-4"></div>
              <div className="h-8 bg-[#d8d8dc] rounded w-16 mb-2"></div>
              <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#3d3d42] rounded mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              <p className="text-3xl font-bold text-[#1a1a1e]">{totalProducts}</p>
              <p className="text-[#6e6e73] mt-1">Total Produk</p>
            </>
          )}
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded p-6 shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-[#d8d8dc] rounded mb-4"></div>
              <div className="h-8 bg-[#d8d8dc] rounded w-16 mb-2"></div>
              <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2a2a2e] rounded mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <p className="text-3xl font-bold text-[#1a1a1e]">{totalOrders}</p>
              <p className="text-[#6e6e73] mt-1">Total Pesanan</p>
            </>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white rounded p-6 shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-[#d8d8dc] rounded mb-4"></div>
              <div className="h-8 bg-[#d8d8dc] rounded w-16 mb-2"></div>
              <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1a1a1e] rounded mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-[#1a1a1e]">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(revenue)}
              </p>
              <p className="text-[#6e6e73] mt-1">Pemasukan</p>
            </>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded shadow-sm">
        <div className="p-6 border-b border-[#e5e5e8] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1e]">Log Aktivitas Admin</h2>
            <p className="text-sm text-[#6e6e73] mt-1">Riwayat aktivitas yang dilakukan admin</p>
          </div>
          {activityLogs.length > 0 && (
            <button
              onClick={() => {
                activityLogger.clear();
                setActivityLogs([]);
              }}
              className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
            >
              Hapus Semua
            </button>
          )}
        </div>

        <div className="p-6">
          {activityLogs.length === 0 ? (
            <div className="text-center py-12">
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
              <p className="text-[#6e6e73]">Belum ada aktivitas tercatat</p>
              <p className="text-sm text-[#9e9ea3] mt-1">
                Aktivitas akan muncul saat Anda mengelola produk
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-auto">
              {activityLogs.map((log) => {
                const { icon, color } = getActionIcon(log.action);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded hover:bg-[#e5e5e8]/50 transition-colors"
                  >
                    <div className={`p-2 rounded ${color}`}>
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
                          d={icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1a1a1e]">{log.action}</p>
                      <p className="text-sm text-[#6e6e73] truncate">{log.detail}</p>
                    </div>
                    <span className="text-xs text-[#9e9ea3] whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
