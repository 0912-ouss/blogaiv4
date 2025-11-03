import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';
import { 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }
      
      toast.error(errorMessage, {
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-100 shadow-lg mb-4 transition-shadow hover:shadow-xl">
            <ShieldCheckIcon className="h-8 w-8 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin Panel
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="card-modern p-8 sm:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-4 pr-4 py-3 w-full"
                  placeholder="admin@blog.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pl-4 pr-12 py-3 w-full"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="spinner h-5 w-5 border-2 border-white dark:border-slate-900 border-t-transparent"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Sign In</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Default Credentials Helper */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2 font-medium">
                Default Credentials
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-mono">
                  admin@blog.com
                </code>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-mono">
                  Admin@123
                </code>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Secure access to your content management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
