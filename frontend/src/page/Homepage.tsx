import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSlideshow from '../components/HeroSlideshow';
import Footer from '../components/Footer';
import { api } from '../service/api';
import { Card } from '../components/Card';
import { useSearchStore } from '../hooks/useSearchStore';
import AddToCartModal from '../components/AddToCartModal';
import Lenis from 'lenis';

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
  { value: 'all', label: 'Semua' },
  { value: 'MAKANAN', label: 'Makanan' },
  { value: 'MINUMAN', label: 'Minuman' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'JASA', label: 'Jasa' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Harga: Rendah → Tinggi' },
  { value: 'price-desc', label: 'Harga: Tinggi → Rendah' },
  { value: 'name-asc', label: 'Nama: A → Z' },
  { value: 'name-desc', label: 'Nama: Z → A' },
];

const PRODUCTS_PER_PAGE = 8;

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Modal state for Add to Cart
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const { query, setProducts: setSearchProducts } = useSearchStore();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      const data = res.data || [];
      setProducts(data);
      setSearchProducts(data);
    } catch (error) {
      console.error('Error fetching Product', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize Lenis smooth scroll
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Recalculate Lenis scroll dimensions when DOM content changes
  useEffect(() => {
    if (lenisRef.current) {
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [products, loading, currentPage, categoryFilter, sortBy, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sortBy, query]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-[#fcf9f8] text-[#1c1b1b] selection:bg-[#4a4a4a] selection:text-white">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-[100px] md:pt-[120px] px-5 md:px-16 max-w-[1440px] mx-auto w-full pb-12">
        {/* Hero */}
        <HeroSlideshow
          onExploreClick={() =>
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />

        {/* Menu Section */}
        <section ref={productsSectionRef} className="mt-[120px] mb-[120px]">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#c4c7c7]/20 pb-6 gap-4">
            <div>
              <h2 className="font-['Epilogue'] text-[32px] leading-[1.3] font-semibold text-[#1c1b1b]">
                Menu Kami
              </h2>
              <p className="font-['Inter'] text-base leading-[1.6] text-[#5d5f5d] mt-2">
                Discover our selection of refined dishes and beverages.
                {filteredProducts.length > 0 && (
                  <span className="ml-1 text-[#747878]">
                    ({filteredProducts.length} produk
                    {categoryFilter !== 'all' &&
                      ` dalam ${CATEGORIES.find((c) => c.value === categoryFilter)?.label}`}
                    {query && ` untuk "${query}"`})
                  </span>
                )}
              </p>
            </div>

            {/* Filter & Sort controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => {
                    setSortOpen(!sortOpen);
                    setFilterOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">sort</span>
                  <span className="hidden sm:inline">Sort</span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>
                {sortOpen && (
                  <div className="animate-slide-down absolute right-0 mt-2 w-56 bg-white border border-[#c4c7c7]/30 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="flex flex-col py-1">
                      {SORT_OPTIONS.map((opt, i) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className="animate-stagger-in w-full text-left px-4 py-2 font-['Inter'] text-base text-[#1c1b1b] hover:bg-[#f6f3f2] transition-colors flex items-center justify-between cursor-pointer"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <span
                            className={
                              sortBy === opt.value ? 'text-[#4a4a4a] font-semibold' : ''
                            }
                          >
                            {opt.label}
                          </span>
                          {sortBy === opt.value && (
                            <span className="material-symbols-outlined text-[16px] text-[#4a4a4a]">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div ref={filterRef} className="relative group">
                <button
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors cursor-pointer"
                >
                  <span>Filter</span>
                  {categoryFilter !== 'all' && (
                    <span className="w-5 h-5 flex items-center justify-center bg-[#4a4a4a] text-white text-[10px] font-bold rounded-full">
                      1
                    </span>
                  )}
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>
                {filterOpen && (
                  <div className="animate-slide-down absolute right-0 mt-2 w-48 bg-white border border-[#c4c7c7]/30 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="flex flex-col py-1">
                      {CATEGORIES.map((cat, i) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setCategoryFilter(cat.value);
                            setFilterOpen(false);
                          }}
                          className="animate-stagger-in w-full text-left px-4 py-2 font-['Inter'] text-base text-[#1c1b1b] hover:bg-[#f6f3f2] transition-colors flex items-center justify-between cursor-pointer"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <span
                            className={
                              categoryFilter === cat.value
                                ? 'text-[#4a4a4a] font-semibold'
                                : ''
                            }
                          >
                            {cat.label}
                          </span>
                          {categoryFilter === cat.value && (
                            <span className="material-symbols-outlined text-[16px] text-[#4a4a4a]">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden animate-pulse border border-[#c4c7c7]/10"
                >
                  <div className="w-full aspect-[4/3] bg-[#eae7e7]" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-[#eae7e7] rounded w-3/4" />
                    <div className="h-4 bg-[#eae7e7] rounded w-1/2" />
                    <div className="h-4 bg-[#eae7e7] rounded w-2/3" />
                    <div className="h-10 bg-[#eae7e7] rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-[#c4c7c7]/10">
              <span className="material-symbols-outlined text-[64px] text-[#c4c7c7]/40 mb-4 block">
                search_off
              </span>
              <h3 className="text-lg font-bold text-[#1c1b1b] mb-2 font-['Epilogue']">
                Produk tidak ditemukan
              </h3>
              <p className="text-sm text-[#5d5f5d]/60 mb-6 font-['Inter']">
                {query
                  ? `Tidak ada produk yang cocok dengan "${query}"`
                  : 'Tidak ada produk dalam kategori ini'}
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setSortBy('default');
                }}
                className="px-6 py-2.5 bg-[#f0eded] text-[#1c1b1b] font-medium rounded-lg hover:bg-[#eae7e7] transition-colors border border-[#c4c7c7]/30 cursor-pointer font-['Inter']"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`animate-fade-in-up ${index === 0 ? 'md:col-span-2' : ''}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <Card
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      stock={product.stock}
                      imageUrl={product.imageUrl}
                      category={product.category}
                      featured={index === 0}
                      onAddToCart={() => handleOpenModal(product)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, i) =>
                      page === '...' ? (
                        <span
                          key={`dots-${i}`}
                          className="w-10 h-10 flex items-center justify-center text-[#5d5f5d]/50 text-sm"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`w-10 h-10 rounded-lg font-['Inter'] text-base flex items-center justify-center transition-all cursor-pointer ${
                            currentPage === page
                              ? 'bg-[#4a4a4a] text-white shadow-sm'
                              : 'border border-[#c4c7c7] text-[#1c1b1b] hover:bg-[#f0eded]'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Add to Cart Modal */}
      <AddToCartModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
