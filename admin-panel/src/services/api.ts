import axios, { AxiosInstance } from 'axios';
import {
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  Article,
  Category,
  Author,
  Comment,
  AdminUser,
  Setting,
  DashboardStats,
  ActivityLog,
  ChartData,
} from '../types';

// Base API URL - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024, // 50MB
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors globally
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await this.api.post<LoginResponse>('/admin/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
    }
    return data;
  }

  async verifyToken(): Promise<ApiResponse<AdminUser>> {
    const { data } = await this.api.get<ApiResponse<AdminUser>>('/admin/auth/verify');
    return data;
  }

  async logout(): Promise<void> {
    await this.api.post('/admin/auth/logout');
    localStorage.removeItem('adminToken');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await this.api.get<ApiResponse<DashboardStats>>('/admin/analytics/dashboard');
    return data;
  }

  async getArticlesOverTime(days: number = 30): Promise<ApiResponse<ChartData[]>> {
    const { data } = await this.api.get<ApiResponse<ChartData[]>>(`/admin/analytics/articles-over-time?days=${days}`);
    return data;
  }

  async getTopArticles(limit: number = 10): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>(`/admin/analytics/top-articles?limit=${limit}`);
    return data;
  }

  async getCategoryDistribution(): Promise<ApiResponse<ChartData[]>> {
    const { data } = await this.api.get<ApiResponse<ChartData[]>>('/admin/analytics/category-distribution');
    return data;
  }

  // ============================================
  // ARTICLES
  // ============================================

  async getArticles(params?: {
    status?: string;
    category?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>('/admin/articles', { params });
    return data;
  }

  async getArticle(id: number): Promise<ApiResponse<Article>> {
    const { data } = await this.api.get<ApiResponse<Article>>(`/admin/articles/${id}`);
    return data;
  }

  async createArticle(articleData: Partial<Article>): Promise<ApiResponse<Article>> {
    const { data } = await this.api.post<ApiResponse<Article>>('/admin/articles', articleData);
    return data;
  }

  async generateArticleTitle(params: {
    keyword: string;
    keywordFocused: boolean;
    category_name?: string;
    titleInstructions?: string;
  }): Promise<ApiResponse<Partial<Article>>> {
    const { data } = await this.api.post<ApiResponse<Partial<Article>>>('/admin/articles/generate-title', params);
    return data;
  }

  async generateArticleContent(params: {
    keyword: string;
    keywordFocused: boolean;
    category_id?: number;
    category_name?: string;
    contentInstructions?: string;
  }): Promise<ApiResponse<Partial<Article>>> {
    const { data } = await this.api.post<ApiResponse<Partial<Article>>>('/admin/articles/generate-content', params);
    return data;
  }

  async generateArticleWithAI(params: {
    mainKeyword: string;
    secondKeywords?: string;
    category_id?: number;
    category_name?: string;
    titleInstructions?: string;
    contentInstructions?: string;
  }): Promise<ApiResponse<Partial<Article>>> {
    const { data } = await this.api.post<ApiResponse<Partial<Article>>>('/admin/articles/generate-ai', params);
    return data;
  }

  async storeImageFromFalAI(articleId: number, falAiResponse: any): Promise<ApiResponse<{ article_id: number; image_stored: boolean; image_size_kb: number }>> {
    const { data } = await this.api.post<ApiResponse<{ article_id: number; image_stored: boolean; image_size_kb: number }>>('/admin/articles/store-image-from-fal', {
      article_id: articleId,
      fal_ai_response: falAiResponse,
    });
    return data;
  }

  async updateArticle(id: number, articleData: Partial<Article>): Promise<ApiResponse<Article>> {
    const { data } = await this.api.put<ApiResponse<Article>>(`/admin/articles/${id}`, articleData);
    return data;
  }

  async deleteArticle(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/articles/${id}`);
    return data;
  }

  async bulkArticleAction(action: string, articleIds: number[]): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/articles/bulk-action', {
      action,
      articleIds,
    });
    return data;
  }

  async bulkDeleteArticles(articleIds: number[]): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/articles/bulk-delete', {
      articleIds,
    });
    return data;
  }

  async bulkUpdateArticles(articleIds: number[], updates: Partial<Article>): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/articles/bulk-update', {
      articleIds,
      updates,
    });
    return data;
  }

  async getArticleStats(): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>('/admin/articles/stats/summary');
    return data;
  }

  // ============================================
  // CATEGORIES
  // ============================================

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const { data } = await this.api.get<ApiResponse<Category[]>>('/admin/categories');
    return data;
  }

  async createCategory(categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const { data } = await this.api.post<ApiResponse<Category>>('/admin/categories', categoryData);
    return data;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const { data } = await this.api.put<ApiResponse<Category>>(`/admin/categories/${id}`, categoryData);
    return data;
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/categories/${id}`);
    return data;
  }

  // Tags
  async getTags(): Promise<ApiResponse<any[]>> {
    const { data } = await this.api.get<ApiResponse<any[]>>('/admin/categories/tags');
    return data;
  }

  async createTag(tagData: { name: string; slug: string }): Promise<ApiResponse<any>> {
    const { data } = await this.api.post<ApiResponse<any>>('/admin/categories/tags', tagData);
    return data;
  }

  async updateTag(id: number, tagData: { name: string; slug: string }): Promise<ApiResponse<any>> {
    const { data } = await this.api.put<ApiResponse<any>>(`/admin/categories/tags/${id}`, tagData);
    return data;
  }

  async deleteTag(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/categories/tags/${id}`);
    return data;
  }

  // ============================================
  // USERS & AUTHORS
  // ============================================

  async getAdminUsers(): Promise<ApiResponse<AdminUser[]>> {
    const { data } = await this.api.get<ApiResponse<AdminUser[]>>('/admin/users');
    return data;
  }

  async createAdminUser(userData: Partial<AdminUser> & { password: string }): Promise<ApiResponse<AdminUser>> {
    const { data } = await this.api.post<ApiResponse<AdminUser>>('/admin/users', userData);
    return data;
  }

  async updateAdminUser(id: number, userData: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
    const { data } = await this.api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, userData);
    return data;
  }

  async deleteAdminUser(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/users/${id}`);
    return data;
  }

  // Authors
  async getAuthors(): Promise<ApiResponse<Author[]>> {
    const { data } = await this.api.get<ApiResponse<Author[]>>('/admin/users/authors');
    return data;
  }

  async createAuthor(authorData: Partial<Author>): Promise<ApiResponse<Author>> {
    const { data } = await this.api.post<ApiResponse<Author>>('/admin/users/authors', authorData);
    return data;
  }

  async updateAuthor(id: number, authorData: Partial<Author>): Promise<ApiResponse<Author>> {
    const { data } = await this.api.put<ApiResponse<Author>>(`/admin/users/authors/${id}`, authorData);
    return data;
  }

  async deleteAuthor(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/users/authors/${id}`);
    return data;
  }

  // ============================================
  // COMMENTS
  // ============================================

  async getComments(params?: {
    status?: string;
    article_id?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Comment[]>> {
    const { data } = await this.api.get<ApiResponse<Comment[]>>('/admin/comments', { params });
    return data;
  }

  async approveComment(id: number): Promise<ApiResponse<Comment>> {
    const { data } = await this.api.patch<ApiResponse<Comment>>(`/admin/comments/${id}/approve`);
    return data;
  }

  async rejectComment(id: number): Promise<ApiResponse<Comment>> {
    const { data } = await this.api.patch<ApiResponse<Comment>>(`/admin/comments/${id}/reject`);
    return data;
  }

  async markCommentAsSpam(id: number): Promise<ApiResponse<Comment>> {
    const { data } = await this.api.patch<ApiResponse<Comment>>(`/admin/comments/${id}/spam`);
    return data;
  }

  async deleteComment(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/comments/${id}`);
    return data;
  }

  async bulkCommentAction(action: string, commentIds: number[]): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/comments/bulk-action', {
      action,
      commentIds,
    });
    return data;
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getSettings(category?: string): Promise<ApiResponse<Record<string, Setting[]>>> {
    const { data } = await this.api.get<ApiResponse<Record<string, Setting[]>>>('/admin/settings', {
      params: { category },
    });
    return data;
  }

  async getSetting(key: string): Promise<ApiResponse<Setting>> {
    const { data } = await this.api.get<ApiResponse<Setting>>(`/admin/settings/${key}`);
    return data;
  }

  async updateSetting(key: string, settingData: Partial<Setting>): Promise<ApiResponse<Setting>> {
    const { data } = await this.api.put<ApiResponse<Setting>>(`/admin/settings/${key}`, settingData);
    return data;
  }

  async bulkUpdateSettings(settings: Record<string, string>): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>('/admin/settings/bulk-update', {
      settings,
    });
    return data;
  }

  // ============================================
  // MEDIA UPLOAD
  // ============================================

  async uploadImage(file: File, options?: {
    folder?: string;
    resize?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  }): Promise<ApiResponse<{ url: string; path: string; fileName: string; size: number }>> {
    const formData = new FormData();
    formData.append('image', file);
    if (options) {
      if (options.folder) formData.append('folder', options.folder);
      if (options.resize !== undefined) formData.append('resize', String(options.resize));
      if (options.maxWidth) formData.append('maxWidth', String(options.maxWidth));
      if (options.maxHeight) formData.append('maxHeight', String(options.maxHeight));
      if (options.quality) formData.append('quality', String(options.quality));
      if (options.format) formData.append('format', options.format);
    }

    const { data } = await this.api.post<ApiResponse<{ url: string; path: string; fileName: string; size: number }>>(
      '/admin/media/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  async uploadBase64Image(base64String: string, fileName?: string, options?: {
    folder?: string;
    resize?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  }): Promise<ApiResponse<{ url: string; path: string; fileName: string; size: number }>> {
    const { data } = await this.api.post<ApiResponse<{ url: string; path: string; fileName: string; size: number }>>(
      '/admin/media/upload-base64',
      {
        image: base64String,
        fileName,
        ...options,
      }
    );
    return data;
  }

  async uploadImageFromURL(url: string, fileName?: string, options?: {
    folder?: string;
    resize?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  }): Promise<ApiResponse<{ url: string; path: string; fileName: string; size: number }>> {
    const { data } = await this.api.post<ApiResponse<{ url: string; path: string; fileName: string; size: number }>>(
      '/admin/media/upload-from-url',
      {
        url,
        fileName,
        ...options,
      }
    );
    return data;
  }

  async deleteImage(filePath: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/media/${filePath}`);
    return data;
  }

  async migrateBase64Image(articleId: number): Promise<ApiResponse<{ articleId: number; newUrl: string }>> {
    const { data } = await this.api.post<ApiResponse<{ articleId: number; newUrl: string }>>(
      '/admin/media/migrate-base64',
      { articleId }
    );
    return data;
  }

  // ============================================
  // CHAT ASSISTANT
  // ============================================

  async chatWithAssistant(message: string): Promise<ApiResponse<{ message: string; response: string }>> {
    const { data } = await this.api.post<ApiResponse<{ message: string; response: string }>>(
      '/admin/chat',
      { message }
    );
    return data;
  }

  // ============================================
  // SEARCH
  // ============================================

  async searchArticles(params: {
    q?: string;
    category_id?: number;
    status?: string;
    author_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>('/admin/search/articles', { params });
    return data;
  }

  async searchSuggestions(query: string, limit?: number): Promise<ApiResponse<{ articles: Article[]; categories: Category[] }>> {
    const { data } = await this.api.get<ApiResponse<{ articles: Article[]; categories: Category[] }>>('/admin/search/suggestions', {
      params: { q: query, limit }
    });
    return data;
  }

  async publicSearch(params: {
    q: string;
    category_id?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>('/search/public', { params });
    return data;
  }

  async getRelatedArticles(slug: string, limit?: number): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>(`/articles/${slug}/related`, {
      params: { limit }
    });
    return data;
  }

  // ============================================
  // ACTIVITY LOGS
  // ============================================

  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<ApiResponse<ActivityLog[]>> {
    const { data } = await this.api.get<ApiResponse<ActivityLog[]>>('/admin/activity', { params });
    return data;
  }

  async getActivityStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    total: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
    recentActivity: ActivityLog[];
  }>> {
    const { data } = await this.api.get<ApiResponse<any>>('/admin/activity/stats', { params });
    return data;
  }

  async exportActivityLogs(params: {
    format?: 'json' | 'csv';
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await this.api.get('/admin/activity/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // ============================================
  // EXPORT/IMPORT
  // ============================================

  async exportArticles(format: 'csv' | 'json', params?: {
    status?: string;
    category_id?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await this.api.get(`/admin/articles/export/${format}`, {
      params: Object.fromEntries(queryParams),
      responseType: 'blob'
    });
    return response.data;
  }

  async importArticles(format: 'csv' | 'json', data: any): Promise<ApiResponse<Article[]>> {
    const { data: responseData } = await this.api.post<ApiResponse<Article[]>>(`/admin/articles/import/${format}`, {
      [format === 'csv' ? 'csvData' : 'articles']: data
    });
    return responseData;
  }

  // ============================================
  // AUTHOR PROFILES (Public)
  // ============================================

  async getAuthorProfile(slug: string): Promise<ApiResponse<Author & { articles: Article[]; statistics: any }>> {
    const { data } = await this.api.get<ApiResponse<any>>(`/authors/${slug}`);
    return data;
  }

  async getAuthorArticles(slug: string, page?: number, limit?: number): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>(`/authors/${slug}/articles`, {
      params: { page, limit }
    });
    return data;
  }

  // ============================================
  // NEWSLETTER
  // ============================================

  async getNewsletterSubscribers(page?: number, limit?: number, status?: string, search?: string): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>('/admin/newsletter/subscribers', {
      params: { page, limit, status, search }
    });
    return data;
  }

  async deleteNewsletterSubscriber(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/newsletter/subscribers/${id}`);
    return data;
  }

  async createNewsletterCampaign(campaign: any): Promise<ApiResponse<any>> {
    const { data } = await this.api.post<ApiResponse<any>>('/admin/newsletter/campaigns', campaign);
    return data;
  }

  async getNewsletterCampaigns(): Promise<ApiResponse<any[]>> {
    const { data } = await this.api.get<ApiResponse<any[]>>('/admin/newsletter/campaigns');
    return data;
  }

  async sendNewsletterCampaign(id: number): Promise<ApiResponse<any>> {
    const { data } = await this.api.post<ApiResponse<any>>(`/admin/newsletter/campaigns/${id}/send`);
    return data;
  }

  async getNewsletterCampaignStats(id: number): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>(`/admin/newsletter/campaigns/${id}/stats`);
    return data;
  }

  // ============================================
  // MEDIA LIBRARY
  // ============================================

  async getMediaItems(page?: number, limit?: number, file_type?: string, folder?: string, search?: string): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>('/admin/media', {
      params: { page, limit, file_type, folder, search }
    });
    return data;
  }

  async getMediaItem(id: number): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>(`/admin/media/${id}`);
    return data;
  }

  async updateMediaItem(id: number, updates: any): Promise<ApiResponse<any>> {
    const { data } = await this.api.put<ApiResponse<any>>(`/admin/media/${id}`, updates);
    return data;
  }

  async deleteMediaItem(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`/admin/media/${id}`);
    return data;
  }

  async uploadMedia(file: File, folder?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const { data } = await this.api.post<ApiResponse<any>>('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  // ============================================
  // ARTICLE VERSIONS
  // ============================================

  async getArticleVersions(articleId: number): Promise<ApiResponse<any[]>> {
    const { data } = await this.api.get<ApiResponse<any[]>>(`/admin/articles/${articleId}/versions`);
    return data;
  }

  async getArticleVersion(articleId: number, versionId: number): Promise<ApiResponse<any>> {
    const { data } = await this.api.get<ApiResponse<any>>(`/admin/articles/${articleId}/versions/${versionId}`);
    return data;
  }

  async restoreArticleVersion(articleId: number, versionId: number): Promise<ApiResponse<any>> {
    const { data } = await this.api.post<ApiResponse<any>>(`/admin/articles/${articleId}/versions/${versionId}/restore`);
    return data;
  }

  // ============================================
  // RELATED ARTICLES (ADMIN)
  // ============================================

  async getRelatedArticlesAdmin(articleId: number, limit?: number): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>(`/admin/articles/${articleId}/related`, {
      params: { limit }
    });
    return data;
  }

  // ============================================
  // ADVANCED SEARCH
  // ============================================

  async advancedSearch(params: {
    query?: string;
    category_id?: number;
    author_id?: number;
    status?: string;
    tags?: string[];
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Article[]>> {
    const { data } = await this.api.get<ApiResponse<Article[]>>('/admin/search/search', { params });
    return data;
  }

  async getSearchSuggestions(query: string, limit?: number): Promise<ApiResponse<{
    articles: Article[];
    categories: Category[];
    tags: any[];
  }>> {
    const { data } = await this.api.get<ApiResponse<{
      articles: Article[];
      categories: Category[];
      tags: any[];
    }>>('/admin/search/suggestions', {
      params: { q: query, limit }
    });
    return data;
  }
}

const apiService = new ApiService();
export default apiService;

