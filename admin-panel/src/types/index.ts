// ============================================
// Type Definitions for Admin Panel
// ============================================

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor';
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: number;
  author_id?: number;
  author_name?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  view_count: number;
  comment_count: number;
  is_featured: boolean;
  is_trending: boolean;
  ai_generated: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string | string[];
  created_at: string;
  updated_at: string;
  categories?: Category;
  authors?: Author;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  article_id: number;
  parent_comment_id?: number;
  author_name: string;
  author_email?: string;
  email?: string; // Alias for author_email
  author_avatar?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  updated_at: string;
  articles?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  category: 'general' | 'seo' | 'social' | 'ai' | 'email';
  description?: string;
  is_public: boolean;
  updated_at: string;
}

export interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
    aiGenerated: number;
    growth: number;
    thisMonth?: number;
  };
  views: {
    total: number;
    average: number;
    thisMonth?: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
  };
  categories: {
    total: number;
  };
  authors: {
    total: number;
  };
  daily: {
    articlesCreated: number;
    dailyLimit: number;
    underLimit: boolean;
  };
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  entity_title?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface ChartData {
  date?: string;
  name?: string;
  value?: number;
  count?: number;
  views?: number;
}

