import { useEffect, useState, useMemo } from 'react';
import { api } from '../../service/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============ TYPES ============
interface OrderData {
  id: string;
  code: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentType: string;
  createdAt: string;
  user?: { name: string };
  customer?: { name: string; isMember: boolean } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product: { name: string };
  }[];
  voucher?: { code: string } | null;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CustomerData {
  id: string;
  name: string;
  isMember: boolean;
  createdAt: string;
}

// ============ COLORS ============
const CHART_COLORS = [
  '#1a1a1e',
  '#555559',
  '#8B8B90',
  '#3d3d42',
  '#6e6e73',
  '#2a2a2e',
  '#9e9ea3',
  '#4a4a4e',
];

const PIE_COLORS = ['#1a1a1e', '#555559', '#8B8B90', '#b5b5ba', '#d8d8dc'];

const PAYMENT_COLORS: Record<string, string> = {
  CASH: '#1a1a1e',
  QRIS: '#555559',
  MBANKING: '#8B8B90',
  TRANSFER: '#6e6e73',
};

// ============ HELPERS ============
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

const formatDateShort = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// ============ AGGREGATION FUNCTIONS ============
function getRevenueByDay(orders: OrderData[], days: number | null) {
  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;

  const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

  const map = new Map<string, { revenue: number; orders: number }>();

  filtered.forEach((order) => {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
    const existing = map.get(dateKey) || { revenue: 0, orders: 0 };
    existing.revenue += Number(order.totalAmount);
    existing.orders += 1;
    map.set(dateKey, existing);
  });

  return Array.from(map.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getTopProducts(orders: OrderData[], days: number | null) {
  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;

  const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

  const map = new Map<string, { name: string; qty: number; revenue: number }>();

  filtered.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.product.name;
      const existing = map.get(key) || { name: key, qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.quantity * Number(item.price);
      map.set(key, existing);
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
}

function getCategoryRevenue(orders: OrderData[], products: ProductData[], days: number | null) {
  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;

  const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

  // Build product → category map
  const categoryMap = new Map<string, string>();
  products.forEach((p) => categoryMap.set(p.id, p.category));

  const result = new Map<string, { category: string; revenue: number; count: number }>();

  filtered.forEach((order) => {
    order.items.forEach((item) => {
      const cat = categoryMap.get(item.productId) || 'LAINNYA';
      const existing = result.get(cat) || { category: cat, revenue: 0, count: 0 };
      existing.revenue += item.quantity * Number(item.price);
      existing.count += item.quantity;
      result.set(cat, existing);
    });
  });

  return Array.from(result.values()).sort((a, b) => b.revenue - a.revenue);
}

function getPaymentDistribution(orders: OrderData[], days: number | null) {
  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;

  const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

  const map = new Map<string, { type: string; count: number; total: number }>();

  filtered.forEach((order) => {
    const type = order.paymentType || 'CASH';
    const existing = map.get(type) || { type, count: 0, total: 0 };
    existing.count += 1;
    existing.total += Number(order.totalAmount);
    map.set(type, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function getStaffPerformance(orders: OrderData[], days: number | null) {
  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;

  const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

  const map = new Map<string, { name: string; orders: number; revenue: number }>();

  filtered.forEach((order) => {
    const name = order.user?.name || 'Unknown';
    const existing = map.get(name) || { name, orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue += Number(order.totalAmount);
    map.set(name, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

function getCustomerGrowth(customers: CustomerData[]) {
  const map = new Map<string, { month: string; newCustomers: number; members: number }>();

  customers.forEach((c) => {
    const monthKey = new Date(c.createdAt).toISOString().slice(0, 7); // YYYY-MM
    const existing = map.get(monthKey) || { month: monthKey, newCustomers: 0, members: 0 };
    existing.newCustomers += 1;
    if (c.isMember) existing.members += 1;
    map.set(monthKey, existing);
  });

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// ============ CUSTOM TOOLTIP ============
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold text-[#1a1a1e]">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function Analytics() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number | null>(30); // 7, 30, null=all

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, customersRes] = await Promise.all([
          api.getOrders(),
          api.getProducts(),
          api.getCustomer(),
        ]);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ============ MEMOIZED AGGREGATIONS ============
  const revenueByDay = useMemo(() => getRevenueByDay(orders, period), [orders, period]);
  const topProducts = useMemo(() => getTopProducts(orders, period), [orders, period]);
  const categoryRevenue = useMemo(
    () => getCategoryRevenue(orders, products, period),
    [orders, products, period]
  );
  const paymentDist = useMemo(() => getPaymentDistribution(orders, period), [orders, period]);
  const staffPerf = useMemo(() => getStaffPerformance(orders, period), [orders, period]);
  const customerGrowth = useMemo(() => getCustomerGrowth(customers), [customers]);

  // KPI calculations
  const kpi = useMemo(() => {
    const now = new Date();
    const cutoff = period ? new Date(now.getTime() - period * 86400000) : null;
    const filtered = cutoff ? orders.filter((o) => new Date(o.createdAt) >= cutoff) : orders;

    const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscount = filtered.reduce((sum, o) => sum + Number(o.discountAmount), 0);

    return { totalRevenue, totalOrders, avgOrderValue, totalDiscount };
  }, [orders, period]);

  const periodOptions = [
    { label: '7 Hari', value: 7 },
    { label: '30 Hari', value: 30 },
    { label: 'Semua', value: null },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-72"></div>
        </div>
        {/* KPI skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="bg-white rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
          <div className="h-64 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
              <div className="h-52 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1e]">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan performa bisnis Keluarga Pekong</p>
        </div>
        {/* Period Filter */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
          {periodOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === opt.value
                  ? 'bg-[#1a1a1e] text-white shadow-md'
                  : 'text-slate-500 hover:text-[#1a1a1e] hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: formatCompact(kpi.totalRevenue),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            color: 'bg-[#1a1a1e]',
          },
          {
            label: 'Total Pesanan',
            value: kpi.totalOrders.toString(),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            ),
            color: 'bg-[#3d3d42]',
          },
          {
            label: 'Rata-rata Order',
            value: formatCompact(kpi.avgOrderValue),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ),
            color: 'bg-[#555559]',
          },
          {
            label: 'Total Diskon',
            value: formatCompact(kpi.totalDiscount),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            ),
            color: 'bg-[#8B8B90]',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`${card.color} p-2 rounded-lg text-white`}>{card.icon}</div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-[#1a1a1e]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ============ REVENUE TREND (Full Width) ============ */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Trend Revenue</h2>
        <p className="text-xs text-slate-400 mb-4">Pendapatan harian</p>
        {revenueByDay.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Belum ada data transaksi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a1a1e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1a1a1e"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#1a1a1e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ============ 2-COLUMN: Top Products + Category ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Top 5 Produk</h2>
          <p className="text-xs text-slate-400 mb-4">Berdasarkan quantity terjual</p>
          {topProducts.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9e9ea3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11, fill: '#6e6e73' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip formatter={(v: number) => `${v} item`} />} />
                <Bar dataKey="qty" name="Qty Terjual" radius={[0, 6, 6, 0]} barSize={20}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Revenue per Kategori</h2>
          <p className="text-xs text-slate-400 mb-4">Distribusi pendapatan</p>
          {categoryRevenue.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2">
                {categoryRevenue.map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    ></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1a1a1e] truncate">{cat.category}</p>
                      <p className="text-[10px] text-slate-400">{formatCompact(cat.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Distribution (Donut) */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Metode Pembayaran</h2>
          <p className="text-xs text-slate-400 mb-4">Distribusi per tipe</p>
          {paymentDist.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentDist}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {paymentDist.map((entry) => (
                      <Cell key={entry.type} fill={PAYMENT_COLORS[entry.type] || '#b5b5ba'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2">
                {paymentDist.map((pm) => (
                  <div key={pm.type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PAYMENT_COLORS[pm.type] || '#b5b5ba' }}
                    ></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1a1a1e]">{pm.type}</p>
                      <p className="text-[10px] text-slate-400">{pm.count} transaksi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Performa Staff</h2>
          <p className="text-xs text-slate-400 mb-4">Revenue per kasir</p>
          {staffPerf.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffPerf} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6e6e73' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCompact(v)}
                  tick={{ fontSize: 11, fill: '#9e9ea3' }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip content={<CustomTooltip formatter={(v: number) => formatCurrency(v)} />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} barSize={32}>
                  {staffPerf.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============ CUSTOMER GROWTH (Full Width) ============ */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Pertumbuhan Customer</h2>
        <p className="text-xs text-slate-400 mb-4">Customer baru & member per bulan</p>
        {customerGrowth.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Belum ada data customer
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="newCustomers"
                name="Customer Baru"
                stroke="#1a1a1e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1a1a1e', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="members"
                name="Member"
                stroke="#8B8B90"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#8B8B90', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
