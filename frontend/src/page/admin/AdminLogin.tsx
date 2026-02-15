import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../service/api';
import { useAuthStore } from '../../hooks/useAuthStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const {
    email,
    password,
    generalError,
    isLoading,
    isAuthenticated,
    isAdmin,
    setEmail,
    setPassword,
    setGeneralError,
    setIsLoading,
    login,
  } = useAuthStore();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsLoading(true);

    try {
      const result = await api.login({ email, password });

      if (result.token) {
        // Check if user is admin
        if (result.role !== 'ADMIN') {
          setGeneralError('Akses ditolak. Anda bukan admin.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result));

        login({
          id: result.id,
          email: result.email,
          token: result.token,
          role: result.role,
          name: result.name,
        });

        navigate('/admin/dashboard');
      } else {
        setGeneralError(result.message || 'Login gagal');
      }
    } catch (error: any) {
      if (error.response) {
        setGeneralError(error.response.data?.message || 'Login gagal');
      } else {
        setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
      }
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-400 to-sky-500 rounded mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">Admin Login</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {generalError && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20">
                {generalError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-white/5 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-white/5 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Masuk ke Admin Panel'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Kembali ke Homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
