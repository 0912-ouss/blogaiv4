import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Author } from '../types';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Authors: React.FC = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    email: '',
    avatar_url: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await api.getAuthors();
      if (response.success && response.data) {
        setAuthors(response.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await api.updateAuthor(editingAuthor.id, formData);
      } else {
        await api.createAuthor(formData);
      }
      setShowModal(false);
      setEditingAuthor(null);
      setFormData({
        name: '',
        slug: '',
        bio: '',
        email: '',
        avatar_url: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
      });
      fetchAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      slug: author.slug,
      bio: author.bio || '',
      email: author.email || '',
      avatar_url: author.avatar_url || '',
      facebook_url: author.facebook_url || '',
      twitter_url: author.twitter_url || '',
      instagram_url: author.instagram_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await api.deleteAuthor(id);
        fetchAuthors();
      } catch (error) {
        console.error('Error deleting author:', error);
      }
    }
  };

  const handleViewProfile = (author: Author) => {
    navigate(`/author/${author.slug}`);
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Authors</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage blog authors and their profiles ({authors.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search authors..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => {
              setEditingAuthor(null);
              setFormData({
                name: '',
                slug: '',
                bio: '',
                email: '',
                avatar_url: '',
                facebook_url: '',
                twitter_url: '',
                instagram_url: '',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Author
          </button>
        </div>
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAuthors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAuthors.map((author) => (
            <div
              key={author.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      author.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{author.name}</h3>
                  {author.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{author.email}</p>
                  )}
                  {author.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{author.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mb-3">
                    {author.facebook_url && (
                      <a href={author.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    )}
                    {author.twitter_url && (
                      <a href={author.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {author.instagram_url && (
                      <a href={author.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewProfile(author)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleEdit(author)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(author.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No authors found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first author to get started</p>
        </div>
      )}

      {/* Author Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 dark:bg-black">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAuthor(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingAuthor ? 'Update Author' : 'Create Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;

