import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSearchStore } from '../hooks/useSearchStore';
import { useCartStore } from '../hooks/useCartStore';
import ProfileDropdown from './ProfileDropdown';
import { getImageUrl } from '../utils/imageHelper';
import Logo from '../assets/Logo.png';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const { query, setQuery, products } = useSearchStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll listener for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProduct = (productId: string) => {
    setShowResults(false);
    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#747878]', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#747878]', 'ring-offset-2');
        }, 1500);
      }
    }, 100);
  };

  return (
    <header
      id="top-nav"
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-5 md:px-16 max-w-[1440px] mx-auto left-0 right-0 glass-nav border-b border-[#c4c7c7]/20 transition-all duration-300 ${
        scrolled ? 'shadow-md py-3' : 'py-4'
      }`}
    >
      {/* Logo / Brand */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <img src={Logo} alt="RM Pekong Logo" className="w-13 h-13 object-contain shrink-0" />
        <span className="font-['Epilogue'] text-[32px] leading-[1.3] font-semibold tracking-tight text-[#4a4a4a] cursor-pointer">
          PEKONGFAM
        </span>
      </Link>

      {/* Spacer */}
      <div className="hidden md:flex flex-1 justify-center" />

      {/* Right side: Search + Auth */}
      <div className="flex items-center gap-4">
        {/* Expandable Search */}
        <div ref={searchRef} className="relative flex items-center">
          <div
            className={`flex items-center bg-[#f0eded] rounded-full transition-all duration-300 overflow-hidden border border-[#c4c7c7]/30 ${
              searchFocused ? 'w-64' : 'w-10 hover:w-64'
            }`}
          >
            <div
              className="flex items-center justify-center w-10 h-10 shrink-0 cursor-pointer text-[#444748]"
              onClick={() => setSearchFocused(true)}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
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
              placeholder="Search menu..."
              className="bg-transparent border-none focus:ring-0 font-['Inter'] text-base leading-[1.6] text-[#1c1b1b] w-0 group-hover:w-full pr-4 transition-all duration-300 outline-none flex-1"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && query.trim() && (
            <div className="animate-slide-down absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#c4c7c7]/30 overflow-hidden z-50 min-w-[280px]">
              {matchedProducts.length > 0 ? (
                <div className="py-2 max-h-80 overflow-y-auto">
                  {matchedProducts.map((product, i) => (
                    <button
                      key={product.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        scrollToProduct(product.id);
                      }}
                      className="animate-stagger-in w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f6f3f2] transition-colors cursor-pointer text-left"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0eded] shrink-0">
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
                          <div className="w-full h-full flex items-center justify-center text-[#4a4a4a]/20 text-xs">
                            🍽
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1c1b1b] truncate font-['Epilogue']">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#5d5f5d] font-['Inter']">
                          {formatPrice(product.price)} • {product.category}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-[#c4c7c7] shrink-0"
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
                  <p className="text-sm text-[#5d5f5d]/60 font-['Inter']">
                    Tidak ada produk untuk "{query}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Icon (STAFF only) + Auth Buttons */}
        <div className="flex items-center gap-2">
          {/* Cart icon — only visible for logged-in STAFF */}
          {isAuthenticated && (user?.role === 'STAFF' || user?.role === 'ADMIN') && (
            <button
              onClick={() => navigate('/staff/cart')}
              className="relative p-2 rounded-lg hover:bg-[#f0eded] transition-colors cursor-pointer"
              title="Keranjang"
            >
              <span className="material-symbols-outlined text-[22px] text-[#1c1b1b]">shopping_cart</span>
              {getItemCount() > 0 && (
                <span className="cart-badge-bounce absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                  {getItemCount() > 99 ? '99+' : getItemCount()}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link to="/register">
                <button className="px-4 py-2 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors cursor-pointer">
                  Register
                </button>
              </Link>
              <Link to="/login">
                <button className="bg-[#4a4a4a] text-white px-6 py-2 rounded-lg font-['Inter'] text-base hover:opacity-90 transition-opacity cursor-pointer">
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
