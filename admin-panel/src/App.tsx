import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEditor from './pages/ArticleEditor';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Comments from './pages/Comments';
import Media from './pages/Media';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Authors from './pages/Authors';
import Newsletter from './pages/Newsletter';
import AdvancedSearch from './pages/AdvancedSearch';
import Tags from './pages/Tags';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected admin routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/new" element={<ArticleEditor />} />
              <Route path="articles/:id/edit" element={<ArticleEditor />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route path="comments" element={<Comments />} />
              <Route path="media" element={<Media />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="authors" element={<Authors />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="search" element={<AdvancedSearch />} />
              <Route path="tags" element={<Tags />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
