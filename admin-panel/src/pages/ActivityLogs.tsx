import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ActivityLog, AdminUser } from '../types';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '../utils/helpers';

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchActivityLogs();
    fetchStats();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.getAdminUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 50,
      };

      if (filters.userId) params.userId = parseInt(filters.userId);
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;

      const response = await api.getActivityLogs(params);
      if (response.success && response.data) {
        setLogs(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.getActivityStats(params);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const params: any = { format };
      if (filters.userId) params.userId = parseInt(filters.userId);
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const blob = await api.exportActivityLogs(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'post':
        return <PlusIcon className="h-4 w-4 text-green-600" />;
      case 'update':
      case 'edit':
        return <PencilIcon className="h-4 w-4 text-blue-600" />;
      case 'delete':
      case 'remove':
        return <TrashIcon className="h-4 w-4 text-red-600" />;
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'post':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'login':
      case 'logout':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Activity Logs</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Track all admin actions and system events ({stats?.total || 0} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Activities</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats.total)}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Actions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Object.keys(stats.byAction || {}).length}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entity Types</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Object.keys(stats.byEntityType || {}).length}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Users</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Object.keys(stats.byUser || {}).length}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">User</label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                <option value="article">Article</option>
                <option value="category">Category</option>
                <option value="comment">Comment</option>
                <option value="user">User</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setFilters({ userId: '', action: '', entityType: '', startDate: '', endDate: '', search: '' })}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity Logs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Entity</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Details</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{log.user_email || 'System'}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {log.entity_type && (
                            <span className="font-medium">{log.entity_type}</span>
                          )}
                          {log.entity_title && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2">: {log.entity_title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.details && typeof log.details === 'object' ? (
                            <details className="cursor-pointer">
                              <summary className="hover:text-gray-700 dark:hover:text-gray-300">View details</summary>
                              <pre className="mt-2 text-xs bg-gray-50 dark:bg-slate-900 p-2 rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            log.details || '-'
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <ClockIcon className="h-4 w-4" />
                          <span title={formatDate(log.created_at)}>{formatTimeAgo(log.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No activity logs found</p>
          <p className="text-gray-400 text-sm mt-2">Activity will appear here as actions are performed</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;

