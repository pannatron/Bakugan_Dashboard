'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddBakuganForm from '@/app/components/AddBakuganForm';
import Link from 'next/link';

// Admin page component
function AdminContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Handle admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    // Simple hardcoded check - username: admin, password: admin
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid username or password');
    }
    
    setLoginLoading(false);
  };

  // Add a new Bakugan (admin only)
  const handleAddBakugan = async (
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    currentPrice: number,
    referenceUri: string,
    date: string
  ) => {
    try {
      const response = await fetch('/api/bakugan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names,
          size,
          element,
          specialProperties,
          imageUrl,
          currentPrice,
          referenceUri,
          date, // Include the date field in the request body
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add Bakugan');
      }

      // Show success message
      setError('Bakugan added successfully!');
      
      // Reset form (AddBakuganForm handles this internally)
    } catch (err: any) {
      console.error('Error adding Bakugan:', err);
      setError(err.message || 'Failed to add Bakugan');
    }
  };

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x">
            Admin Login
          </h1>
          
          <Link 
            href="/"
            className="px-4 py-2 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-all duration-300"
          >
            Return to Home
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-bold text-blue-400 mb-6">Login to Access Admin Features</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
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
                disabled={loginLoading}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account? Register on the home page.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-bold text-blue-400 mb-6">Admin Features</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add new Bakugan to the database</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Update Bakugan details and prices</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Manage price history records</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">Note:</span> You need admin privileges to access these features. Please contact the site administrator if you need access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Admin is verified
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x">
          Admin Dashboard - Add Bakugan
        </h1>
        
        <Link 
          href="/"
          className="px-4 py-2 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-all duration-300"
        >
          Return to Home
        </Link>
      </div>
      
      {error && (
        <div className={`mb-8 p-4 rounded-xl text-center ${
          error.includes('success') 
            ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          <p className="font-semibold">{error}</p>
        </div>
      )}
      
      <div className="mb-12">
        <AddBakuganForm onAddBakugan={handleAddBakugan} />
      </div>
    </div>
  );
}

// Export the admin page component
export default function AdminPage() {
  return <AdminContent />;
}
