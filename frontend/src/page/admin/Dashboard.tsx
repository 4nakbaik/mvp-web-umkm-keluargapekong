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
  // State for dashboard data
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: [] as { id: string; name: string; stock: number }[],
    activeVouchersCount: 0,
    expiredVouchersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const [dashboardRes, ordersRes] = await Promise.all([
          api.getDashboardStats(),
          api.getOrders(),
        ]);

        console.log('Dashboard Res:', dashboardRes); // Debugging

        const {
          totalRevenue,
          totalOrders,
          lowStockProducts,
          activeVouchersCount,
          expiredVouchersCount,
        } = dashboardRes.data;

        setStats({
          totalOrders: totalOrders || 0,
          totalRevenue: totalRevenue || 0,
          lowStockProducts: lowStockProducts || [],
          activeVouchersCount: activeVouchersCount || 0,
          expiredVouchersCount: expiredVouchersCount || 0,
        });

        // Backend doesn't return recentOrders in summary, so we slice from getOrders
        const allOrders = ordersRes.data || [];
        setRecentOrders(allOrders.slice(0, 5));
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-bold">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-3xl font-bold text-[#1a1a1e]">{stats.totalOrders}</p>
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
                }).format(stats.totalRevenue)}
              </p>
              <p className="text-[#6e6e73] mt-1">Pemasukan</p>
            </>
          )}
        </div>

        {/* Voucher Stats (Replaces Low Stock Alert) */}
        <div className="bg-white rounded p-6 shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-[#d8d8dc] rounded mb-4"></div>
              <div className="h-8 bg-[#d8d8dc] rounded w-16 mb-2"></div>
              <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#e5e5e8] text-[#555559] rounded mb-4 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-[#1a1a1e]">{stats.activeVouchersCount}</p>
                <span className="text-sm text-green-600 font-medium">Aktif</span>
                <span className="text-gray-300">|</span>
                <p className="text-xl font-semibold text-[#6e6e73]">{stats.expiredVouchersCount}</p>
                <span className="text-sm text-[#9e9ea3]">Exp</span>
              </div>
              <p className="text-[#6e6e73] mt-1">Status Voucher</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Low Stock Products (New) */}
        <div className="bg-white rounded shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-[#e5e5e8]">
            <h2 className="text-xl font-semibold text-[#1a1a1e]">Stok Menipis</h2>
            <p className="text-sm text-[#6e6e73] mt-1">Produk dengan stok kurang dari 10</p>
          </div>
          <div className="p-6 flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 border border-gray-100 rounded"
                  >
                    <div className="h-4 bg-[#d8d8dc] rounded w-32"></div>
                    <div className="h-6 bg-[#d8d8dc] rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : stats.lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-green-600">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Semua stok aman</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {stats.lowStockProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded"
                  >
                    <span className="font-medium text-[#1a1a1e] truncate pr-2">{p.name}</span>
                    <span className="px-2.5 py-1 bg-white text-red-600 font-bold rounded text-sm border border-red-200">
                      {p.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Recent Orders Section (New) */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-[#e5e5e8]">
            <h2 className="text-xl font-semibold text-[#1a1a1e]">Transaksi Terakhir</h2>
            <p className="text-sm text-[#6e6e73] mt-1">5 Transaksi terbaru yang masuk</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="flex justify-between mb-4 border-b pb-2 border-gray-100">
                  <div className="h-3 bg-[#d8d8dc] rounded w-16"></div>
                  <div className="h-3 bg-[#d8d8dc] rounded w-16"></div>
                  <div className="h-3 bg-[#d8d8dc] rounded w-16"></div>
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <div className="space-y-1">
                      <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
                      <div className="h-3 bg-[#d8d8dc] rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-[#d8d8dc] rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-[#6e6e73] text-center py-4">Belum ada transaksi</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left bg-white">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">
                        ID / Kasir
                      </th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">
                        Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-[#1a1a1e]">
                          <div className="font-medium">{order.user?.name || 'Kasir'}</div>
                          <div className="text-xs text-gray-400">#{order.id.substring(0, 8)}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#1a1a1e]">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log (Existing) */}
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
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#d8d8dc] rounded flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-[#d8d8dc] rounded w-3/4"></div>
                      <div className="h-3 bg-[#d8d8dc] rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activityLogs.length === 0 ? (
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
              <div className="space-y-4 max-h-96 overflow-auto custom-scrollbar">
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
    </div>
  );
}
