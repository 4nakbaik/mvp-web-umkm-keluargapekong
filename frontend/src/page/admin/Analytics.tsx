import { useEffect, useState, useMemo } from 'react';
import { api } from '../../service/api';
import { useToastStore } from '../../hooks/useToastStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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

// ============ AGGREGATION ============
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function getCashflowByMonth(orders: OrderData[], periodMonths: number) {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - periodMonths + 1, 1);

  const filtered = orders.filter((o) => new Date(o.createdAt) >= cutoff);

  const map = new Map<string, { pemasukan: number; pengeluaran: number }>();

  // Pre-populate all month keys so empty months appear on the axis
  for (let i = 0; i < periodMonths; i++) {
    const d = new Date(cutoff.getFullYear(), cutoff.getMonth() + i, 1);
    map.set(d.toISOString().slice(0, 7), { pemasukan: 0, pengeluaran: 0 });
  }

  filtered.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().slice(0, 7);
    const existing = map.get(key) ?? { pemasukan: 0, pengeluaran: 0 };
    existing.pemasukan += Number(order.totalAmount);
    // Estimate pengeluaran as cost of goods (70% of subtotal before discount)
    existing.pengeluaran += Number(order.subtotal) * 0.7;
    map.set(key, existing);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => {
      const [, month] = key.split('-');
      const label = MONTH_NAMES[parseInt(month) - 1];
      return {
        month: label,
        pemasukan: Math.round(data.pemasukan),
        pengeluaran: Math.round(data.pengeluaran),
        netCashflow: Math.round(data.pemasukan - data.pengeluaran),
      };
    });
}

// ============ CUSTOM TOOLTIP (dark-themed) ============
const CashflowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const formatRp = (v: number) =>
    `Rp ${new Intl.NumberFormat('id-ID').format(v)}`;

  return (
    <div
      style={{
        background: '#1a1a2e',
        borderRadius: 12,
        padding: '12px 16px',
        minWidth: 220,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{label}</p>
      {payload.map((entry: any) => (
        <p
          key={entry.dataKey}
          style={{ color: entry.color, fontSize: 13, fontWeight: 600, marginBottom: 4 }}
        >
          {entry.name} : {formatRp(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============
type Period = '1M' | '6M' | '1Y';

export default function Analytics() {
  const { addToast } = useToastStore();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState<Period>('6M');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await api.getOrders();
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const res = await api.exportStockMutationsExcel();

      const contentDisposition = res.headers ? res.headers['content-disposition'] : null;
      let filename = `Laporan_Stok_Analytics_${new Date().getTime()}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast('Laporan Excel berhasil diunduh', 'success');
    } catch (error) {
      console.error('Error exporting excel:', error);
      addToast('Gagal mengunduh laporan Excel', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ============ DERIVED STATE ============
  const periodMonths = period === '1M' ? 1 : period === '6M' ? 6 : 12;

  const cashflowData = useMemo(
    () => getCashflowByMonth(orders, periodMonths),
    [orders, periodMonths]
  );

  const kpi = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - periodMonths + 1, 1);
    const filtered = orders.filter((o) => new Date(o.createdAt) >= cutoff);

    const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscount = filtered.reduce((sum, o) => sum + Number(o.discountAmount), 0);

    return { totalRevenue, totalOrders, avgOrderValue, totalDiscount };
  }, [orders, periodMonths]);

  const periodOptions: { label: string; value: Period }[] = [
    { label: '1 Bulan', value: '1M' },
    { label: '6 Bulan', value: '6M' },
    { label: '1 Tahun', value: '1Y' },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-72"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
          <div className="h-72 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-h-screen overflow-y-auto">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1e]">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan performa bisnis Keluarga Pekong</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  period === opt.value
                    ? 'bg-[#36A2EB] text-white shadow-md'
                    : 'text-slate-500 hover:text-[#36A2EB] hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            title="Download Laporan Excel (Mutasi Stok)"
          >
            {exporting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="font-medium text-sm hidden sm:inline">
              {exporting ? 'Menyiapkan...' : 'Export Laporan'}
            </span>
          </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: 'bg-[#36A2EB]',
          },
          {
            label: 'Total Pesanan',
            value: kpi.totalOrders.toString(),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
            color: 'bg-[#9966FF]',
          },
          {
            label: 'Rata-rata Order',
            value: formatCompact(kpi.avgOrderValue),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            color: 'bg-[#4BC0C0]',
          },
          {
            label: 'Total Diskon',
            value: formatCompact(kpi.totalDiscount),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            ),
            color: 'bg-[#FF9F40]',
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

      {/* ============ CASHFLOW CHART ============ */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-[#1a1a1e] mb-1">Cashflow</h2>
        <p className="text-xs text-slate-400 mb-5">Pemasukan, pengeluaran & net cashflow per bulan</p>

        {cashflowData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-400">
            Belum ada data transaksi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashflowData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 11, fill: '#9e9ea3' }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip content={<CashflowTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              />
              <Line
                type="monotone"
                dataKey="pemasukan"
                name="Pemasukan"
                stroke="#4BC0C0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4BC0C0', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#4BC0C0' }}
              />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                name="Pengeluaran"
                stroke="#FF6384"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: '#FF6384', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FF6384' }}
              />
              <Line
                type="monotone"
                dataKey="netCashflow"
                name="Net Cashflow"
                stroke="#36A2EB"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#36A2EB', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#36A2EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
