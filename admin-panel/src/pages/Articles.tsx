import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Article } from '../types';
import { formatDateShort, formatNumber } from '../utils/helpers';
import { toast } from 'react-toastify';
import SearchBar from '../components/Search/SearchBar';
import BulkActionBar from '../components/BulkOperations/BulkActionBar';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
      handleSearch(urlSearch);
    } else {
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchParams]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.getArticles({
        status: filter === 'all' ? undefined : filter,
        search: searchTerm || undefined,
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchArticles();
      return;
    }

    setLoading(true);
    try {
      const response = await api.searchArticles({
        q: query,
        status: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteArticle(id);
      toast.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const handleViewDemo = (article: Article) => {
    if (!article.slug) {
      toast.error('Article slug not found. Please save the article first.');
      return;
    }
    
    // Open article preview in new tab with preview parameter for drafts
    const previewParam = article.status !== 'published' ? '&preview=true' : '';
    const blogUrl = `http://localhost:3000/article.html?slug=${article.slug}${previewParam}`;
    window.open(blogUrl, '_blank');
  };

  // Articles are already filtered by the API search
  const filteredArticles = articles;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Articles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your blog articles ({filteredArticles.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={async () => {
              try {
                const blob = await api.exportArticles('csv', {
                  status: filter === 'all' ? undefined : filter
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `articles-export-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
                toast.success('Articles exported successfully');
              } catch (error) {
                console.error('Error exporting articles:', error);
                toast.error('Failed to export articles');
              }
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={async () => {
              try {
                const blob = await api.exportArticles('json', {
                  status: filter === 'all' ? undefined : filter
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `articles-export-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                window.URL.revokeObjectURL(url);
                toast.success('Articles exported successfully');
              } catch (error) {
                console.error('Error exporting articles:', error);
                toast.error('Failed to export articles');
              }
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Export JSON
          </button>
          <button
            onClick={() => navigate('/articles/new')}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-modern p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search articles by title, content, keywords..."
              onResultClick={() => fetchArticles()}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-400/20 transition-all duration-200 appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles - Card View for Mobile, Table for Desktop */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-12 w-12"></div>
        </div>
      ) : filteredArticles.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredArticles.map((article) => (
              <div key={article.id} className="card-modern p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(article.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, article.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== article.id));
                      }
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {article.featured_image && (
                    <img
                      src={article.featured_image}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">{article.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={
                        article.status === 'published'
                          ? 'badge-published'
                          : article.status === 'draft'
                          ? 'badge-draft'
                          : 'badge-archived'
                      }>
                        {article.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span>{article.categories?.name || 'Uncategorized'}</span>
                  <span>{formatDateShort(article.published_at || article.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Views: {formatNumber(article.view_count)}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewDemo(article)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="See Demo"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/articles/${article.id}/edit`)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block card-modern overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredArticles.length && filteredArticles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredArticles.map(a => a.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(article.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, article.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== article.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {article.featured_image && (
                            <img
                              src={article.featured_image}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{article.title}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {article.categories?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <span className={
                          article.status === 'published'
                            ? 'badge-published'
                            : article.status === 'draft'
                            ? 'badge-draft'
                            : 'badge-archived'
                        }>
                          {article.status}
                        </span>
                      </td>
                      <td className="text-sm text-slate-600 dark:text-slate-400">
                        {formatNumber(article.view_count || 0)}
                      </td>
                      <td className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateShort(article.published_at || article.created_at)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewDemo(article)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                            title="See Demo"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/articles/${article.id}/edit`)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
          <p className="text-gray-500 text-lg">No articles found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onActionComplete={() => {
          fetchArticles();
          setSelectedIds([]);
        }}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
};

export default Articles;
