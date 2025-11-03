import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats, ChartData } from '../types';
import { formatNumber } from '../utils/helpers';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articlesOverTime, setArticlesOverTime] = useState<ChartData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [statsResponse, articlesResponse, categoryResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getArticlesOverTime(timeRange),
        api.getCategoryDistribution(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (articlesResponse.success && articlesResponse.data) {
        setArticlesOverTime(articlesResponse.data);
      }
      if (categoryResponse.success && categoryResponse.data) {
        setCategoryDistribution(categoryResponse.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Detailed insights and reports for your blog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/analytics/export?format=csv&type=articles', {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                  }
                });
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Error exporting analytics:', error);
              }
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Total Articles</span>
            <div className="p-2 bg-blue-100 rounded-xl">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{formatNumber(stats?.articles.total || 0)}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {stats?.articles.published || 0} published
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Total Views</span>
            <div className="p-2 bg-green-100 rounded-xl">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{formatNumber(stats?.views.total || 0)}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            Avg: {formatNumber(stats?.views.average || 0)} per article
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Comments</span>
            <div className="p-2 bg-purple-100 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{formatNumber(stats?.comments.total || 0)}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {stats?.comments.pending || 0} pending
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Avg. Views/Article</span>
            <div className="p-2 bg-orange-100 rounded-xl">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">
            {stats?.articles.total && stats?.views.total
              ? formatNumber(Math.round(stats.views.total / stats.articles.total))
              : 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            Engagement rate
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Articles Over Time */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Articles Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={articlesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255, 255, 255)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution.map(item => ({ name: item.name || '', value: item.value || 0 }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255, 255, 255)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Views by Category */}
      {categoryDistribution.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Views by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255, 255, 255)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
