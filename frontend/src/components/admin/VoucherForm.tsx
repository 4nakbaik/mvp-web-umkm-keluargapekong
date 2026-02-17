import { useState, useEffect } from 'react';
import { api } from '../../service/api';
import { activityLogger } from '../../page/admin/Dashboard';
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
}

interface VoucherFormProps {
  voucher: Voucher | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoucherForm({ voucher, onClose, onSuccess }: VoucherFormProps) {
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    type: voucher?.type || ('FIXED' as 'FIXED' | 'PERCENT'),
    value: voucher?.value?.toString() || '',
    minPurchase: voucher?.minPurchase?.toString() || '',
    maxDiscount: voucher?.maxDiscount?.toString() || '',
    quota: voucher?.quota?.toString() || '',
    startDate: voucher?.startDate ? new Date(voucher.startDate).toISOString().slice(0, 16) : '',
    endDate: voucher?.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : '',
    isActive: voucher?.isActive ?? true,
  });

  const isEditing = !!voucher;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim()) {
      setError('Kode voucher wajib diisi');
      return;
    }
    if (formData.code.trim().length < 3) {
      setError('Kode voucher minimal 3 karakter');
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('Nilai diskon harus lebih dari 0');
      return;
    }
    if (formData.type === 'PERCENT' && parseFloat(formData.value) > 100) {
      setError('Diskon persen tidak boleh lebih dari 100%');
      return;
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal berakhir');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const payload: any = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
      };

      if (formData.minPurchase) payload.minPurchase = parseFloat(formData.minPurchase);
      if (formData.maxDiscount) payload.maxDiscount = parseFloat(formData.maxDiscount);
      if (formData.quota) payload.quota = parseInt(formData.quota);
      if (formData.startDate) payload.startDate = formData.startDate;
      if (formData.endDate) payload.endDate = formData.endDate;
      payload.isActive = formData.isActive;

      if (isEditing && voucher) {
        await api.updateVoucher(voucher.id, payload);
        activityLogger.log('Edit Voucher', `Mengubah voucher "${formData.code}"`);
        addToast('Voucher berhasil diperbarui', 'success');
      } else {
        await api.createVoucher(payload);
        activityLogger.log('Tambah Voucher', `Menambahkan voucher baru "${formData.code}"`);
        addToast('Voucher berhasil ditambahkan', 'success');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error submitting voucher:', err);
      if (err.response) {
        if (err.response.status === 400) {
          addToast(err.response.data?.message || 'Kode voucher sudah ada', 'error');
        } else if (err.response.status >= 500) {
          addToast('Terjadi kesalahan server', 'error');
        } else {
          addToast(err.response.data?.message || 'Terjadi kesalahan', 'error');
        }
      } else {
        addToast('Terjadi kesalahan koneksi', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPreviewValue = () => {
    if (!formData.value) return '-';
    if (formData.type === 'PERCENT') return `${formData.value}%`;
    return `Rp ${parseInt(formData.value).toLocaleString('id-ID')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e8] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1a1e]">
            {isEditing ? 'Edit Voucher' : 'Tambah Voucher Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#9e9ea3] hover:text-[#3d3d42] hover:bg-[#e5e5e8] rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmitClick} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Kode Voucher */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[#3d3d42] mb-2">
              Kode Voucher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all font-mono tracking-wider"
              placeholder="DISKON50"
            />
          </div>

          {/* Tipe Diskon */}
          <div>
            <label className="block text-sm font-medium text-[#3d3d42] mb-2">
              Tipe Diskon <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded border border-[#c8c8cc] overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  formData.type === 'FIXED'
                    ? 'bg-[#2a2a2e] text-white'
                    : 'bg-white text-[#555559] hover:bg-[#e5e5e8]'
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Nominal (Rp)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'PERCENT' })}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  formData.type === 'PERCENT'
                    ? 'bg-[#2a2a2e] text-white'
                    : 'bg-white text-[#555559] hover:bg-[#e5e5e8]'
                }`}
              >
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Persentase (%)
              </button>
            </div>
          </div>

          {/* Nilai Diskon */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-[#3d3d42] mb-2">
              {formData.type === 'FIXED' ? 'Nilai Diskon (Rp)' : 'Nilai Diskon (%)'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              min="0"
              max={formData.type === 'PERCENT' ? '100' : undefined}
              step={formData.type === 'PERCENT' ? '1' : '100'}
              className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all"
              placeholder={formData.type === 'FIXED' ? '10000' : '50'}
            />
          </div>

          {/* Min Purchase & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="minPurchase"
                className="block text-sm font-medium text-[#3d3d42] mb-2"
              >
                Min. Pembelian (Rp)
              </label>
              <input
                type="number"
                id="minPurchase"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all"
                placeholder="50000"
              />
            </div>
            <div>
              <label
                htmlFor="maxDiscount"
                className="block text-sm font-medium text-[#3d3d42] mb-2"
              >
                Maks. Diskon (Rp)
              </label>
              <input
                type="number"
                id="maxDiscount"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all"
                placeholder="25000"
              />
            </div>
          </div>

          {/* Kuota */}
          <div>
            <label htmlFor="quota" className="block text-sm font-medium text-[#3d3d42] mb-2">
              Kuota Pemakaian{' '}
              <span className="text-[#9e9ea3] text-xs">(kosongkan = unlimited)</span>
            </label>
            <input
              type="number"
              id="quota"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
              min="0"
              className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all"
              placeholder="100"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-[#3d3d42] mb-2">
                Tanggal Mulai
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-[#3d3d42] mb-2">
                Tanggal Berakhir
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-[#c8c8cc] rounded focus:ring-2 focus:ring-[#6e6e73] focus:border-[#6e6e73] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-[#e5e5e8]/50 rounded">
            <div>
              <p className="text-sm font-medium text-[#3d3d42]">Status Voucher</p>
              <p className="text-xs text-[#9e9ea3]">Voucher hanya bisa dipakai jika aktif</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                formData.isActive ? 'bg-green-500' : 'bg-[#c8c8cc]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#c8c8cc] text-[#3d3d42] font-medium rounded hover:bg-[#e5e5e8] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#2a2a2e] text-white font-semibold rounded hover:bg-[#1a1a1e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Voucher'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e5e5e8] rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-[#555559]"
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
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1e] mb-2">
                Konfirmasi {isEditing ? 'Perubahan' : 'Tambah Voucher'}
              </h3>
              <p className="text-[#6e6e73] mb-6">
                {isEditing
                  ? `Simpan perubahan pada voucher "${formData.code}"?`
                  : `Tambahkan voucher baru "${formData.code}"?`}
              </p>

              <div className="bg-[#e5e5e8]/50 rounded p-4 mb-6 text-left space-y-1">
                <p className="text-sm text-[#555559]">
                  <strong>Kode:</strong> {formData.code}
                </p>
                <p className="text-sm text-[#555559]">
                  <strong>Tipe:</strong> {formData.type === 'FIXED' ? 'Nominal' : 'Persentase'}
                </p>
                <p className="text-sm text-[#555559]">
                  <strong>Nilai:</strong> {formatPreviewValue()}
                </p>
                {formData.minPurchase && (
                  <p className="text-sm text-[#555559]">
                    <strong>Min. Belanja:</strong> Rp{' '}
                    {parseInt(formData.minPurchase).toLocaleString('id-ID')}
                  </p>
                )}
                {formData.maxDiscount && (
                  <p className="text-sm text-[#555559]">
                    <strong>Maks. Diskon:</strong> Rp{' '}
                    {parseInt(formData.maxDiscount).toLocaleString('id-ID')}
                  </p>
                )}
                {formData.quota && (
                  <p className="text-sm text-[#555559]">
                    <strong>Kuota:</strong> {formData.quota}x
                  </p>
                )}
                <p className="text-sm text-[#555559]">
                  <strong>Status:</strong> {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 border border-[#c8c8cc] text-[#3d3d42] font-medium rounded hover:bg-[#e5e5e8] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#2a2a2e] text-white font-semibold rounded hover:bg-[#1a1a1e] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
