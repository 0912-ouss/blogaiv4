import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  TrashIcon, 
  ArchiveBoxIcon, 
  DocumentCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

interface BulkActionBarProps {
  selectedIds: number[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds,
  onActionComplete,
  onClearSelection,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBulkAction = async (action: 'delete' | 'archive' | 'publish' | 'draft') => {
    if (selectedIds.length === 0) return;

    const actionMap: Record<string, { confirm: string; apiCall: (ids: number[], updates?: any) => Promise<any> }> = {
      delete: { 
        confirm: `Are you sure you want to delete ${selectedIds.length} article(s)?`, 
        apiCall: (ids: number[]) => api.bulkDeleteArticles(ids)
      },
      archive: { 
        confirm: `Archive ${selectedIds.length} article(s)?`, 
        apiCall: (ids: number[], updates?: any) => api.bulkUpdateArticles(ids, updates || {})
      },
      publish: { 
        confirm: `Publish ${selectedIds.length} article(s)?`, 
        apiCall: (ids: number[], updates?: any) => api.bulkUpdateArticles(ids, updates || {})
      },
      draft: { 
        confirm: `Move ${selectedIds.length} article(s) to draft?`, 
        apiCall: (ids: number[], updates?: any) => api.bulkUpdateArticles(ids, updates || {})
      },
    };

    const config = actionMap[action];
    if (!window.confirm(config.confirm)) return;

    setLoading(action);

    try {
      if (action === 'delete') {
        await config.apiCall(selectedIds);
      } else {
        const status = action === 'archive' ? 'archived' : action === 'publish' ? 'published' : 'draft';
        await config.apiCall(selectedIds, { status });
      }

      toast.success(`Successfully ${action === 'archive' ? 'archived' : action === 'publish' ? 'published' : action === 'draft' ? 'moved to draft' : 'deleted'} ${selectedIds.length} article(s)`);
      onActionComplete();
      onClearSelection();
    } catch (error: any) {
      console.error(`Error ${action}ing articles:`, error);
      toast.error(error.response?.data?.error || `Failed to ${action} articles`);
    } finally {
      setLoading(null);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.length} article{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'publish' ? (
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <DocumentCheckIcon className="h-4 w-4" />
              )}
              Publish
            </button>

            <button
              onClick={() => handleBulkAction('draft')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'draft' ? (
                <div className="spinner h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
              ) : (
                <DocumentCheckIcon className="h-4 w-4" />
              )}
              Draft
            </button>

            <button
              onClick={() => handleBulkAction('archive')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'archive' ? (
                <div className="spinner h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
              ) : (
                <ArchiveBoxIcon className="h-4 w-4" />
              )}
              Archive
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'delete' ? (
                <div className="spinner h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;

