import { useEffect, useState } from 'react';
import { api } from '../../service/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([api.getProducts(), api.getOrders()]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: { status: string }) => o.status === 'PENDING').length,
          paidOrders: orders.filter((o: { status: string }) => o.status === 'PAID').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Produk',
      value: stats.totalProducts,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Total Pesanan',
      value: stats.totalOrders,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Pesanan Pending',
      value: stats.pendingOrders,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Pesanan Lunas',
      value: stats.paidOrders,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Selamat datang di Admin Panel Keluarga Pekong</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-linear-to-br ${card.color} rounded-xl mb-4 shadow-lg`}
              >
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
                    d={card.icon}
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              <p className="text-slate-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Panduan Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800">Kelola Produk</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tambah, edit, atau hapus produk dari menu Produk
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800">Kelola Pesanan</h3>
            <p className="text-sm text-slate-500 mt-1">Update status pesanan dari menu Pesanan</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800">Keamanan</h3>
            <p className="text-sm text-slate-500 mt-1">
              Pastikan logout setelah selesai menggunakan panel
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
