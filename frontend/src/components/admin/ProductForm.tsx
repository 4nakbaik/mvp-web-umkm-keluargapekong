import { useState, useRef, useEffect } from 'react';
import { api } from '../../service/api';
import { activityLogger } from '../../page/admin/Dashboard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'MAKANAN', label: 'Makanan' },
  { value: 'MINUMAN', label: 'Minuman' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'JASA', label: 'Jasa' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    category: product?.category || 'LAINNYA',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl ? `${BACKEND_URL}${product.imageUrl}` : null // Sesuaikan port backend-mu
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditing = !!product;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: Validate and show confirmation
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim()) {
      setError('Nama produk wajib diisi');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Harga harus lebih dari 0');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Stok tidak boleh negatif');
      return;
    }

    // Show confirmation dialog
    setShowConfirm(true);
  };

  // Step 2: Actually submit after confirmation
  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('stock', formData.stock);
      payload.append('category', formData.category);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (isEditing && product) {
        await api.updateProduct(product.id, payload);
        activityLogger.log('Edit Produk', `Mengubah produk "${formData.name}"`);
      } else {
        await api.createProduct(payload);
        activityLogger.log('Tambah Produk', `Menambahkan produk baru "${formData.name}"`);
      }

      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Foto Produk</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl mx-auto"
                  />
                  <p className="text-sm text-slate-500 mt-2">Klik untuk mengganti foto</p>
                </div>
              ) : (
                <div className="py-8">
                  <svg
                    className="w-10 h-10 mx-auto text-slate-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-slate-600">Klik untuk upload foto</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Nama produk"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Deskripsi produk (opsional)"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="100"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="10000"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="100"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Kategori
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Konfirmasi {isEditing ? 'Perubahan' : 'Tambah Produk'}
              </h3>
              <p className="text-slate-500 mb-6">
                {isEditing
                  ? `Apakah Anda yakin ingin menyimpan perubahan pada produk "${formData.name}"?`
                  : `Apakah Anda yakin ingin menambahkan produk baru "${formData.name}"?`}
              </p>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-slate-600">
                  <strong>Nama:</strong> {formData.name}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Harga:</strong> Rp {parseInt(formData.price).toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Stok:</strong> {formData.stock}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Kategori:</strong> {formData.category}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 disabled:opacity-50"
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
