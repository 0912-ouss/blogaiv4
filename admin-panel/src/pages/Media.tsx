import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { PhotoIcon, PlusIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDateShort } from '../utils/helpers';

interface MediaFile {
  id: number;
  filename: string;
  original_filename: string;
  url: string;
  file_type: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  folder?: string;
  created_at: string;
}

const Media: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMediaItems();
  }, [page, fileTypeFilter, searchTerm]);

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const response = await api.getMediaItems(
        page,
        24,
        fileTypeFilter === 'all' ? undefined : fileTypeFilter,
        undefined,
        searchTerm || undefined
      );
      if (response.success && response.data) {
        setFiles(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast.error('Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        const response = await api.uploadMedia(file);
        if (response.success) {
          toast.success(`${file.name} uploaded successfully`);
        }
      }
      fetchMediaItems();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;

    try {
      const response = await api.deleteMediaItem(id);
      if (response.success) {
        toast.success('File deleted successfully');
        fetchMediaItems();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (mimeType?: string) => mimeType?.startsWith('image/') || false;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Media Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your media files ({totalItems} items)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`btn-primary flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {uploading ? (
              <>
                <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5" />
                <span>Upload Files</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>
        <select
          value={fileTypeFilter}
          onChange={(e) => setFileTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-12 w-12"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No media files</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Upload your first media file to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {isImage(file.mime_type) ? (
                  <div className="aspect-square relative bg-gray-100 dark:bg-slate-700">
                    <img
                      src={file.url}
                      alt={file.alt_text || file.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50" y="50" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  {file.file_size && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {formatFileSize(file.file_size)}
                    </p>
                  )}
                  {file.width && file.height && (
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {file.width} × {file.height}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedFile(file)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="View details"
                  >
                    <EyeIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.filename)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedFile.filename}</h2>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              {isImage(selectedFile.mime_type) && (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.alt_text || selectedFile.filename}
                  className="w-full h-auto rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">URL:</span>
                  <input
                    type="text"
                    value={selectedFile.url}
                    readOnly
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                {selectedFile.file_size && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Size:</span> {formatFileSize(selectedFile.file_size)}
                  </div>
                )}
                {selectedFile.width && selectedFile.height && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Dimensions:</span> {selectedFile.width} × {selectedFile.height}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">Uploaded:</span> {formatDateShort(selectedFile.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
