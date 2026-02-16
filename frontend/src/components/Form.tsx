import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../service/api';
import { useAuthStore } from '../hooks/useAuthStore';
import PasswordInvalid from './PasswordInvalid';
import Button from './Button';
import Logo from '../assets/Logo.png'

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

      // Cek apakah user adalah ADMIN
      if (data.role === 'ADMIN') {
        // Hapus token dan user dari local storage jika sudah tersimpan (meskipun belum tentu perlu, tapi untuk safety)
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setGeneralError('Akun Admin mohon login melalui halaman Admin (/admin/login)');
        setIsLoading(false);
        return;
      }

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
      if (data.role === 'STAFF') {
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
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const title = isLogin ? 'Welcome back' : 'Create your account';
  const subtitle = isLogin ? 'Sign in to your account' : 'Register to get started';
  const buttonText = isLogin ? 'Sign in' : 'Register';
  const linkText = isLogin ? "Don't have an account?" : 'Already have an account?';
  const linkLabel = isLogin ? 'Register' : 'Sign in';
  const linkTo = isLogin ? '/register' : '/login';

  return (
    <div className="min-h-screen bg-[#efeceb] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="p-1 inline-flex items-center justify-center w-15 h-15 bg-[#fff6f1] rounded-xl mb-4 border">
              <img src={Logo} alt="RM Pekong Logo" className="w-full h-full object-cover" />
            </div>

            <h2 className="text-2xl font-bold text-[#5c4033]">{title}</h2>
            <p className="text-[#8d7970] mt-2">{subtitle}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#5c4033] mb-2">
                  Name
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
                  placeholder="Your name..."
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
                Email address
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
                  Password
                </label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#8d7970] hover:text-[#5c4033]"
                  >
                    Forgot password?
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
                  Confirm Password
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
              text={isLoading ? 'Loading...' : buttonText}
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
