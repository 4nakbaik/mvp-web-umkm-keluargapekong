import { Routes, Route } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import Homepage from './page/Homepage';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './page/admin/Dashboard';
import Products from './page/admin/Products';
import Orders from './page/admin/Orders';
import Vouchers from './page/admin/Vouchers';
import Analytics from './page/admin/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import StaffLayout from './components/staff/StaffLayout';
import StaffProducts from './page/staff/StaffProducts';
import StaffMembership from './page/staff/StaffMembership';
import StaffVouchers from './page/staff/StaffVouchers';
import CartPage from './page/staff/CartPage';

import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <div className="min-h-screen">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Routes - Protected untuk role STAFF dan ADMIN */}
        <Route element={<ProtectedRoute requireStaff redirectTo="/login" />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="products" element={<StaffProducts />} />
            <Route path="membership" element={<StaffMembership />} />
            <Route path="vouchers" element={<StaffVouchers />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Route>

        {/* Admin Routes - Protected dengan double layer security */}
        <Route element={<ProtectedRoute requireAdmin redirectTo="/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="vouchers" element={<Vouchers />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
