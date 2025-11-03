import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ClockIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '../../utils/helpers';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Articles', href: '/articles', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Tags', href: '/tags', icon: TagIcon },
  { name: 'Comments', href: '/comments', icon: ChatBubbleLeftIcon },
  { name: 'Media', href: '/media', icon: PhotoIcon },
  { name: 'Authors', href: '/authors', icon: UserGroupIcon },
  { name: 'Newsletter', href: '/newsletter', icon: EnvelopeIcon },
  { name: 'Activity Logs', href: '/activity', icon: ClockIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 dark:bg-black lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 shadow-sm">
              <svg className="w-6 h-6 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">MAGNEWS</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={classNames(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive 
                        ? "text-white dark:text-slate-900" 
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    )} />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer - User Card */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Admin</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
