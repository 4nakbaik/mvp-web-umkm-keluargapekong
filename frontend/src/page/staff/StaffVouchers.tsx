import { useEffect, useState, useMemo } from 'react';
import { api } from '../../service/api';
import { useToastStore } from '../../hooks/useToastStore';

interface Voucher {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  quota: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

type TabType = 'ALL' | 'ACTIVE' | 'COMING_SOON' | 'EXPIRED';

export default function StaffVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const { addToast } = useToastStore();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // Fetch ALL vouchers without status filter parameters
      const res = await api.getVouchers();
      setVouchers(res.data || []);
      console.log(res.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      addToast('Gagal memuat daftar voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Frontend filtering logic based on current time
  const filteredVouchers = useMemo(() => {
    const now = new Date();

    return vouchers.filter((voucher) => {
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      const isCurrentlyActive = voucher.isActive && startDate <= now && endDate >= now;
      const isComingSoon = voucher.isActive && startDate > now;
      const isExpired = !voucher.isActive || endDate < now;

      switch (activeTab) {
        case 'ACTIVE':
          return isCurrentlyActive;
        case 'COMING_SOON':
          return isComingSoon;
        case 'EXPIRED':
          return isExpired;
        case 'ALL':
        default:
          return true; // Show all
      }
    });
  }, [vouchers, activeTab]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'ALL',
      label: 'Semua',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      id: 'ACTIVE',
      label: 'Aktif',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'COMING_SOON',
      label: 'Akan Datang',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'EXPIRED',
      label: 'Kadaluarsa',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1e]">Portal Voucher</h1>
          <p className="text-[#6e6e73] mt-1 text-sm md:text-base">
            Pantau semua promosi diskon pelanggan
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 mb-4 border-b border-gray-200 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-t-xl md:rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2
              ${
                activeTab === tab.id
                  ? 'bg-[#5c4033] text-white shadow-md shadow-[#5c4033]/20'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5c4033]"></div>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Tidak ada voucher ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Status tab ini saat ini tidak memiliki data voucher yang sesuai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredVouchers.map((voucher) => {
              const now = new Date();
              const startDate = new Date(voucher.startDate);
              const endDate = new Date(voucher.endDate);
              const isExpired = !voucher.isActive || endDate < now;
              const isComingSoon = voucher.isActive && startDate > now;
              const isAktif = voucher.isActive && startDate <= now && endDate >= now;

              // Determine color styles based on status
              const statusColorMap = {
                aktif: {
                  border: 'border-green-200',
                  bg: 'bg-green-50',
                  text: 'text-green-700',
                  badge: 'bg-green-100 text-green-700',
                },
                coming: {
                  border: 'border-amber-200',
                  bg: 'bg-amber-50',
                  text: 'text-amber-700',
                  badge: 'bg-amber-100 text-amber-700',
                },
                expired: {
                  border: 'border-gray-200',
                  bg: 'bg-gray-50',
                  text: 'text-gray-500',
                  badge: 'bg-gray-100 text-gray-600',
                },
              };

              const currentTheme = isAktif
                ? statusColorMap.aktif
                : isComingSoon
                  ? statusColorMap.coming
                  : statusColorMap.expired;

              return (
                <div
                  key={voucher.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md ${currentTheme.border} ${isExpired ? 'opacity-80' : ''}`}
                >
                  {/* Decorative Ticket Edge Pattern Effect */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#f5f3f2] rounded-full transform -translate-y-1/2 border border-r-[1px] border-l-0 border-y-0 border-transparent shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#f5f3f2] rounded-full transform -translate-y-1/2 border border-l-[1px] border-r-0 border-y-0 border-transparent shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)]"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 font-mono tracking-tight uppercase px-3 py-1 bg-gray-100 rounded-lg border border-dashed border-gray-300 inline-block">
                        {voucher.code}
                      </h3>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl mb-4 flex-1 ${currentTheme.bg}`}>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-3xl font-bold leading-none ${currentTheme.text}`}>
                        {voucher.type === 'PERCENT'
                          ? `${voucher.value}%`
                          : formatRupiah(voucher.value)}
                      </span>
                      <span
                        className={`text-sm font-medium ${isExpired ? 'text-gray-400' : currentTheme.text} mb-0.5`}
                      >
                        Diskon
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs">
                      {voucher.minPurchase && (
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-gray-600">Min. Belanja</span>
                          <span className="font-semibold text-gray-900">
                            {formatRupiah(voucher.minPurchase)}
                          </span>
                        </div>
                      )}

                      {voucher.maxDiscount && voucher.type === 'PERCENT' && (
                        <div className="flex justify-between border-b border-black/5 pb-1">
                          <span className="text-gray-600">Maks. Diskon</span>
                          <span className="font-semibold text-gray-900">
                            {formatRupiah(voucher.maxDiscount)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-gray-600">Sisa Kuota</span>
                        <span className="font-semibold text-gray-900">
                          {voucher.quota !== null ? `${voucher.quota - voucher.usageCount} x` : 'Tanpa Batas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${currentTheme.badge} mb-2`}
                    >
                      {isAktif ? 'Aktif' : isComingSoon ? 'Akan Datang' : 'Kadaluarsa'}
                    </span>
                    <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">Berlaku Dari: </span>
                        <span className="font-medium text-gray-700">
                          {formatDate(voucher.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="truncate">Berakhir: </span>
                        <span className="font-medium text-gray-700">
                          {formatDate(voucher.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
