import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Comment } from '../types';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import { CheckCircleIcon, XCircleIcon, TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.getComments({
        status: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveComment(id);
      toast.success('Comment approved');
      fetchComments();
    } catch (error) {
      toast.error('Failed to approve comment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectComment(id);
      toast.success('Comment rejected');
      fetchComments();
    } catch (error) {
      toast.error('Failed to reject comment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(id);
      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      spam: 'bg-gray-100 text-gray-700',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Comments</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Moderate user comments ({comments.length} total{pendingCount > 0 && `, ${pendingCount} pending`})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Comments</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {comment.author_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900">{comment.author_name || 'Anonymous'}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(comment.status || 'pending')}`}>
                          {comment.status || 'pending'}
                        </span>
                        {(comment.email || comment.author_email) && (
                          <span className="text-xs text-gray-500 truncate">{comment.email || comment.author_email}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-3">{comment.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>{formatDate(comment.created_at)}</span>
                        {comment.articles && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer truncate max-w-xs">
                              {comment.articles.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2 sm:flex-col sm:items-end flex-shrink-0">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-xs sm:text-sm font-semibold"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(comment.id)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-xs sm:text-sm font-semibold"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </>
                  )}
                  {comment.status === 'approved' && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors text-xs sm:text-sm font-semibold"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Unapprove</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-semibold"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl sm:rounded-3xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No comments found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Comments;
