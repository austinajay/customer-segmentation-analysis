import React, { useState, useMemo } from 'react';
import analyticsData from './data/analytics_data.json';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
  Award,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  Globe2,
  Package,
  Sliders,
  CheckCircle2,
  Info,
  ArrowUpRight
} from 'lucide-react';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('All');
  const [selectedTierFilter, setSelectedTierFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Simulator States
  const [reactivationRate, setReactivationRate] = useState(10);
  const [championBoost, setChampionBoost] = useState(5);

  const { kpis, segments, monthly_trends, country_breakdown, top_products, rfm_grid, customers, metadata } = analyticsData;

  // Format currency
  const formatCurrency = (num) => {
    if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}k`;
    return `₹${num.toFixed(2)}`;
  };

  // Filtered customers for explorer
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        searchQuery === '' ||
        c.id.toString().includes(searchQuery) ||
        c.c.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSegment = selectedSegmentFilter === 'All' || c.s === selectedSegmentFilter;
      const matchTier = selectedTierFilter === 'All' || c.t === selectedTierFilter;
      return matchSearch && matchSegment && matchTier;
    });
  }, [customers, searchQuery, selectedSegmentFilter, selectedTierFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  // Simulator math
  const atRiskSegment = segments.find((s) => s.name === 'At Risk') || { total_revenue: 2024532 };
  const championsSegment = segments.find((s) => s.name === 'Champions') || { total_revenue: 12087432 };

  const recoveredRevenue = (atRiskSegment.total_revenue * (reactivationRate / 100));
  const boostedRevenue = (championsSegment.total_revenue * (championBoost / 100));
  const totalSimulatedUplift = recoveredRevenue + boostedRevenue;
  const upliftPercentage = ((totalSimulatedUplift / kpis.total_revenue) * 100).toFixed(2);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['CustomerID', 'Recency_Days', 'Frequency_Orders', 'Monetary_INR', 'Country', 'RFM_Score', 'Segment', 'Segment_Tier'];
    const rows = filteredCustomers.map(c => [c.id, c.r, c.f, c.m, `"${c.c}"`, c.rfm, `"${c.s}"`, `"${c.t}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_segments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xl">🛍️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Customer Segmentation & RFM Analytics
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Executive Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                E-Commerce Cohort Segmentation • Behavioral Retention Modeling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>
            <a
              href="https://github.com/austinajay"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>austinajay</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portfolio Project by Austin Ajay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Data-Driven Customer Lifetime Value & Behavioral RFM Analysis
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Analyzed 805,549 transactions and 5,878 customers from the UK Online Retail dataset.
              Engineered RFM scores to uncover retention vulnerabilities, VIP revenue concentration, and ₹2.02M in churn-preventable revenue.
            </p>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatCurrency(kpis.total_revenue)}
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>₹17,743,429.18</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Customers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {kpis.total_customers.toLocaleString()}
            </div>
            <div className="text-xs text-indigo-400 font-medium mt-1">
              <span>{kpis.repeat_rate}% repeat buyers</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg Order Value</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ₹{kpis.avg_order_value.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>across {kpis.total_orders.toLocaleString()} orders</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Champions Share</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {kpis.champions_revenue_share}%
            </div>
            <div className="text-xs text-purple-400 font-medium mt-1">
              <span>from 22.0% customer base</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-900/40 bg-rose-950/20 hover:border-rose-800 transition col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-rose-300 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">At-Risk Revenue</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-200 tracking-tight">
              {formatCurrency(kpis.at_risk_revenue)}
            </div>
            <div className="text-xs text-rose-400 font-medium mt-1">
              <span>{kpis.at_risk_customers.toLocaleString()} dormant clients</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-800 flex items-center gap-2 sm:gap-6 overflow-x-auto pb-px text-sm">
          {[
            { id: 'overview', label: 'Segment Breakdown', icon: Layers },
            { id: 'rfm_deepdive', label: 'RFM 5x5 Matrix', icon: BarChart3 },
            { id: 'trends', label: 'Trends & International', icon: Globe2 },
            { id: 'simulator', label: 'Revenue Simulator', icon: Sliders },
            { id: 'explorer', label: 'Customer Directory', icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-between">
                  <span>Revenue Share by Segment</span>
                  <span className="text-xs text-slate-400 font-normal">Monetary contribution</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Champions generate over 68% of total realized store revenue</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segments}
                        dataKey="total_revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {segments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Revenue']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-between">
                  <span>Customer Distribution</span>
                  <span className="text-xs text-slate-400 font-normal">Headcount volume</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">At-Risk customers represent the largest cohort (29.4%)</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={segments} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val) => [`${val.toLocaleString()} clients`, 'Customers']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Bar dataKey="customer_count" radius={[6, 6, 0, 0]}>
                        {segments.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Strategic Segments Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Actionable Segment Playbooks</h3>
                  <p className="text-xs text-slate-400">Targeted business marketing and retention strategies per segment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((seg) => (
                  <div
                    key={seg.name}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                          <h4 className="font-bold text-white text-base">{seg.name}</h4>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {seg.tier}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{seg.description}</p>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center mb-4">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Customers</div>
                          <div className="text-xs font-bold text-slate-200">{seg.customer_count.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">({seg.customer_pct}%)</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Revenue</div>
                          <div className="text-xs font-bold text-emerald-400">{formatCurrency(seg.total_revenue)}</div>
                          <div className="text-[10px] text-slate-400">({seg.revenue_pct}%)</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Avg Spend</div>
                          <div className="text-xs font-bold text-indigo-300">₹{seg.avg_monetary.toFixed(0)}</div>
                          <div className="text-[10px] text-slate-400">/ cust</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Recommended Strategy:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{seg.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RFM MATRIX */}
        {activeTab === 'rfm_deepdive' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-1">RFM Quintile Matrix (5x5 Heatmap)</h3>
              <p className="text-xs text-slate-400 mb-6">
                Cross-tabulation of Recency Score (1 = oldest, 5 = recent) vs Frequency Score (1 = 1 order, 5 = frequent buyer)
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-xs font-medium text-slate-400 border border-slate-800 bg-slate-950">
                        Recency \ Frequency
                      </th>
                      {[1, 2, 3, 4, 5].map((f) => (
                        <th key={f} className="p-3 text-xs font-bold text-indigo-300 border border-slate-800 bg-slate-950">
                          Freq {f}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <tr key={r}>
                        <td className="p-3 text-xs font-bold text-indigo-300 border border-slate-800 bg-slate-950">
                          Recency {r}
                        </td>
                        {[1, 2, 3, 4, 5].map((f) => {
                          const cell = rfm_grid.find((g) => g.r_score === r && g.f_score === f) || {
                            count: 0,
                            avg_monetary: 0,
                            dominant_segment: 'None'
                          };
                          const intensity = Math.min(cell.count / 400, 1);
                          return (
                            <td
                              key={f}
                              className="p-3 border border-slate-800 transition hover:bg-indigo-900/30"
                              style={{
                                backgroundColor: cell.count > 0 ? `rgba(99, 102, 241, ${0.1 + intensity * 0.4})` : 'transparent'
                              }}
                            >
                              <div className="font-bold text-sm text-white">{cell.count}</div>
                              <div className="text-[10px] text-slate-300">₹{cell.avg_monetary.toFixed(0)} avg</div>
                              <div className="text-[10px] text-indigo-300 font-medium truncate mt-0.5">
                                {cell.dominant_segment}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methodology Explainer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3">
                  R
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Recency (1 - 5)</h4>
                <p className="text-xs text-slate-400">
                  Calculated as days elapsed between the customer's last purchase and the snapshot date. Quintile 5 represents customers active within the last 30 days.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-3">
                  F
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Frequency (1 - 5)</h4>
                <p className="text-xs text-slate-400">
                  Total distinct completed invoice orders placed. High frequency (4-5) reflects deeply engaged, repeating loyalists.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-3">
                  M
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Monetary (1 - 5)</h4>
                <p className="text-xs text-slate-400">
                  Cumulative transaction revenue in Rupees (₹). Top quintile spenders represent 68%+ of store revenue volume.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRENDS & INTERNATIONAL */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-base font-semibold text-white mb-1">Monthly Revenue & Order Volume Timeline</h3>
              <p className="text-xs text-slate-400 mb-6">
                25-month historical trend (Dec 2009 – Dec 2011) illustrating high Q4 holiday peak sales
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly_trends} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val/1e3).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val, name) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val.toLocaleString(), name === 'revenue' ? 'Revenue (₹)' : 'Orders']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Breakdown */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                  <span>Top 10 Export Markets</span>
                  <Globe2 className="w-4 h-4 text-indigo-400" />
                </h3>
                <div className="space-y-3">
                  {country_breakdown.map((item, idx) => (
                    <div key={item.country} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-semibold text-slate-200">{item.country}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-emerald-400">{formatCurrency(item.revenue)}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({item.revenue_pct}%)</span>
                        </div>
                        <div className="text-slate-400 w-16">{item.customers} clients</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                  <span>Top Revenue Generating Products</span>
                  <Package className="w-4 h-4 text-amber-400" />
                </h3>
                <div className="space-y-3">
                  {top_products.map((p, idx) => (
                    <div key={p.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center gap-2 max-w-[240px] truncate">
                        <span className="w-5 font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-semibold text-slate-200 truncate" title={p.name}>{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="font-bold text-amber-400">{formatCurrency(p.revenue)}</span>
                        <span className="text-slate-400 w-20">{p.units_sold.toLocaleString()} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVENUE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30">
              <div className="max-w-2xl mb-8">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Interactive Scenario Modeling</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  What-If Revenue Uplift Simulator
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Model financial recovery by adjusting retention rates for ₹2.02M in At-Risk customers and driving loyalty repeat purchase frequency among Champions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Reactivate At-Risk Customers</span>
                    </label>
                    <span className="font-bold text-rose-400 text-base">{reactivationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={reactivationRate}
                    onChange={(e) => setReactivationRate(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Conservative (0%)</span>
                    <span>Realistic (10%)</span>
                    <span>Aggressive (30%)</span>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    Projected Recovered Revenue: <strong className="text-emerald-400">{formatCurrency(recoveredRevenue)}</strong>
                  </div>
                </div>

                <div className="space-y-3 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Boost Champions Repeat Frequency</span>
                    </label>
                    <span className="font-bold text-purple-400 text-base">+{championBoost}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={championBoost}
                    onChange={(e) => setChampionBoost(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Base (0%)</span>
                    <span>Moderate (+10%)</span>
                    <span>High (+25%)</span>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    Projected Incremental Spend: <strong className="text-emerald-400">{formatCurrency(boostedRevenue)}</strong>
                  </div>
                </div>
              </div>

              {/* Output Result Card */}
              <div className="p-6 rounded-xl bg-indigo-900/30 border border-indigo-500/40 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Recovered At-Risk</div>
                  <div className="text-xl font-bold text-rose-300">{formatCurrency(recoveredRevenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Champions Expansion</div>
                  <div className="text-xl font-bold text-purple-300">{formatCurrency(boostedRevenue)}</div>
                </div>
                <div className="sm:border-l sm:border-indigo-500/30 sm:pl-6">
                  <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-1">Total Simulated Uplift</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    +{formatCurrency(totalSimulatedUplift)}
                  </div>
                  <div className="text-xs text-emerald-300 font-medium mt-1">
                    +{upliftPercentage}% baseline revenue growth
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Customer ID or Country..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedSegmentFilter}
                  onChange={(e) => {
                    setSelectedSegmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Segments</option>
                  {segments.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTierFilter}
                  onChange={(e) => {
                    setSelectedTierFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Value Tiers</option>
                  <option value="High Value">High Value</option>
                  <option value="Medium Value">Medium Value</option>
                  <option value="Low Value/At Risk">Low Value/At Risk</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {filteredCustomers.length} Records</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer ID</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4 text-right">Recency (Days)</th>
                      <th className="py-3 px-4 text-right">Frequency (Orders)</th>
                      <th className="py-3 px-4 text-right">Monetary Spend</th>
                      <th className="py-3 px-4 text-center">RFM Score</th>
                      <th className="py-3 px-4">Segment</th>
                      <th className="py-3 px-4">Value Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedCustomers.map((c) => {
                      const segInfo = segments.find((s) => s.name === c.s) || { color: '#6B7280' };
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-200">#{c.id}</td>
                          <td className="py-3 px-4 text-slate-300">{c.c}</td>
                          <td className="py-3 px-4 text-right text-slate-300">{c.r}d ago</td>
                          <td className="py-3 px-4 text-right text-slate-300 font-semibold">{c.f} orders</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">₹{c.m.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 font-bold border border-slate-700">
                              {c.rfm}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              style={{ backgroundColor: `${segInfo.color}20`, color: segInfo.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: segInfo.color }} />
                              {c.s}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{c.t}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredCustomers.length)} to{' '}
                  {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-slate-200">
                    Page {currentPage} of {Math.max(totalPages, 1)}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Developed & Analyzed by </span>
          <a href="https://github.com/austinajay" className="text-indigo-400 hover:underline font-semibold">
            Austin Ajay
          </a>
          <span> • UK Online Retail II E-Commerce Dataset</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/austinajay" className="hover:text-slate-300 transition flex items-center gap-1">
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Profile</span>
          </a>
          <span>•</span>
          <span>Deployable on Vercel</span>
        </div>
      </footer>
    </div>
  );
}
