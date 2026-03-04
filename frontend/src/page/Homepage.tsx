import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../service/api';
import { Card } from '../components/Card';
import { useSearchStore } from '../hooks/useSearchStore';
import Banner from '../assets/banner.png';
import Logo from '../assets/Logo.png';

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
    <div className="min-h-screen bg-[#f8faf7]">
      <Navbar />

      {/* Hero */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div
          className="w-full h-56 sm:h-72 lg:h-100 bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden shadow-md"
          style={{ backgroundImage: `url(${Banner})` }}
        />
      </section>

      {/* Products */}
      <section ref={productsSectionRef} className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4B5945]">Menu Kami</h2>
            <p className="text-[#66785F]/70 text-sm mt-1">
              {filteredProducts.length} produk
              {categoryFilter !== 'all' &&
                ` dalam ${CATEGORIES.find((c) => c.value === categoryFilter)?.label}`}
              {query && ` untuk "${query}"`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setFilterOpen(false);
                }}
                className="interactive-btn flex items-center gap-2 px-4 py-2.5 bg-white border border-[#4B5945]/10 rounded-xl text-sm font-medium text-[#4B5945] hover:border-[#91AC8F] hover:shadow-sm cursor-pointer transition-all"
              >
                <svg
                  className="w-4 h-4 text-[#66785F]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span className="hidden sm:inline">Sort</span>
                <svg
                  className={`w-3.5 h-3.5 text-[#66785F]/50 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {sortOpen && (
                <div className="animate-slide-down absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#4B5945]/5 py-1 z-40 overflow-hidden">
                  {SORT_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className="animate-stagger-in w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#f0f5ee] cursor-pointer flex items-center justify-between"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span
                        className={
                          sortBy === opt.value ? 'text-[#4B5945] font-semibold' : 'text-[#66785F]'
                        }
                      >
                        {opt.label}
                      </span>
                      {sortBy === opt.value && (
                        <svg
                          className="w-4 h-4 text-[#4B5945]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => {
                  setFilterOpen(!filterOpen);
                  setSortOpen(false);
                }}
                className="interactive-btn flex items-center gap-2 px-4 py-2.5 bg-white border border-[#4B5945]/10 rounded-xl text-sm font-medium text-[#4B5945] hover:border-[#91AC8F] hover:shadow-sm cursor-pointer transition-all"
              >
                <svg
                  className="w-4 h-4 text-[#66785F]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="hidden sm:inline">Filter</span>
                {categoryFilter !== 'all' && (
                  <span className="w-5 h-5 flex items-center justify-center bg-[#4B5945] text-white text-[10px] font-bold rounded-full">
                    1
                  </span>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-[#66785F]/50 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {filterOpen && (
                <div className="animate-slide-down absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#4B5945]/5 py-1 z-40 overflow-hidden">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategoryFilter(cat.value);
                        setFilterOpen(false);
                      }}
                      className="animate-stagger-in w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#f0f5ee] cursor-pointer flex items-center justify-between"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span
                        className={
                          categoryFilter === cat.value
                            ? 'text-[#4B5945] font-semibold'
                            : 'text-[#66785F]'
                        }
                      >
                        {cat.label}
                      </span>
                      {categoryFilter === cat.value && (
                        <svg
                          className="w-4 h-4 text-[#4B5945]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden animate-pulse border border-[#4B5945]/5"
              >
                <div className="w-full h-48 bg-[#eef2ed]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#eef2ed] rounded w-3/4" />
                  <div className="h-3 bg-[#eef2ed] rounded w-1/2" />
                  <div className="h-3 bg-[#eef2ed] rounded w-2/3" />
                  <div className="h-3 bg-[#eef2ed] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#4B5945]/5">
            <svg
              className="w-16 h-16 mx-auto text-[#91AC8F]/40 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-bold text-[#4B5945] mb-2">Produk tidak ditemukan</h3>
            <p className="text-sm text-[#66785F]/60 mb-6">
              {query
                ? `Tidak ada produk yang cocok dengan "${query}"`
                : 'Tidak ada produk dalam kategori ini'}
            </p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSortBy('default');
              }}
              className="interactive-btn px-6 py-2.5 bg-[#f0f5ee] text-[#4B5945] font-medium rounded-xl hover:bg-[#B2C9AD]/30 transition-colors border border-[#91AC8F]/30 cursor-pointer"
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
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Card
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    category={product.category}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl border border-[#4B5945]/10 bg-white text-[#66785F] hover:border-[#91AC8F] hover:text-[#4B5945] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {getPageNumbers().map((page, i) =>
                  page === '...' ? (
                    <span
                      key={`dots-${i}`}
                      className="w-10 h-10 flex items-center justify-center text-[#66785F]/50 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`interactive-btn w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#4B5945] text-white shadow-md'
                          : 'bg-white border border-[#4B5945]/10 text-[#66785F] hover:border-[#91AC8F] hover:text-[#4B5945]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl border border-[#4B5945]/10 bg-white text-[#66785F] hover:border-[#91AC8F] hover:text-[#4B5945] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#4B5945] text-[#f0f5ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <img src={Logo} alt="Logo" className="w-6 h-6" />
                </div>
                <span className="text-lg font-bold tracking-wide">PEKONGFAM</span>
              </div>
              <p className="text-sm text-[#B2C9AD]/80 leading-relaxed max-w-xs">
                Keluarga Pekong menyajikan hidangan terbaik dengan cita rasa autentik. Nikmati
                pengalaman kuliner yang tak terlupakan bersama keluarga.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#91AC8F]">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {['Home', 'Menu', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="link-underline text-sm text-[#B2C9AD]/80 hover:text-white transition-colors duration-200 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informasi */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#91AC8F]">
                Informasi
              </h4>
              <ul className="space-y-2.5">
                {['Terms & Conditions', 'Privacy Policy', 'FAQ', 'Support'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="link-underline text-sm text-[#B2C9AD]/80 hover:text-white transition-colors duration-200 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#91AC8F]">
                Social Links
              </h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl bg-[#66785F] text-[#B2C9AD] hover:bg-[#91AC8F] hover:text-[#4B5945] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl bg-[#66785F] text-[#B2C9AD] hover:bg-[#91AC8F] hover:text-[#4B5945] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl bg-[#66785F] text-[#B2C9AD] hover:bg-[#91AC8F] hover:text-[#4B5945] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="interactive-btn w-10 h-10 flex items-center justify-center rounded-xl bg-[#66785F] text-[#B2C9AD] hover:bg-[#91AC8F] hover:text-[#4B5945] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
              <div className="mt-6">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#91AC8F] mb-2">
                  Jam Operasional
                </h5>
                <p className="text-sm text-[#B2C9AD]/70">Senin - Minggu</p>
                <p className="text-sm text-[#B2C9AD]/70">08:00 - 22:00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#66785F]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-[#B2C9AD]/50">
              © 2025 Keluarga Pekong. All rights reserved.
            </p>
            <p className="text-xs text-[#B2C9AD]/50">Designed with ♥ for educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
