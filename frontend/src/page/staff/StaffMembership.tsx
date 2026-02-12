import { useState, useEffect } from 'react';
import { api } from '../../service/api';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

export default function StaffMembership() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const fetchCustomers = async () => {
    try {
      const res = await api.getCustomer();
      setCustomers(res.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'No. HP minimal 10 digit';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(formData, editingCustomer.id);
      } else {
        await api.createCustomer({ ...formData, isMember: true });
      }
      setShowForm(false);
      setEditingCustomer(null);
      setFormData(initialFormData);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Membership</h1>
          <p className="text-slate-500 mt-1">Kelola data member pelanggan</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Member
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum ada member</h3>
          <p className="text-slate-500">
            Klik tombol "Tambah Member" untuk mendaftarkan member baru.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Member
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Kontak
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Alamat
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Terdaftar
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-slate-800">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{customer.phone || '-'}</p>
                      <p className="text-sm text-slate-500">{customer.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 max-w-xs truncate">{customer.address || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{formatDate(customer.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              {editingCustomer ? 'Edit Member' : 'Tambah Member Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Nama lengkap"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Alamat lengkap"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingCustomer ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
