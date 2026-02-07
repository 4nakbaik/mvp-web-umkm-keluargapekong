import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Komponen untuk melindungi route yang memerlukan autentikasi
 * @param requireAdmin - jika true, hanya admin yang bisa akses
 * @param redirectTo - URL redirect jika tidak autentikasi (default: /login)
 */
export default function ProtectedRoute({
  requireAdmin = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Jika tidak login, redirect ke halaman login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Jika memerlukan admin tapi user bukan admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render child routes
  return <Outlet />;
}
