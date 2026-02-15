import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import Button from './Button';
import ProfileDropdown from './ProfileDropdown';

import Logo from '../assets/Logo.png';

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-[#4A3728] shadow-md px-4 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white">
          <img src={Logo} alt="RM Pekong Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-lg font-bold text-[#FFF8E7]">PEKONGFAM</h1>
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
