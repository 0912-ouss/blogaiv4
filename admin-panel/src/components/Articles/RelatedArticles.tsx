import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Article } from '../../types';
import { formatDateShort } from '../../utils/helpers';

interface RelatedArticlesProps {
  articleSlug: string;
  limit?: number;
  className?: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  articleSlug,
  limit = 5,
  className = '',
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleSlug]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      const response = await api.getRelatedArticles(articleSlug, limit);
      if (response.success && response.data) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
        <div className="space-y-2">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        You Might Also Like
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/articles/${article.id}`}
            className="block group hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-3 transition-colors"
          >
            <div className="flex gap-3">
              {article.featured_image && (
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateShort(article.published_at || article.created_at)}
                </p>
                {article.excerpt && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;

