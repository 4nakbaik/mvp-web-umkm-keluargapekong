import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import Button from './Button';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-white shadow-md px-4 py-2 flex justify-between items-center rounded-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-400 rounded-md flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h1 className="text-base font-bold text-gray-900">UMKM Pekong</h1>
      </Link>

      <div className="flex gap-2 items-center">
        {isAuthenticated ? (
          <ProfileDropdown />
        ) : (
          <>
            <Link to="/register">
              <Button text="Register" variant="register" type="button" disabled={false} />
            </Link>
            <Link to="/login">
              <Button text="Login" variant="login" type="button" disabled={false} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
