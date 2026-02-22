import { useEffect, useState } from 'react';
import { api } from '../../service/api';
import VoucherForm from '../../components/admin/VoucherForm';
import { useToastStore } from '../../hooks/useToastStore';

export default function Vouchers() {
  const [stats, setStats] = useState({
    activeVouchersCount: 0,
    expiredVouchersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { addToast } = useToastStore();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats({
        activeVouchersCount: res.data.activeVouchersCount || 0,
        expiredVouchersCount: res.data.expiredVouchersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      addToast('Gagal memuat status voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchStats(); // Refresh stats after adding a new voucher
  };

  return (
    <div className="p-8 max-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1e]">Voucher</h1>
          <p className="text-[#6e6e73] mt-1">Kelola semua voucher diskon</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#2a2a2e] to-[#3d3d42] text-white font-semibold rounded hover:from-[#1a1a1e] hover:to-[#2a2a2e] transition-all duration-200 shadow-lg shadow-black/15"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Voucher
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded p-6 shadow-sm border border-[#e5e5e8]">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-[#d8d8dc] rounded mb-4"></div>
              <div className="h-8 bg-[#d8d8dc] rounded w-16 mb-2"></div>
              <div className="h-4 bg-[#d8d8dc] rounded w-24"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded p-6 shadow-sm hover:shadow-md transition-shadow border border-[#e5e5e8]">
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
              <span className="text-sm text-[#9e9ea3]">Expired / Tidak Aktif</span>
            </div>
            <p className="text-[#6e6e73] mt-1">Status Voucher Keseluruhan</p>
          </div>
        </div>
      )}

      {/* Voucher Form Modal */}
      {showForm && (
        <VoucherForm
          voucher={null} // Editing disabled since table is gone
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
