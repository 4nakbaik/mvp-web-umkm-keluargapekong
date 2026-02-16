import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../service/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import Logo from '../../assets/Logo.png'

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

      const data = result.data || result;

      if (data.token) {
        // Check if user is admin
        if (data.role !== 'ADMIN') {
          setGeneralError('Akses ditolak. Anda bukan admin.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));

        login({
          id: data.id,
          email: data.email,
          token: data.token,
          role: data.role,
          name: data.name,
        });

        navigate('/admin/dashboard');
      } else {
        setGeneralError(data.message || 'Login gagal');
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
    <div className="min-h-screen bg-[#1a1a1e] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="p-1 inline-flex items-center justify-center w-16 h-16 bg-[#6a6a6f] rounded mb-4 shadow-lg">
              <img src={Logo} alt="RM Pekong Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-[#e5e5e8]">Admin Login</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {generalError && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20">
                {generalError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#b5b5ba] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#e5e5e8] rounded focus:ring-2 focus:ring-[#555559] focus:border-[#555559] outline-none transition-all placeholder-[#9e9ea3]/50"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#b5b5ba] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#e5e5e8] rounded focus:ring-2 focus:ring-[#555559] focus:border-[#555559] outline-none transition-all placeholder-[#9e9ea3]/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#555559] text-white font-semibold rounded hover:bg-[#66666a] transition-all duration-200 shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#555559] focus:ring-offset-[#1a1a1e]"
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
