import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AdminUser } from '../types';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminUsers();
      if (response.success && response.data) {
        const filtered = filter === 'all' 
          ? response.data 
          : response.data.filter((u: AdminUser) => 
              filter === 'active' ? u.is_active : !u.is_active
            );
        setUsers(filtered);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.deleteAdminUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Users & Authors</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage admin users and authors ({users.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users - Card View for Mobile, Table for Desktop */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : users.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {user.last_login ? formatDate(user.last_login) : 'Never logged in'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium truncate max-w-xs">{user.email}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl sm:rounded-3xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Users;
