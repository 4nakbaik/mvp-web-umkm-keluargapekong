import { useEffect, useState } from 'react';
import { api } from '../../service/api';
import ProductForm from '../../components/admin/ProductForm';
import { activityLogger } from './Dashboard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // untuk Delete Product
  const handleDelete = async (id: string) => {
    const productToDelete = products.find((p) => p.id === id);
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      if (productToDelete) {
        activityLogger.log('Hapus Produk', `Menghapus produk "${productToDelete.name}"`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // untuk handle ketika upload data
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // Format untuk Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Style Icon Category
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      MAKANAN: 'bg-orange-100 text-orange-700',
      MINUMAN: 'bg-blue-100 text-blue-700',
      SNACK: 'bg-purple-100 text-purple-700',
      JASA: 'bg-green-100 text-green-700',
      LAINNYA: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.LAINNYA;
  };

  return (
    <div className="p-8 max-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Produk</h1>
          <p className="text-slate-500 mt-1">Kelola semua produk di toko Anda</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum ada produk</h3>
        </div>
      ) : (
        <div className='overflow-scroll [overflow-style:none] [scrollbar-width:none]'>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Produk
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Kategori
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Harga
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Stok</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-slate-400"
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
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(product.category)}`}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-slate-800'}`}
                      >
                        {product.stock}
                      </span>
                      {product.stock <= 5 && (
                        <span className="ml-2 text-xs text-red-500">Stok rendah</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
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
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
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
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Hapus Produk?</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              Produk yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
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
