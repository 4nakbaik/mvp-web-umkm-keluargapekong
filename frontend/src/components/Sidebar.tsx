import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  panelTitle: string;
  panelSubtitle?: string;
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
  variant: 'admin' | 'staff';
}

const colorSchemes = {
  admin: {
    // Grayscale palette
    bgGradient: 'bg-[#1a1a1e]',
    activeItem: 'bg-white/15 text-white shadow-lg shadow-black/30',
    hoverItem: 'hover:bg-white/10 hover:text-white',
    textPrimary: 'text-[#e5e5e8]',
    textSecondary: 'text-[#b5b5ba]/80',
    textMuted: 'text-[#9e9ea3]/60',
    accentBorder: 'border-[#6e6e73]/30',
    avatarBg: 'bg-[#555559]',
    logoutHover: 'hover:bg-red-500/20 hover:text-red-300',
    toggleBg: 'hover:bg-white/10',
    activeDot: 'bg-[#c8c8cc]',
    divider: 'border-white/10',
  },
  staff: {
    // Warm brown/taupe palette
    bgGradient: 'bg-[#5c4033]',
    activeItem: 'bg-white/15 text-white shadow-lg shadow-[#5c4033]/30',
    hoverItem: 'hover:bg-white/10 hover:text-white',
    textPrimary: 'text-[#efeceb]',
    textSecondary: 'text-[#cec6c2]/80',
    textMuted: 'text-[#beb3ad]/60',
    accentBorder: 'border-[#9d8c85]/30',
    avatarBg: 'bg-[#8d7970]',
    logoutHover: 'hover:bg-red-500/20 hover:text-red-300',
    toggleBg: 'hover:bg-white/10',
    activeDot: 'bg-[#ded9d6]',
    divider: 'border-white/10',
  },
};

export default function Sidebar({
  navItems,
  panelTitle,
  panelSubtitle = 'Keluarga Pekong',
  user,
  onLogout,
  variant,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const colors = colorSchemes[variant];

  return (
    <aside
      className={`${colors.bgGradient} flex flex-col transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Header area + Profile */}
      <div className={`border-b ${colors.divider}`}>
        {/* Toggle + Title row */}
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4`}
        >
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-wide truncate">{panelTitle}</h1>
              <p className={`text-xs ${colors.textSecondary} truncate`}>{panelSubtitle}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded ${colors.toggleBg} text-white/80 transition-colors duration-200 flex-shrink-0`}
            title={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </button>
        </div>

        {/* Profile section */}
        <div className={`flex flex-col items-center ${isCollapsed ? 'px-2 pb-3' : 'px-4 pb-5'}`}>
          {/* Large avatar */}
          <div
            className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full ${colors.avatarBg} flex items-center justify-center text-white shadow-lg transition-all duration-300`}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          {/* Name & Email */}
          {!isCollapsed && (
            <div className="mt-3 text-center w-full overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || (variant === 'admin' ? 'Admin' : 'Staff')}
              </p>
              <p className={`text-xs ${colors.textMuted} truncate mt-0.5`}>{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 px-3 py-3 rounded transition-all duration-200 relative ${
                    isActive ? colors.activeItem : `${colors.textSecondary} ${colors.hoverItem}`
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${colors.activeDot} rounded-r-full`}
                    />
                  )}
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {!isCollapsed && (
                    <span
                      className={`text-sm font-medium truncate transition-opacity duration-200`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - Logout only */}
      <div className={`p-3 border-t ${colors.divider}`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 ${colors.textSecondary} ${colors.logoutHover} rounded transition-all duration-200`}
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
  );
}
