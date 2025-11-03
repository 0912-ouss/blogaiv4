import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Cog6ToothIcon, GlobeAltIcon, BellIcon, ShieldCheckIcon, PaintBrushIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'MAGNEWS',
    siteTagline: 'Your Daily Source of News',
    siteDescription: '',
    siteUrl: 'https://magnews.com',
    adminEmail: 'admin@magnews.com',
    postsPerPage: 10,
    enableComments: true,
    requireApproval: true,
    enableNotifications: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
    { id: 'social', name: 'Social Media', icon: ShareIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'data', name: 'Data Management', icon: ArrowDownTrayIcon },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Configure your blog settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Email/Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Email Notifications</h2>
              <EmailSettingsTab />
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white bg-opacity-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    placeholder="Brief description of your blog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posts Per Page</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.postsPerPage}
                    onChange={(e) => setSettings({ ...settings, postsPerPage: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Meta Title</label>
                  <input
                    type="text"
                    placeholder="Default SEO title"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Meta Description</label>
                  <textarea
                    rows={3}
                    placeholder="Default SEO description"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all resize-none text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Social Media Links</h2>
              <SocialMediaSettingsTab />
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div>
                    <h3 className="font-semibold text-gray-900">Enable Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div>
                    <h3 className="font-semibold text-gray-900">Enable Comments</h3>
                    <p className="text-sm text-gray-500">Allow users to comment on articles</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableComments}
                      onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div>
                    <h3 className="font-semibold text-gray-900">Require Comment Approval</h3>
                    <p className="text-sm text-gray-500">Comments must be approved before appearing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireApproval}
                      onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password Policy</label>
                  <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100">
                    <option>Strong (12+ characters, mixed case, numbers, symbols)</option>
                    <option>Medium (8+ characters, mixed case, numbers)</option>
                    <option>Basic (6+ characters)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div>
                    <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">Put site in maintenance mode</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                  <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      defaultValue="#3b82f6"
                      className="h-12 w-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#3b82f6"
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 card-hover">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Data Management</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Download your data as JSON or CSV files</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const response = await api.getArticles({ limit: 1000 });
                          if (response.success && response.data) {
                            const dataStr = JSON.stringify(response.data, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `articles-${new Date().toISOString().split('T')[0]}.json`;
                            link.click();
                            toast.success('Articles exported successfully');
                          }
                        } catch (error) {
                          toast.error('Failed to export articles');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-semibold"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Export Articles (JSON)
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await api.getCategories();
                          if (response.success && response.data) {
                            const dataStr = JSON.stringify(response.data, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
                            link.click();
                            toast.success('Categories exported successfully');
                          }
                        } catch (error) {
                          toast.error('Failed to export categories');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors text-sm font-semibold"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Export Categories (JSON)
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await api.getComments({ limit: 1000 });
                          if (response.success && response.data) {
                            const dataStr = JSON.stringify(response.data, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `comments-${new Date().toISOString().split('T')[0]}.json`;
                            link.click();
                            toast.success('Comments exported successfully');
                          }
                        } catch (error) {
                          toast.error('Failed to export comments');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-semibold"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Export Comments (JSON)
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Import Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Import data from JSON files</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Import Articles</label>
                      <input
                        type="file"
                        accept=".json"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const text = await file.text();
                            const data = JSON.parse(text);
                            if (Array.isArray(data)) {
                              toast.success(`Found ${data.length} articles to import`);
                              // Here you would call an import API endpoint
                              toast.info('Import functionality will be implemented with backend API');
                            }
                          } catch (error) {
                            toast.error('Invalid JSON file');
                          }
                        }}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> Importing data will overwrite existing records. Make sure to backup your data before importing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Email Settings Component
const EmailSettingsTab: React.FC = () => {
  const [emailSettings, setEmailSettings] = useState({
    email_host: '',
    email_port: '587',
    email_user: '',
    email_password: '',
    email_from: '',
    email_service: 'smtp',
    email_enabled: true,
    notify_new_comments: true,
    notify_comment_approval: true,
    notify_article_published: true,
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const response = await fetch('/api/admin/email/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setEmailSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/email/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(emailSettings)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Email settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save email settings');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          to: testEmail,
          subject: 'Test Email from Auto Blog',
          body: '<h2>Test Email</h2><p>This is a test email from your Auto Blog system.</p>'
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Test email sent successfully!');
        setTestEmail('');
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Email Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Service</label>
            <select
              value={emailSettings.email_service}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_service: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SMTP Host</label>
            <input
              type="text"
              value={emailSettings.email_host}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SMTP Port</label>
            <input
              type="number"
              value={emailSettings.email_port}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_port: e.target.value })}
              placeholder="587"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Username</label>
            <input
              type="text"
              value={emailSettings.email_user}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_user: e.target.value })}
              placeholder="your-email@gmail.com"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Password (App Password)</label>
            <input
              type="password"
              value={emailSettings.email_password}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Note: Store password in .env file (EMAIL_PASSWORD)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From Email</label>
            <input
              type="email"
              value={emailSettings.email_from}
              onChange={(e) => setEmailSettings({ ...emailSettings, email_from: e.target.value })}
              placeholder="noreply@yourblog.com"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="email_enabled"
            checked={emailSettings.email_enabled}
            onChange={(e) => setEmailSettings({ ...emailSettings, email_enabled: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="email_enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Enable Email Notifications
          </label>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4 border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notification Preferences</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify_new_comments"
              checked={emailSettings.notify_new_comments}
              onChange={(e) => setEmailSettings({ ...emailSettings, notify_new_comments: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notify_new_comments" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Notify on new comments
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify_comment_approval"
              checked={emailSettings.notify_comment_approval}
              onChange={(e) => setEmailSettings({ ...emailSettings, notify_comment_approval: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notify_comment_approval" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Notify commenters when comments are approved
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify_article_published"
              checked={emailSettings.notify_article_published}
              onChange={(e) => setEmailSettings({ ...emailSettings, notify_article_published: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notify_article_published" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Notify when articles are published
            </label>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="space-y-4 border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Test Email Configuration</h3>
        
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleTestEmail}
            disabled={testing || !testEmail.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;

// Social Media Settings Component
const SocialMediaSettingsTab: React.FC = () => {
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    pinterest: '',
    vk: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings?keys=social_facebook,social_twitter,social_instagram,social_linkedin,social_youtube,social_pinterest,social_vk', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setSocialMedia({
          facebook: data.data.social_facebook || '',
          twitter: data.data.social_twitter || '',
          instagram: data.data.social_instagram || '',
          linkedin: data.data.social_linkedin || '',
          youtube: data.data.social_youtube || '',
          pinterest: data.data.social_pinterest || '',
          vk: data.data.social_vk || '',
        });
      }
    } catch (error) {
      console.error('Error fetching social media settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          social_facebook: socialMedia.facebook,
          social_twitter: socialMedia.twitter,
          social_instagram: socialMedia.instagram,
          social_linkedin: socialMedia.linkedin,
          social_youtube: socialMedia.youtube,
          social_pinterest: socialMedia.pinterest,
          social_vk: socialMedia.vk,
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Social media links saved successfully');
      } else {
        toast.error(data.error || 'Failed to save social media links');
      }
    } catch (error) {
      console.error('Error saving social media settings:', error);
      toast.error('Failed to save social media links');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f', placeholder: 'https://facebook.com/yourpage' },
    { key: 'twitter', label: 'Twitter/X', icon: 'fab fa-twitter', placeholder: 'https://twitter.com/yourhandle' },
    { key: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin-in', placeholder: 'https://linkedin.com/company/yourcompany' },
    { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'pinterest', label: 'Pinterest', icon: 'fab fa-pinterest-p', placeholder: 'https://pinterest.com/yourhandle' },
    { key: 'vk', label: 'VK', icon: 'fab fa-vk', placeholder: 'https://vk.com/yourpage' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {socialPlatforms.map((platform) => (
          <div key={platform.key}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <i className={`${platform.icon} text-blue-600`}></i>
              {platform.label}
            </label>
            <input
              type="url"
              value={socialMedia[platform.key as keyof typeof socialMedia]}
              onChange={(e) => setSocialMedia({ ...socialMedia, [platform.key]: e.target.value })}
              placeholder={platform.placeholder}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Social Media Links'}
      </button>
    </div>
  );
};
