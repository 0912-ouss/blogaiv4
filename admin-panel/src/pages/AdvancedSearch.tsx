import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Article, Category } from '../types';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    category_id: '',
    author_id: '',
    status: '',
    tags: [] as string[],
    date_from: '',
    date_to: '',
    sort_by: 'published_at',
    sort_order: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await api.getAuthors();
      if (response.success && response.data) {
        setAuthors(response.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.getTags();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() && !filters.category_id && !filters.author_id && !filters.tags.length) {
      toast.error('Please enter a search query or select filters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.advancedSearch({
        query: query.trim() || undefined,
        category_id: filters.category_id ? parseInt(filters.category_id) : undefined,
        author_id: filters.author_id ? parseInt(filters.author_id) : undefined,
        status: filters.status || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        limit: 50,
      });

      if (response.success && response.data) {
        setResults(response.data);
        if (response.data.length === 0) {
          toast.info('No articles found matching your criteria');
        }
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      toast.error(error.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      author_id: '',
      status: '',
      tags: [],
      date_from: '',
      date_to: '',
      sort_by: 'published_at',
      sort_order: 'desc',
    });
    setQuery('');
    setResults([]);
  };

  const toggleTag = (tagName: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Advanced Search</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Search articles with advanced filters and sorting options
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-modern p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search articles by title, content, or excerpt..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <select
                  value={filters.author_id}
                  onChange={(e) => setFilters({ ...filters, author_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Authors</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="published_at">Published Date</option>
                  <option value="created_at">Created Date</option>
                  <option value="title">Title</option>
                  <option value="view_count">Views</option>
                  <option value="updated_at">Updated Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sort_order}
                  onChange={(e) => setFilters({ ...filters, sort_order: e.target.value as 'asc' | 'desc' })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      filters.tags.includes(tag.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={clearFilters} className="btn-secondary flex items-center gap-2">
                <XMarkIcon className="h-5 w-5" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Search Results ({results.length})
          </h2>
          <div className="space-y-4">
            {results.map(article => (
              <div
                key={article.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {article.categories && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                          {article.categories.name}
                        </span>
                      )}
                      {article.published_at && (
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      )}
                      {article.view_count !== undefined && (
                        <span>{article.view_count} views</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`/articles/${article.id}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

