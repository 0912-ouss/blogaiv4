import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { TagIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await api.getTags();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: editingTag ? formData.slug : generateSlug(name),
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      const slug = formData.slug.trim() || generateSlug(formData.name);
      await api.createTag({ name: formData.name.trim(), slug });
      toast.success('Tag created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', slug: '' });
      fetchTags();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error(error.response?.data?.error || 'Failed to create tag');
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !formData.name.trim()) {
      return;
    }

    try {
      // Note: Update tag endpoint might need to be added to API
      await api.updateTag(editingTag.id, { name: formData.name.trim(), slug: formData.slug.trim() });
      toast.success('Tag updated successfully');
      setEditingTag(null);
      setFormData({ name: '', slug: '' });
      fetchTags();
    } catch (error: any) {
      console.error('Error updating tag:', error);
      toast.error(error.response?.data?.error || 'Failed to update tag');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    try {
      await api.deleteTag(id);
      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error(error.response?.data?.error || 'Failed to delete tag');
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Tags</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage article tags ({tags.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setEditingTag(null);
            setFormData({ name: '', slug: '' });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Tag
        </button>
      </div>

      {/* Search */}
      <div className="card-modern p-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Tags List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-12 w-12"></div>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="card-modern p-12 text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery ? 'No tags found' : 'No tags yet'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search query' : 'Create your first tag to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Tag
            </button>
          )}
        </div>
      ) : (
        <div className="card-modern p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {tag.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {tag.slug}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created {new Date(tag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingTag(tag);
                        setFormData({ name: tag.name, slug: tag.slug });
                        setShowCreateModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Edit tag"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Delete tag"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 dark:bg-black transition-opacity"
              onClick={() => {
                setShowCreateModal(false);
                setEditingTag(null);
                setFormData({ name: '', slug: '' });
              }}
            />
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTag(null);
                      setFormData({ name: '', slug: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Technology"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., technology"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={editingTag ? handleUpdate : handleCreate}
                      className="btn-primary flex-1"
                    >
                      {editingTag ? 'Update Tag' : 'Create Tag'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingTag(null);
                        setFormData({ name: '', slug: '' });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;

