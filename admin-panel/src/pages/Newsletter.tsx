import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  EnvelopeIcon,
  TrashIcon,
  PlusIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { formatDateShort } from '../utils/helpers';

interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: string;
  unsubscribed_at?: string;
}

interface NewsletterCampaign {
  id: number;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
}

const Newsletter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    } else {
      fetchCampaigns();
    }
  }, [activeTab, page, statusFilter, searchTerm]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await api.getNewsletterSubscribers(
        page,
        50,
        statusFilter === 'all' ? undefined : statusFilter,
        searchTerm || undefined
      );
      if (response.success && response.data) {
        setSubscribers(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalSubscribers(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.getNewsletterCampaigns();
      if (response.success && response.data) {
        setCampaigns(response.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await api.deleteNewsletterSubscriber(id);
      if (response.success) {
        toast.success('Subscriber deleted successfully');
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to delete subscriber');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unsubscribed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      bounced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getCampaignStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Newsletter</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage subscribers and email campaigns
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Subscribers ({totalSubscribers})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
        </nav>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>

          {/* Subscribers Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner h-12 w-12"></div>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No subscribers</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Newsletter subscribers will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Subscribed
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                          {subscriber.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {subscriber.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(subscriber.status)}`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {formatDateShort(subscriber.subscribed_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                // TODO: Open campaign editor modal
                toast.info('Campaign editor coming soon!');
              }}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Campaign
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner h-12 w-12"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No campaigns</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Create your first newsletter campaign to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{campaign.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Subject: {campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCampaignStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        {campaign.sent_at && (
                          <span className="text-sm text-gray-500 dark:text-slate-400">
                            Sent: {formatDateShort(campaign.sent_at)}
                          </span>
                        )}
                      </div>
                      {campaign.status === 'sent' && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{campaign.sent_count}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Sent</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{campaign.opened_count}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Opened</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{campaign.clicked_count}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Clicked</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => {
                            // TODO: Send campaign
                            toast.info('Sending campaign...');
                          }}
                          className="btn-primary flex items-center gap-2"
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // TODO: View stats
                          toast.info('Viewing campaign stats...');
                        }}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                        Stats
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Newsletter;

