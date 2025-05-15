'use client';

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  isVerified: boolean;
  subscriptionPlan?: 'free' | 'pro' | 'elite';
  subscriptionExpiry?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{
    userId: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ userId: '', status: 'idle' });
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro' | 'elite'>('free');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Open subscription modal
  const openSubscriptionModal = (user: User) => {
    setSelectedUser(user);
    setSubscriptionPlan(user.subscriptionPlan || 'free');
    
    // Set default expiration date to 30 days from now for new subscriptions
    // or use existing expiration date if available
    if (user.subscriptionExpiry) {
      setSubscriptionExpiry(user.subscriptionExpiry.split('T')[0]); // Format as YYYY-MM-DD
    } else {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setSubscriptionExpiry(date.toISOString().split('T')[0]);
    }
    
    setShowSubscriptionModal(true);
  };
  
  // Close subscription modal
  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setSelectedUser(null);
  };
  
  // Update user subscription
  const updateSubscription = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdateStatus({ userId: selectedUser._id, status: 'loading' });
      
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          subscriptionPlan,
          subscriptionExpiry: new Date(subscriptionExpiry).toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }
      
      const updatedUser = await response.json();
      
      // Update users list with the updated user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id ? { 
            ...user, 
            subscriptionPlan: updatedUser.subscriptionPlan,
            subscriptionExpiry: updatedUser.subscriptionExpiry
          } : user
        )
      );
      
      setUpdateStatus({ 
        userId: selectedUser._id, 
        status: 'success', 
        message: `User ${updatedUser.username}'s subscription updated to ${updatedUser.subscriptionPlan}`
      });
      
      // Close modal
      closeSubscriptionModal();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: '', status: 'idle' });
      }, 3000);
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      setUpdateStatus({ 
        userId: selectedUser._id, 
        status: 'error', 
        message: err.message || 'Failed to update subscription'
      });
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: '', status: 'idle' });
      }, 3000);
    }
  };
  
  // Toggle user admin status
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdateStatus({ userId, status: 'loading' });
      
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentStatus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      
      const updatedUser = await response.json();
      
      // Update users list with the updated user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isAdmin: updatedUser.isAdmin } : user
        )
      );
      
      setUpdateStatus({ 
        userId, 
        status: 'success', 
        message: `User ${updatedUser.username} is now ${updatedUser.isAdmin ? 'an admin' : 'a regular user'}`
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: '', status: 'idle' });
      }, 3000);
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setUpdateStatus({ 
        userId, 
        status: 'error', 
        message: err.message || 'Failed to update user role'
      });
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setUpdateStatus({ userId: '', status: 'idle' });
      }, 3000);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-300">User Management</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
        >
          Refresh Users
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No users found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Verified</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Subscription</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white font-medium">{user.username}</td>
                    <td className="px-4 py-3 text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {user.isVerified ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-md text-xs">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-md text-xs">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.subscriptionPlan ? (
                        <div>
                          <span className={`px-2 py-1 rounded-md text-xs ${
                            user.subscriptionPlan === 'pro' 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : user.subscriptionPlan === 'elite'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)}
                          </span>
                          {user.subscriptionExpiry && (
                            <div className="mt-1 text-xs text-gray-400">
                              Expires: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                          disabled={updateStatus.userId === user._id && updateStatus.status === 'loading'}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            user.isAdmin
                              ? 'bg-red-600/30 text-red-300 hover:bg-red-600/50'
                              : 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/50'
                          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updateStatus.userId === user._id && updateStatus.status === 'loading' ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </span>
                          ) : (
                            user.isAdmin ? 'Remove Admin' : 'Make Admin'
                          )}
                        </button>
                        
                        <button
                          onClick={() => openSubscriptionModal(user)}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-green-600/30 text-green-300 hover:bg-green-600/50 transition-colors"
                        >
                          Manage Plan
                        </button>
                        
                        {updateStatus.userId === user._id && updateStatus.status !== 'loading' && (
                          <span className={`text-sm ${
                            updateStatus.status === 'success' ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {updateStatus.message}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Subscription Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-blue-300 mb-4">
              Manage Subscription for {selectedUser.username}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Subscription Plan
                </label>
                <select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value as 'free' | 'pro' | 'elite')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={subscriptionExpiry}
                  onChange={(e) => setSubscriptionExpiry(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                />
                <p className="mt-1 text-xs text-gray-400">
                  When this date is reached, the user will automatically revert to the Free plan.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeSubscriptionModal}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateSubscription}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
