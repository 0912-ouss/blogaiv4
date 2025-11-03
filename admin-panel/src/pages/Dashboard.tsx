import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats, Article, Category } from '../types';
import StatCard from '../components/Common/StatCard';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  FolderIcon,
  RssIcon,
  ShareIcon,
  NewspaperIcon,
  LinkIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '../utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import MostLikedArticles from '../components/Widgets/MostLikedArticles';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rssFeedUrl] = useState(`${window.location.origin.replace(':3001', ':3000')}/api/rss`);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, articlesResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getTopArticles(5),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (articlesResponse.success && articlesResponse.data) {
        setTopArticles(articlesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = async () => {
    if (generating) return;

    // Random keywords for different categories
    const randomKeywords = [
      'Künstliche Intelligenz', 'Machine Learning', 'Blockchain', 'Cloud Computing',
      'Digital Marketing', 'Startup', 'Business Strategy', 'Entrepreneurship',
      'Klimawandel', 'Weltraumforschung', 'Genetik', 'Quantenphysik',
      'Gesunde Ernährung', 'Fitness', 'Mental Health', 'Wellness',
      'Politik', 'Demokratie', 'Gesellschaft', 'Internationale Beziehungen'
    ];

    // Get random category
    const randomCategory = categories.length > 0 
      ? categories[Math.floor(Math.random() * categories.length)]
      : null;

    if (!randomCategory) {
      toast.error('Bitte erstelle zuerst Kategorien');
      return;
    }

    // Get random keyword
    const randomKeyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];

    setGenerating(true);
    toast.info(`Generiere Artikel in Kategorie "${randomCategory.name}"...`, { autoClose: 2000 });

    try {
      // Generate article with AI
      const generateResponse = await api.generateArticleWithAI({
        mainKeyword: randomKeyword,
        category_id: randomCategory.id,
        category_name: randomCategory.name,
      });

      if (generateResponse.success && generateResponse.data) {
        const articleData = generateResponse.data;
        
        // Generate unique images based on article topic, timestamp, and index
        const getUniqueImageUrl = (topic: string, index: number) => {
          // Create a unique seed combining topic, timestamp, and random number
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000000);
          const seed = `${topic}-${timestamp}-${index}-${random}`;
          const imageId = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          
          // Map category to relevant image keywords
          const categoryKeywords: { [key: string]: string[] } = {
            'Technology': ['technology', 'innovation', 'digital', 'future', 'ai', 'robot', 'computer', 'data', 'cyber', 'tech', 'software', 'hardware', 'coding', 'startup'],
            'Business': ['business', 'success', 'entrepreneur', 'office', 'meeting', 'strategy', 'growth', 'leadership', 'corporate', 'finance', 'investment', 'startup', 'teamwork'],
            'Health': ['health', 'wellness', 'fitness', 'medical', 'doctor', 'healthy', 'lifestyle', 'medicine', 'nutrition', 'exercise', 'hospital', 'care', 'therapy'],
            'Science': ['science', 'research', 'laboratory', 'experiment', 'discovery', 'scientist', 'microscope', 'atom', 'physics', 'chemistry', 'biology', 'astronomy', 'space'],
            'Politics': ['politics', 'government', 'democracy', 'election', 'parliament', 'vote', 'policy', 'law', 'justice', 'court', 'congress', 'diplomacy'],
            'Culture': ['culture', 'art', 'music', 'heritage', 'tradition', 'festival', 'community', 'society', 'history', 'museum', 'gallery', 'theater'],
            'Sports': ['sports', 'athlete', 'fitness', 'competition', 'stadium', 'victory', 'team', 'champion', 'football', 'basketball', 'tennis', 'olympics'],
            'Entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'show', 'performance', 'concert', 'festival', 'cinema', 'theater', 'dance', 'comedy'],
          };
          
          // Get keywords for the category
          const keywords = categoryKeywords[randomCategory.name] || ['abstract', 'modern', 'creative', 'design', 'artistic', 'beautiful', 'stunning'];
          const keyword = keywords[imageId % keywords.length];
          
          // Extract relevant words from topic for more specific images
          const topicWords = topic.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4)
            .slice(0, 2)
            .join(',');
          
          // Use Unsplash Source API with multiple parameters for variety
          // Combine category keyword + topic words + unique seed
          const searchQuery = topicWords ? `${keyword},${topicWords}` : keyword;
          const uniqueSeed = `${timestamp}-${random}-${imageId}`;
          
          // Use Unsplash's random endpoint with seed for guaranteed uniqueness
          return `https://source.unsplash.com/1200x800/?${searchQuery}&sig=${uniqueSeed}`;
        };
        
        // Generate 4 unique images for content
        const imageUrls = [
          getUniqueImageUrl(randomKeyword, 1),
          getUniqueImageUrl(randomKeyword, 2),
          getUniqueImageUrl(randomKeyword, 3),
          getUniqueImageUrl(randomKeyword, 4),
        ];
        
        let content = articleData.content || '';
        content = content.replace(/\[IMAGE_1\]/g, imageUrls[0]);
        content = content.replace(/\[IMAGE_2\]/g, imageUrls[1]);
        content = content.replace(/\[IMAGE_3\]/g, imageUrls[2]);
        content = content.replace(/\[IMAGE_4\]/g, imageUrls[3]);
        
        // Use a unique featured image (different from content images)
        const featuredImage = getUniqueImageUrl(randomKeyword, 0);
        
        // Generate tags from category name and title keywords
        const titleWords = (articleData.title || '').toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 3)
          .slice(0, 3);
        const tags = [randomCategory.name.toLowerCase(), ...titleWords].filter(Boolean);

        // Remove fields that don't exist in database
        const { fal_ai_request, ...articleDataClean } = articleData as any;

        // Automatically create the article
        const createResponse = await api.createArticle({
          ...articleDataClean,
          content: content,
          featured_image: featuredImage,
          category_id: randomCategory.id, // Use category_id instead of category
          tags: tags, // Add generated tags
          status: 'published',
          published_at: new Date().toISOString(),
        });

        if (createResponse.success) {
          toast.success(`✅ Artikel "${articleData.title}" erfolgreich erstellt!`);
          // Refresh dashboard
          fetchDashboardData();
          // Navigate to articles page
          setTimeout(() => {
            navigate('/articles');
          }, 1500);
        } else {
          toast.error('Fehler beim Speichern des Artikels');
        }
      } else {
        toast.error('Fehler beim Generieren des Artikels');
      }
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(`Fehler: ${error.response?.data?.error || error.message || 'Unbekannter Fehler'}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your blog today
          </p>
        </div>
        <button 
          onClick={handleQuickGenerate}
          disabled={generating || categories.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Generiere...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New</span>
            </>
          )}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Articles"
          value={formatNumber(stats?.articles.total || 1247)}
          icon={DocumentTextIcon}
          change={12.5}
          changeLabel="vs last month"
          iconColor="bg-slate-900 dark:bg-slate-100"
        />
        <StatCard
          title="Total Views"
          value={formatNumber(stats?.views.total || 45200)}
          icon={EyeIcon}
          change={18.3}
          changeLabel="engagement up"
          iconColor="bg-emerald-600"
        />
        <StatCard
          title="Comments"
          value={formatNumber(stats?.comments.total || 892)}
          icon={ChatBubbleLeftIcon}
          change={8.7}
          changeLabel="active discussions"
          iconColor="bg-blue-600"
        />
        <StatCard
          title="Categories"
          value={formatNumber(stats?.categories.total || 24)}
          icon={FolderIcon}
          change={5.2}
          changeLabel="new topics"
          iconColor="bg-amber-600"
        />
      </div>

      {/* Charts and tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Liked Articles */}
        <MostLikedArticles limit={5} showOnDashboard={true} />

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 sm:mb-8">Recent Activity</h2>
          <div className="space-y-3 sm:space-y-4">
            {/* Activity Item 1 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100 truncate">RSS Feed feature enabled</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">Just now</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100 truncate">Social sharing buttons added</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">2 minutes ago</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100 truncate">News ticker configured</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">5 minutes ago</p>
              </div>
            </div>

            {/* Activity Item 4 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100 truncate">Dark mode toggle enabled</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:mt-1">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily limit indicator */}
      {stats?.daily && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-elegant-lg card-hover">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200 dark:border-slate-700">Today's AI Generation</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-slate-100">
                {stats.daily.articlesCreated} <span className="text-gray-400 dark:text-slate-500">/</span> {stats.daily.dailyLimit}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Articles generated today</p>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative pt-1">
                <div className="flex mb-3 items-center justify-between">
                  <div className="text-right">
                    <span className="text-sm font-bold inline-block text-red-600 dark:text-red-400">
                      {Math.round((stats.daily.articlesCreated / stats.daily.dailyLimit) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-slate-700">
                  <div
                    style={{ width: `${(stats.daily.articlesCreated / stats.daily.dailyLimit) * 100}%` }}
                    className="shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Content Features */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Content Features</h2>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-semibold">Active</span>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {/* RSS Feed */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-orange-100 dark:bg-orange-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <RssIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">RSS Feed</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Content syndication</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <a
                    href={rssFeedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-4 h-4" />
                    View Feed
                  </a>
                </div>
              </div>
            </div>

            {/* Social Share */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Social Sharing</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Facebook, Twitter, LinkedIn, Pinterest</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>

            {/* News Ticker */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <NewspaperIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">News Ticker</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Popular articles scroll</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-green-100 dark:bg-green-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Related Articles</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Smart content recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Features */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">System Features</h2>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm font-semibold">Enabled</span>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {/* Dark Mode */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {theme === 'dark' ? (
                      <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Dark Mode</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">
                      Currently: <span className="font-semibold capitalize">{theme} mode</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>

            {/* Open Graph Tags */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-indigo-100 dark:bg-indigo-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Open Graph Tags</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Enhanced social sharing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>

            {/* Article Scheduling */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-pink-100 dark:bg-pink-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Article Scheduling</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">Auto-publish scheduled posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-teal-100 dark:bg-teal-900 rounded-lg sm:rounded-xl flex-shrink-0">
                    <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 truncate">Rich Text Editor</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">TinyMCE WYSIWYG editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

