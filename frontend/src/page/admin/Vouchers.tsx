import { useEffect, useState } from 'react';
import { api } from '../../service/api';
import VoucherForm from '../../components/admin/VoucherForm';
import { activityLogger } from './Dashboard';
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
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { addToast } = useToastStore();

  const fetchVouchers = async () => {
    try {
      const res = await api.getVouchers();
      setVouchers(res.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id: string) => {
    const voucherToDelete = vouchers.find((v) => v.id === id);
    try {
      await api.deleteVoucher(id);
      setVouchers(vouchers.filter((v) => v.id !== id));
      setDeleteConfirm(null);
      if (voucherToDelete) {
        activityLogger.log('Hapus Voucher', `Menghapus voucher "${voucherToDelete.code}"`);
        addToast(`Voucher "${voucherToDelete.code}" berhasil dihapus`, 'success');
      }
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      setDeleteConfirm(null);
      if (error.response) {
        if (error.response.status >= 500) {
          addToast('Gagal menghapus: Voucher ini sudah pernah dipakai pada pesanan.', 'error');
        } else {
          addToast(error.response.data?.message || 'Gagal menghapus voucher', 'error');
        }
      } else {
        addToast('Terjadi kesalahan koneksi', 'error');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVoucher(null);
    fetchVouchers();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    if (!voucher.isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Tidak Aktif
        </span>
      );
    }
    if (voucher.endDate && new Date(voucher.endDate) < now) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Kadaluarsa
        </span>
      );
    }
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Terjadwal
        </span>
      );
    }
    if (voucher.quota !== null && voucher.usageCount >= voucher.quota) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e5e5e8] text-[#555559]">
          Kuota Habis
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Aktif
      </span>
    );
  };

  const getDiscountDisplay = (voucher: Voucher) => {
    if (voucher.type === 'PERCENT') {
      return `${Number(voucher.value)}%`;
    }
    return formatPrice(Number(voucher.value));
  };

  return (
    <div className="p-8 max-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1e]">Voucher</h1>
          <p className="text-[#6e6e73] mt-1">Kelola semua voucher diskon</p>
        </div>
        <button
          onClick={() => {
            setEditingVoucher(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#2a2a2e] to-[#3d3d42] text-white font-semibold rounded hover:from-[#1a1a1e] hover:to-[#2a2a2e] transition-all duration-200 shadow-lg shadow-black/15"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Voucher
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 h-8 bg-[#d8d8dc] rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#d8d8dc] rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-[#d8d8dc] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : vouchers.length === 0 ? (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-[#1a1a1e] mb-2">Belum ada voucher</h3>
          <p className="text-[#6e6e73] mb-4">
            Buat voucher pertama untuk memberikan diskon ke pelanggan
          </p>
        </div>
      ) : (
        <div className="overflow-scroll [overflow-style:none] [scrollbar-width:none]">
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-[#d8d8dc]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Kode
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Diskon
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Min. Belanja
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Kuota
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Periode
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[#ffffff]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e8]">
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-[#e5e5e8]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-[#1a1a1e] bg-[#e5e5e8] px-2 py-1 rounded text-sm">
                          {voucher.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-[#1a1a1e]">
                            {getDiscountDisplay(voucher)}
                          </span>
                          <span className="text-xs text-[#9e9ea3] ml-2">
                            {voucher.type === 'FIXED' ? 'Nominal' : 'Persen'}
                          </span>
                        </div>
                        {voucher.type === 'PERCENT' && voucher.maxDiscount && (
                          <p className="text-xs text-[#6e6e73]">
                            Maks: {formatPrice(Number(voucher.maxDiscount))}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#1a1a1e]">
                        {voucher.minPurchase ? formatPrice(Number(voucher.minPurchase)) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {voucher.quota !== null ? (
                          <div>
                            <span
                              className={`font-medium ${voucher.usageCount >= voucher.quota ? 'text-red-600' : 'text-[#1a1a1e]'}`}
                            >
                              {voucher.usageCount}/{voucher.quota}
                            </span>
                            <span className="text-xs text-[#9e9ea3] ml-1">terpakai</span>
                          </div>
                        ) : (
                          <span className="text-[#9e9ea3]">∞</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#555559]">
                        <div>{formatDate(voucher.startDate)}</div>
                        {voucher.endDate && (
                          <div className="text-xs text-[#9e9ea3]">
                            s/d {formatDate(voucher.endDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(voucher)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingVoucher(voucher);
                              setShowForm(true);
                            }}
                            className="p-2 text-[#9e9ea3] hover:text-[#3d3d42] hover:bg-[#e5e5e8] rounded transition-colors"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(voucher.id)}
                            className="p-2 text-[#9e9ea3] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Form Modal */}
      {showForm && (
        <VoucherForm
          voucher={editingVoucher}
          onClose={() => {
            setShowForm(false);
            setEditingVoucher(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
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
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a1e] text-center mb-2">
              Hapus Voucher?
            </h3>
            <p className="text-[#6e6e73] text-center text-sm mb-6">
              Voucher yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-[#c8c8cc] text-[#3d3d42] rounded hover:bg-[#e5e5e8] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
