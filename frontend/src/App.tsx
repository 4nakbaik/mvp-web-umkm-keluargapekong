import { Routes, Route } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import Homepage from './page/Homepage';
import AdminLogin from './page/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './page/admin/Dashboard';
import Products from './page/admin/Products';
import ProtectedRoute from './components/ProtectedRoute';
import StaffLayout from './components/staff/StaffLayout';
import StaffProducts from './page/staff/StaffProducts';
import StaffOrders from './page/staff/StaffOrders';
import StaffMembership from './page/staff/StaffMembership';

function App() {
  return (
    <div className="h-screen">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Routes - Protected untuk role STAFF dan ADMIN */}
        <Route element={<ProtectedRoute requireStaff redirectTo="/login" />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="products" element={<StaffProducts />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="membership" element={<StaffMembership />} />
          </Route>
        </Route>

        {/* Admin Routes - Protected dengan double layer security */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute requireAdmin redirectTo="/admin/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
