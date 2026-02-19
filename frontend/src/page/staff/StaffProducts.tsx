import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../service/api';
import { useCartStore } from '../../hooks/useCartStore';
import { useToastStore } from '../../hooks/useToastStore';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

export default function StaffProducts() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.getProducts();
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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

  const CATEGORIES = [
    { value: 'all', label: 'Semua' },
    { value: 'MAKANAN', label: 'Makanan' },
    { value: 'MINUMAN', label: 'Minuman' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'JASA', label: 'Jasa' },
    { value: 'LAINNYA', label: 'Lainnya' },
  ];

  const filteredProducts = products.filter(
    (product) => categoryFilter === 'all' || product.category === categoryFilter
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Produk</h1>
          <p className="text-slate-500 mt-1">Pilih produk untuk membuat pesanan</p>
        </div>
        <button
          onClick={() => navigate('/staff/cart')}
          className="relative flex items-center gap-2 px-6 py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-all duration-200 shadow-lg shadow-[#5c4033]/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Keranjang
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
              categoryFilter === cat.value
                ? 'bg-[#5c4033] text-white shadow-lg shadow-[#5c4033]/25'
                : 'bg-white text-[#6c5347] hover:bg-[#efeceb] border border-[#cec6c2]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded p-4 shadow-sm animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
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
              <p className="text-slate-500">Tidak ada produk dalam kategori ini</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-slate-300"
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
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(product.category)}`}
                    >
                      {product.category}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#5c4033]">{formatPrice(product.price)}</p>
                    <button
                      onClick={() => {
                        const success = addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          stock: product.stock,
                        });
                        if (!success) {
                          addToast('Stok tidak mencukupi', 'error');
                        }
                      }}
                      className="p-2 bg-[#ded9d6] text-[#5c4033] rounded hover:bg-[#cec6c2] transition-colors active:scale-90 active:bg-[#bcaaa4] duration-150"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Stok: {product.stock}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
