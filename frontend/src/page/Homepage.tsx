import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../service/api';
import { Card } from '../components/Card';

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

const CATEGORIES = [
  {
    value: 'all',
    label: 'Semua'
  },
  {
    value: 'MAKANAN',
    label: 'Makanan'
  },
  {
    value: 'MINUMAN',
    label: 'Minuman'
  },
  {
    value: 'SNACK',
    label: 'Snack'
  },
  {
    value: 'JASA',
    label: 'Jasa'
  },
  {
    value: 'LAINNYA',
    label: 'Lainnya'
  },
];

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching Product', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search + category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section (placeholder) */}
      <section className="w-full h-64 sm:h-80 lg:h-96 mt-6 bg-[#F4C480]/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#4A3728] mb-2">Selamat Datang</h2>
          <p className="text-[#4A3728]/70">Temukan produk terbaik dari Keluarga Pekong</p>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsSectionRef} className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3728]">Menu Kami</h2>
            <p className="text-[#4A3728]/60 mt-1">
              {filteredProducts.length} produk
              {categoryFilter !== 'all' &&
                ` dalam ${CATEGORIES.find((c) => c.value === categoryFilter)?.label}`}
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
          </div>

          {/* Search (desktop, inline with header) */}
          <div className="mt-4 sm:mt-0 relative max-w-xs w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A3728]/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-[#F4C480]/50 text-sm text-[#4A3728] placeholder-[#4A3728]/40 focus:outline-none focus:ring-2 focus:ring-[#F4C480] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3728]/40 hover:text-[#4A3728]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded text-sm font-medium transition-all duration-200 ${
                categoryFilter === cat.value
                  ? 'bg-[#F4C480] text-[#4A3728] shadow-md shadow-[#F4C480]/20'
                  : 'bg-white text-[#4A3728]/70 border border-[#F4C480]/30 hover:border-[#F4C480] hover:bg-[#FFF8E7]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse border border-[#F4C480]/10"
              >
                <div className="w-full h-48 bg-[#F4C480]/20" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#F4C480]/20 rounded w-3/4" />
                  <div className="h-3 bg-[#F4C480]/20 rounded w-1/2" />
                  <div className="h-6 bg-[#F4C480]/20 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-[#F4C480]/20">
            <svg
              className="w-16 h-16 mx-auto text-[#F4C480]/50 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-[#4A3728] mb-2">Produk tidak ditemukan</h3>
            <p className="text-[#4A3728]/60 mb-6">
              {searchQuery
                ? `Tidak ada produk yang cocok dengan "${searchQuery}"`
                : 'Tidak ada produk dalam kategori ini'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="px-6 py-2.5 bg-[#FFF8E7] text-[#4A3728] font-medium rounded-lg hover:bg-[#F4C480]/20 transition-colors border border-[#F4C480]/30"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                category={product.category}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#4A3728] text-[#FFF8E7]/80 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2025 Keluarga Pekong. Designed and developed for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
