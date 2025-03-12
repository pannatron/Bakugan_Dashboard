'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(username, password);
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium card-shimmer">
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-4">
        Login
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter your username"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const { register, error, clearError, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(username, password, showAdminField ? adminKey : undefined);
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium card-shimmer">
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-4">
        Register
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Choose a username"
          />
        </div>
        
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Choose a password"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="admin-toggle"
            checked={showAdminField}
            onChange={() => setShowAdminField(!showAdminField)}
            className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded"
          />
          <label htmlFor="admin-toggle" className="text-sm text-gray-300">
            Register as admin
          </label>
        </div>
        
        {showAdminField && (
          <div>
            <label htmlFor="admin-key" className="block text-sm font-medium text-gray-300 mb-1">
              Admin Key
            </label>
            <input
              type="password"
              id="admin-key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required={showAdminField}
              className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              placeholder="Enter admin key"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export function AuthButtons() {
  const { user, logout, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800/50 h-10 w-24 rounded-xl"></div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-300">
        <span className="font-medium text-blue-400">{user.username}</span>
        {user.isAdmin && (
          <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
            Admin
          </span>
        )}
      </div>
      
      <button
        onClick={() => logout()}
        className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      >
        Logout
      </button>
    </div>
  );
}
