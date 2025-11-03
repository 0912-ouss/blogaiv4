import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  currentImage,
  folder = 'uploads',
  maxWidth = 1920,
  maxHeight = 1080,
  showPreview = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'base64'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const response = await api.uploadImage(file, {
        folder,
        resize: true,
        maxWidth,
        maxHeight,
        quality: 85,
        format: 'webp',
      });

      if (response.success && response.data) {
        setPreview(response.data.url);
        onUploadComplete(response.data.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setUploading(true);
    try {
      const response = await api.uploadImageFromURL(imageUrl, undefined, {
        folder,
        resize: true,
        maxWidth,
        maxHeight,
        quality: 85,
        format: 'webp',
      });

      if (response.success && response.data) {
        setPreview(response.data.url);
        onUploadComplete(response.data.url);
        setImageUrl('');
        setUploadMode('file');
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`px-4 py-2 text-sm font-medium ${
            uploadMode === 'file'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowUpTrayIcon className="w-4 h-4 inline mr-1" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-4 py-2 text-sm font-medium ${
            uploadMode === 'url'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-1" />
          From URL
        </button>
      </div>

      {/* File Upload */}
      {uploadMode === 'file' && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview && showPreview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? 'Uploading...' : 'Select Image'}
                </label>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="mt-2 text-sm text-gray-500">
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Upload */}
      {uploadMode === 'url' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="image-url" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={handleUrlUpload}
                disabled={uploading || !imageUrl.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
          {preview && showPreview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

