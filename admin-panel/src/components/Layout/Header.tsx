import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { getInitials, classNames, formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Comment } from '../../types';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

interface SearchResult {
  type: 'article' | 'category' | 'user' | 'comment';
  id: number;
  title: string;
  subtitle?: string;
  url: string;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState<Comment[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch pending comments for notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.getComments({ status: 'pending', limit: 10 });
      if (response.success && response.data) {
        setNotifications(response.data);
        setPendingCount(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const performSearch = async (term: string) => {
    setSearching(true);
    try {
      const results: SearchResult[] = [];

      const articlesResponse = await api.getArticles({ search: term, limit: 5 });
      if (articlesResponse.success && articlesResponse.data) {
        articlesResponse.data.forEach((article: any) => {
          results.push({
            type: 'article',
            id: article.id,
            title: article.title,
            subtitle: article.categories?.name || 'Uncategorized',
            url: `/articles/${article.id}/edit`,
          });
        });
      }

      const categoriesResponse = await api.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        categoriesResponse.data
          .filter((cat: any) => cat.name.toLowerCase().includes(term.toLowerCase()))
          .slice(0, 3)
          .forEach((category: any) => {
            results.push({
              type: 'category',
              id: category.id,
              title: category.name,
              subtitle: category.description,
              url: '/categories',
            });
          });
      }

      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const handleNotificationItemClick = (commentId: number) => {
    navigate('/comments');
    setShowNotifications(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'category':
        return '📁';
      case 'user':
        return '👤';
      case 'comment':
        return '💬';
      default:
        return '🔍';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Search articles, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-400/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            {searching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-100"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-1">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h3>
                  {pendingCount > 0 && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-100"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No pending notifications</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationItemClick(notification.id)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                {notification.author_name || 'Anonymous'} commented
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {notification.content}
                              </p>
                              {notification.articles && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                                  on "{notification.articles.title}"
                                </p>
                              )}
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        navigate('/comments');
                        setShowNotifications(false);
                      }}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View all comments →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.email?.split('@')[0] || 'Admin'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Administrator</div>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm">
                {getInitials(user?.email || 'A')}
              </div>
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
