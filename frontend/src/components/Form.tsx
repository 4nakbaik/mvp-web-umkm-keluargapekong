import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../service/api';
import { useAuthStore } from '../hooks/useAuthStore';
import PasswordInvalid from './PasswordInvalid';
import Button from './Button';
import Logo from '../assets/Logo.png';
import BgForm from '../assets/Background/BackgroundForm.jpg';

type FormProps = {
  variant: 'register' | 'login';
};

export default function Form({ variant }: FormProps) {
  const navigate = useNavigate();
  const isLogin = variant === 'login';

  // ambil state dan action dari authStote
  const {
    name,
    setName,
    email,
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    generalError,
    isLoading,
    isAuthenticated,
    isAdmin,
    setEmail,
    setPassword,
    setConfirmPassword,
    setPasswordError,
    setGeneralError,
    validatePassword,
    validateConfirmPassword,
    setIsLoading,
    login,
    resetForm,
  } = useAuthStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setGeneralError(null);

    // validasi password
    const isPasswordValid = validatePassword(password);

    // validasi confirm password
    if (!isLogin) {
      const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);
      if (!isPasswordValid || !isConfirmPasswordValid) {
        return;
      }
    } else {
      if (!isPasswordValid) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = isLogin
        ? await api.login({ email, password })
        : await api.register({ name, email, password });

      const data = result.data || result;

      // simpan token dan user data ke local
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      // Update store dan navigate
      login({
        id: data.id,
        name: data.name,
        email: data.email || email,
        token: data.token,
        role: data.role,
      });

      // Redirect berdasarkan role
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'STAFF') {
        navigate('/staff/products');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      if (error.response) {
        // Error dari backend (400, 401, 500, dll)
        const message = error.response.data?.message || 'Login gagal';
        if (
          message.toLowerCase().includes('password') ||
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('incorrect')
        ) {
          setPasswordError(message);
        } else {
          setGeneralError(message);
        }
      } else {
        setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
      }
      console.error(`${isLogin ? 'Login' : 'Register'} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && isLogin) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/products');
      }
    }
  }, [isAuthenticated, isAdmin, isLogin, navigate]);

  React.useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const title = isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru';
  const subtitle = isLogin ? 'Masuk ke akun Anda' : 'Daftar untuk memulai';
  const buttonText = isLogin ? 'Masuk' : 'Daftar';
  const linkText = isLogin ? "Belum punya akun?" : 'Sudah punya akun?';
  const linkLabel = isLogin ? 'Daftar' : 'Masuk';
  const linkTo = isLogin ? '/register' : '/login';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f5f3f2] overflow-hidden select-none relative">
      {/* Background Image for Mobile/Tablet View (hidden on desktop) */}
      <div
        className="lg:hidden absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BgForm})` }}
      />
      {/* Dark Overlay with Blur for Mobile/Tablet View (hidden on desktop) */}
      <div className="lg:hidden absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Left Side: Visual/Hero panel (Visible on LG and up, full screen) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#5c4033] flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
        {/* Background image inside the panel */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 opacity-55"
          style={{ backgroundImage: `url(${BgForm})` }}
        />
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a12] via-[#5c4033]/60 to-transparent" />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-all hover:gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            RM Keluarga Pekong
          </h1>
          <p className="text-white/80 text-sm font-medium leading-relaxed max-w-md">
            Kelola operasional harian, transaksi kasir, manajemen produk, voucher, dan pantau performa bisnis dalam satu platform terintegrasi.
          </p>
        </div>
      </div>

      {/* Right Side: Form panel (Centers card on mobile/tablet, white panel on desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-transparent lg:bg-white p-4 sm:p-12 md:p-16 lg:p-24 flex items-center justify-center relative z-10">
        <div className="max-w-md w-full mx-auto bg-white/95 backdrop-blur-md lg:backdrop-blur-none lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-2xl shadow-xl lg:shadow-none border border-white/20 lg:border-none relative z-10">
          {/* Back Button for Mobile/Tablet */}
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-1 text-sm font-medium text-[#8d7970] hover:text-[#5c4033] transition-colors mb-6 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </Link>

          <div className="text-center mb-6 lg:mb-8">
            <div className="p-1 inline-flex items-center justify-center w-16 h-16 bg-[#fff6f1] rounded-2xl mb-4 border border-[#f5ebdf] shadow-sm">
              <img src={Logo} alt="RM Pekong Logo" className="w-full h-full object-cover rounded-xl" />
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#5c4033] tracking-tight">{title}</h2>
            <p className="text-[#8d7970] text-sm mt-1.5">{subtitle}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#5c4033] mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-white border border-[#beb3ad] rounded-lg focus:ring-2 focus:ring-[#5c4033] focus:border-[#5c4033] outline-none transition-colors text-[#5c4033] placeholder-[#beb3ad] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Nama lengkap Anda..."
                />
              </div>
            )}

            {generalError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {generalError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#5c4033] mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white border border-[#beb3ad] rounded-lg focus:ring-2 focus:ring-[#5c4033] focus:border-[#5c4033] outline-none transition-colors text-[#5c4033] placeholder-[#beb3ad] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example123@gmail.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#5c4033]">
                  Kata Sandi
                </label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#8d7970] hover:text-[#5c4033]"
                  >
                    Lupa kata sandi?
                  </Link>
                )}
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 bg-white border border-[#beb3ad] rounded-lg focus:ring-2 focus:ring-[#5c4033] focus:border-[#5c4033] outline-none transition-colors text-[#5c4033] placeholder-[#beb3ad] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              {passwordError && <PasswordInvalid message={passwordError} />}
            </div>

            {/* Only show confirmPassword for register */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#5c4033] mb-2"
                >
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white border border-[#beb3ad] rounded-lg focus:ring-2 focus:ring-[#5c4033] focus:border-[#5c4033] outline-none transition-colors text-[#5c4033] placeholder-[#beb3ad] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                {confirmPasswordError && <PasswordInvalid message={confirmPasswordError} />}
              </div>
            )}

            <Button
              type="submit"
              text={isLoading ? 'Memuat...' : buttonText}
              variant="staffSubmit"
              disabled={isLoading}
            />
          </form>

          <p className="text-center text-sm text-[#8d7970] mt-6">
            {linkText}{' '}
            <Link to={linkTo} className="font-medium text-[#5c4033] hover:text-[#7a5e51]">
              {linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
