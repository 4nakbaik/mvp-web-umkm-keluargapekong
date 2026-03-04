import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSearchStore } from '../hooks/useSearchStore';
import ProfileDropdown from './ProfileDropdown';
import Logo from '../assets/Logo.png';
import { getImageUrl } from '../utils/imageHelper';

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const { query, setQuery, products } = useSearchStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const matchedProducts = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToProduct = (productId: string) => {
    setShowResults(false);
    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#91AC8F]', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#91AC8F]', 'ring-offset-2');
        }, 1500);
      }
    }, 100);
  };

  return (
    <nav className="bg-white shadow-[0_2px_16px_rgba(75,89,69,0.06)] px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center sticky top-0 z-50 transition-shadow duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-[#91AC8F]/40 transition-all duration-300 group-hover:border-[#91AC8F] group-hover:shadow-md">
          <img
            src={Logo}
            alt="RM Pekong Logo"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <h1 className="text-lg font-bold text-[#4B5945] tracking-wide transition-colors duration-200 group-hover:text-[#66785F] hidden sm:block">
          PEKONGFAM
        </h1>
      </Link>

      {/* Search Bar */}
      <div ref={searchRef} className="flex-1 max-w-lg mx-4 sm:mx-6 relative">
        <div
          className={`relative w-full transition-all duration-300 ${
            searchFocused ? 'scale-[1.02]' : ''
          }`}
        >
          <svg
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
              searchFocused ? 'text-[#66785F]' : 'text-[#4B5945]/35'
            }`}
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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              setSearchFocused(true);
              if (query.trim()) setShowResults(true);
            }}
            onBlur={() => setSearchFocused(false)}
            placeholder="Cari menu favorit..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-full text-sm text-[#4B5945] placeholder-[#4B5945]/35 border-2 transition-all duration-300 outline-none ${
              searchFocused
                ? 'border-[#91AC8F] shadow-[0_0_0_3px_rgba(145,172,143,0.15)] bg-white'
                : 'border-[#4B5945]/10 bg-[#f5f8f4] hover:border-[#91AC8F]/50'
            }`}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5945]/35 hover:text-[#4B5945] transition-colors cursor-pointer"
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

        {/* Search Results Dropdown */}
        {showResults && query.trim() && (
          <div className="animate-slide-down absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#4B5945]/5 overflow-hidden z-50">
            {matchedProducts.length > 0 ? (
              <div className="py-2 max-h-80 overflow-y-auto">
                {matchedProducts.map((product, i) => (
                  <button
                    key={product.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      scrollToProduct(product.id);
                    }}
                    className="animate-stagger-in w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f0f5ee] transition-colors cursor-pointer text-left"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0f5ee] shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={getImageUrl(product.imageUrl)!}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center text-xs">🍽</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#4B5945]/20 text-xs">
                          🍽
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4B5945] truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#66785F]">
                        {formatPrice(product.price)} • {product.category}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-[#B2C9AD] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-[#66785F]/60">Tidak ada produk untuk "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth */}
      <div className="flex gap-2 items-center shrink-0">
        {isAuthenticated ? (
          <ProfileDropdown />
        ) : (
          <>
            <Link to="/register">
              <button className="interactive-btn px-4 py-2 text-sm font-semibold text-[#4B5945] bg-transparent border-2 border-[#91AC8F]/50 rounded-lg hover:bg-[#f0f5ee] hover:border-[#91AC8F] cursor-pointer">
                Register
              </button>
            </Link>
            <Link to="/login">
              <button className="interactive-btn px-4 py-2 text-sm font-semibold text-white bg-[#4B5945] rounded-lg hover:bg-[#66785F] cursor-pointer shadow-sm hover:shadow-md">
                Login
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
