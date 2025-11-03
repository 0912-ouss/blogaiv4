import React, { useEffect, useState } from 'react';
import { Article } from '../../types';
import { HeartIcon, EyeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface MostLikedArticlesProps {
  limit?: number;
  showOnDashboard?: boolean;
}

const MostLikedArticles: React.FC<MostLikedArticlesProps> = ({ limit = 5, showOnDashboard = false }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostLikedArticles();
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMostLikedArticles = async () => {
    try {
      const response = await fetch(`/api/articles/most-liked?limit=${limit}`);
      const data = await response.json();
      if (data.success && data.data) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching most liked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
        <div className="text-center py-8">
          <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No liked articles yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <HeartIcon className="h-6 w-6 text-red-500" />
          Most Liked Articles
        </h2>
        {showOnDashboard && (
          <button
            onClick={() => navigate('/articles')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={() => window.open(`http://localhost:3000/article.html?slug=${article.slug}`, '_blank')}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4 text-red-500" />
                  {formatNumber((article as any).likeCount || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  {formatNumber(article.view_count || 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostLikedArticles;

