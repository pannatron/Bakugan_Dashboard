'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/app/components/AuthProvider';
import AddBakuganForm from '@/app/components/AddBakuganForm';
import Link from 'next/link';

// Wrapper component to use auth context
function AdminContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  // Check if user is admin, if not, redirect to home
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Handle admin password verification
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in a real app, this would be more secure
    if (adminPassword === 'admin') {
      setIsPasswordCorrect(true);
      setError(null);
    } else {
      setError('Incorrect password');
    }
  };

  // Add a new Bakugan (admin only)
  const handleAddBakugan = async (
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    series: string,
    imageUrl: string,
    currentPrice: number,
    referenceUri: string,
    date: string,
    difficultyOfObtaining?: number
  ) => {
    try {
      console.log('Admin page adding with date:', date);
      console.log('Date type:', typeof date);
      
      // Create the request body
      const requestBody = {
        names,
        size,
        element,
        specialProperties,
        series,
        imageUrl,
        currentPrice,
        referenceUri,
        date: date, // Always use the provided date
        difficultyOfObtaining, // Add the difficulty of obtaining field
      };
      
      console.log('Request body before JSON.stringify:', requestBody);
      const jsonBody = JSON.stringify(requestBody);
      console.log('Request body after JSON.stringify:', jsonBody);
      
      const response = await fetch('/api/bakugan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody,
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
  
  // Update an existing Bakugan's price (admin only)
  const handleUpdateBakugan = async (
    id: string,
    price: number,
    referenceUri: string,
    notes: string,
    date: string
  ) => {
    try {
      console.log('Admin page updating with date:', date);
      const response = await fetch(`/api/bakugan/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price,
          referenceUri,
          notes,
          timestamp: date, // Send the date string directly
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Bakugan price');
      }

      // Show success message
      setError('Price updated successfully!');
      
      // Reset form (AddBakuganForm handles this internally)
    } catch (err: any) {
      console.error('Error updating Bakugan price:', err);
      setError(err.message || 'Failed to update Bakugan price');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not logged in or not admin
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // User is logged in but not admin
  if (!user.isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Admin password check
  if (!isPasswordCorrect) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:px-6">
        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-6">
            Admin Verification
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter admin password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Verify
            </button>
            
          </form>
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
        <AddBakuganForm 
          onAddBakugan={handleAddBakugan} 
          onUpdateBakugan={handleUpdateBakugan}
        />
      </div>
    </div>
  );
}

// Export the wrapped component with AuthProvider
export default function AdminAddPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
