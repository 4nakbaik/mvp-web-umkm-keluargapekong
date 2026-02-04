import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../service/api';
import { useAuthStore } from '../hooks/useAuthStore';
import PasswordInvalid from './PasswordInvalid';
import Button from './Button';

type FormProps = {
  variant: 'register' | 'login';
};

export default function Form({ variant }: FormProps) {
  const navigate = useNavigate();
  const isLogin = variant === 'login';

  // ambil state dan action dari authStote
  const {
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
        : await api.register({ email, password });

      if (result.token) {
        // simpan token dan user data ke local
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result));

        // Update store dan navigate
        login({
          id: result.id,
          email: result.email || email,
          token: result.token,
        });

        navigate('/');
      } else {
        // Handle error dari server
        const defaultError = isLogin ? 'Login gagal' : 'Registrasi gagal';
        const errorMessage = result.message || defaultError;

        if (
          errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('incorrect')
        ) {
          setPasswordError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('email')) {
          setGeneralError(errorMessage);
        } else {
          setGeneralError(errorMessage);
        }
      }
    } catch (error) {
      setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-400 rounded-xl mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {generalError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {generalError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example123@gmail.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              {passwordError && <PasswordInvalid message={passwordError} />}
            </div>

            {/* Only show confirmPassword for register */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                {confirmPasswordError && <PasswordInvalid message={confirmPasswordError} />}
              </div>
            )}

            <Button
              type="submit"
              text={isLoading ? 'Loading...' : buttonText}
              variant="formSubmit"
              disabled={isLoading}
            />
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {linkText}{' '}
            <Link to={linkTo} className="font-medium text-blue-600 hover:text-blue-500">
              {linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
