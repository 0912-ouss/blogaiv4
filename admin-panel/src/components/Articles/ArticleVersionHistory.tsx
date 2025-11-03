import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { ClockIcon, ArrowPathIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDateShort } from '../../utils/helpers';

interface ArticleVersion {
  id: number;
  version_number: number;
  title: string;
  content: string;
  notes?: string;
  created_at: string;
  created_by?: number;
  admin_users?: {
    email: string;
    name?: string;
  };
}

interface ArticleVersionHistoryProps {
  articleId: number;
  onRestore?: () => void;
}

const ArticleVersionHistory: React.FC<ArticleVersionHistoryProps> = ({ articleId, onRestore }) => {
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal && articleId) {
      fetchVersions();
    }
  }, [showModal, articleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await api.getArticleVersions(articleId);
      if (response.success && response.data) {
        setVersions(response.data);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: ArticleVersion) => {
    if (!window.confirm(`Restore version ${version.version_number}? This will create a new version with the current content.`)) {
      return;
    }

    try {
      const response = await api.restoreArticleVersion(articleId, version.id);
      if (response.success) {
        toast.success(`Article restored from version ${version.version_number}`);
        setShowModal(false);
        if (onRestore) {
          onRestore();
        }
      }
    } catch (error: any) {
      console.error('Error restoring version:', error);
      toast.error(error.response?.data?.error || 'Failed to restore version');
    }
  };

  const handleViewVersion = async (version: ArticleVersion) => {
    try {
      const response = await api.getArticleVersion(articleId, version.id);
      if (response.success && response.data) {
        setSelectedVersion(response.data);
      }
    } catch (error) {
      console.error('Error fetching version:', error);
      toast.error('Failed to load version details');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary flex items-center gap-2"
      >
        <ClockIcon className="h-5 w-5" />
        Version History
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 dark:bg-black transition-opacity"
              onClick={() => {
                setShowModal(false);
                setSelectedVersion(null);
              }}
            />
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Article Version History
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedVersion(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="spinner h-12 w-12"></div>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No versions</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      Version history will appear here when you edit the article.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Versions List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                        Versions ({versions.length})
                      </h4>
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                  Version {version.version_number}
                                </span>
                                {version.created_by && version.admin_users && (
                                  <span className="text-xs text-gray-500 dark:text-slate-400">
                                    by {version.admin_users.name || version.admin_users.email}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                                {version.title}
                              </p>
                              {version.notes && (
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                  {version.notes}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                {formatDateShort(version.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => handleViewVersion(version)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="View version"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {version.version_number < versions[0].version_number && (
                                <button
                                  onClick={() => handleRestore(version)}
                                  className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                  title="Restore version"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Version Preview */}
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                        {selectedVersion ? `Version ${selectedVersion.version_number} Preview` : 'Select a version to preview'}
                      </h4>
                      {selectedVersion ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                              Title
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-slate-300">
                              {selectedVersion.title}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                              Content Preview
                            </h5>
                            <div
                              className="text-sm text-gray-600 dark:text-slate-400 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: selectedVersion.content.substring(0, 500) + '...'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                          <EyeIcon className="mx-auto h-8 w-8 mb-2" />
                          <p className="text-sm">Click view icon to preview version</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleVersionHistory;

