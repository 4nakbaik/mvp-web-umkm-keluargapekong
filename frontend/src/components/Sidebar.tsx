import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.png';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  variant: 'admin' | 'staff';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  navItems: NavItem[];
}

export default function Sidebar({
  variant,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  navItems,
}: SidebarProps) {
  const location = useLocation();

  const isAdmin = variant === 'admin';
  const panelLabel = isAdmin ? 'Admin Panel' : 'Staff Panel';
  const activeLinkClass = isAdmin
    ? 'bg-[#1a1a1e] text-white shadow-lg shadow-[#1a1a1e]/20'
    : 'bg-[#5c4033] text-white shadow-lg shadow-[#5c4033]/20';
  const hoverLinkClass = isAdmin
    ? 'hover:text-[#1a1a1e]'
    : 'hover:text-[#5c4033]';

  return (
    <>
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
                <p className={`text-sm font-bold truncate leading-tight ${isAdmin ? 'text-[#1a1a1e]' : 'text-[#5c4033]'}`}>
                  Keluarga Pekong
                </p>
                <p className="text-[10px] text-slate-400 truncate">{panelLabel}</p>
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
                      } ${isActive ? activeLinkClass : `text-slate-500 hover:bg-[#f5f3f2] ${hoverLinkClass}`}`}
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

        {/* Section 3 — Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-2 py-3 flex-shrink-0">
          {/* Collapse/Expand toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-[#f5f3f2] ${hoverLinkClass} transition-all duration-200 ${
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
        </div>
      </aside>
    </>
  );
}
