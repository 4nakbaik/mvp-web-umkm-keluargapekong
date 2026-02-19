import { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useCartStore } from '../../hooks/useCartStore';
import { useToastStore } from '../../hooks/useToastStore';
import { api } from '../../service/api';
import Logo from '../../assets/Logo.png';

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

interface SearchMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [allMembers, setAllMembers] = useState<SearchMember[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch search data on mount
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [productsRes, membersRes] = await Promise.all([api.getProducts(), api.getCustomer()]);
        setAllProducts(productsRes.data || []);
        setAllMembers(membersRes.data || []);
      } catch (err) {
        console.error('Error fetching search data:', err);
      }
    };
    if (isAuthenticated) fetchSearchData();
  }, [isAuthenticated]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const getSearchResults = useCallback(() => {
    if (!searchQuery.trim()) return { products: [], members: [] };
    const q = searchQuery.toLowerCase();
    const products = allProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5);
    const members = allMembers
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q))
      )
      .slice(0, 5);
    return { products, members };
  }, [searchQuery, allProducts, allMembers]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/staff/products',
      label: 'Produk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      path: '/staff/membership',
      label: 'Membership',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      path: '/staff/cart',
      label: 'Keranjang',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
      ),
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f5f3f2] flex overflow-hidden">
      {/* ============ MOBILE BACKDROP ============ */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`bg-[#f5f3f2] flex flex-col gap-3 p-3 transition-all duration-300 ease-in-out flex-shrink-0
          ${isCollapsed ? 'w-[88px]' : 'w-[256px]'}
          fixed md:relative z-50 md:z-auto h-full
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Section 1 — Logo */}
        <div className="bg-white rounded-full shadow-sm border border-slate-100 px-3 py-3 flex-shrink-0">
          <div
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
          >
            <img
              src={Logo}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#5c4033] truncate leading-tight">
                  Keluarga Pekong
                </p>
                <p className="text-[10px] text-slate-400 truncate">Staff Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-y-auto">
          <nav className="py-3 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-[#5c4033] text-white shadow-lg shadow-[#5c4033]/20'
                          : 'text-slate-500 hover:bg-[#f5f3f2] hover:text-[#5c4033]'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Section 3 — Toggle + Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-2 py-3 space-y-1 flex-shrink-0">
          {/* Collapse/Expand toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-[#f5f3f2] hover:text-[#5c4033] transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
                />
              )}
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Tutup</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ============ MAIN AREA (Top Bar + Content) ============ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="my-3 mr-3 rounded-xl bg-white border-b border-slate-200/80 px-3 md:px-6 py-2 flex items-center justify-between flex-shrink-0 gap-2">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-[#f5f3f2] hover:text-[#5c4033] transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Global Search */}
          <div className="relative w-full max-w-xs md:max-w-md hidden sm:block" ref={searchRef}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchResults(true);
              }}
              placeholder="Cari produk atau member..."
              className="w-full pl-10 pr-4 py-2 bg-[#f5f3f2] border border-transparent rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c4033]/20 focus:border-[#5c4033]/30 transition-all"
            />

            {/* Search Results Dropdown */}
            {showSearchResults &&
              searchQuery.trim() &&
              (() => {
                const { products, members } = getSearchResults();
                const hasResults = products.length > 0 || members.length > 0;
                return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
                    {!hasResults ? (
                      <div className="py-8 text-center">
                        <svg
                          className="w-10 h-10 mx-auto text-slate-300 mb-2"
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
                        <p className="text-sm text-slate-400">
                          Tidak ditemukan untuk "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Products Section */}
                        {products.length > 0 && (
                          <div>
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <svg
                                  className="w-3.5 h-3.5"
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
                                Produk ({products.length})
                              </p>
                            </div>
                            {products.map((product) => (
                              <button
                                key={`p-${product.id}`}
                                onClick={() => {
                                  const success = addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    imageUrl: product.imageUrl,
                                    stock: product.stock,
                                  });
                                  if (success) {
                                    addToast(`${product.name} ditambahkan ke keranjang`, 'success');
                                  } else {
                                    addToast('Stok tidak mencukupi', 'error');
                                  }
                                  setSearchQuery('');
                                  setShowSearchResults(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf8f7] transition-colors text-left"
                              >
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <svg
                                      className="w-5 h-5 text-slate-300"
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
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-[#5c4033]">
                                      {formatPrice(product.price)}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      · Stok: {product.stock}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#5c4033] bg-[#efeceb] px-2 py-1 rounded-lg flex-shrink-0">
                                  <svg
                                    className="w-3.5 h-3.5"
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
                                  <span className="text-[10px] font-medium">Tambah</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Members Section */}
                        {members.length > 0 && (
                          <div>
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 border-t">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                Member ({members.length})
                              </p>
                            </div>
                            {members.map((member) => (
                              <button
                                key={`m-${member.id}`}
                                onClick={() => {
                                  navigate('/staff/membership');
                                  setSearchQuery('');
                                  setShowSearchResults(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf8f7] transition-colors text-left"
                              >
                                <div className="w-10 h-10 rounded-full bg-[#5c4033] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {member.phone || member.email || 'Tidak ada kontak'}
                                  </p>
                                </div>
                                <svg
                                  className="w-4 h-4 text-slate-300 flex-shrink-0"
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
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
          </div>

          {/* Right — Notification + Profile */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-6 flex-shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2.5 rounded-xl text-slate-400 hover:bg-[#f5f3f2] hover:text-[#5c4033] transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Notification dot */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              {/* Notification dropdown */}
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">Notifikasi</p>
                    </div>
                    <div className="py-6 text-center text-sm text-slate-400">
                      Tidak ada notifikasi baru
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-8 bg-slate-200 hidden md:block" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#f5f3f2] transition-all duration-200"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.name || 'Staff'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">Staff</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#5c4033] to-[#8d7970] flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {/* Profile dropdown */}
              {showProfileDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.name || 'Staff'}
                      </p>
                      <p className="text-xs text-slate-400">{user?.email || '-'}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ============ LOGOUT CONFIRMATION DIALOG ============ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Logout</h3>
              <p className="text-slate-500 mb-6">
                Apakah Anda yakin ingin keluar dari Staff Panel?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200"
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
