'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddBakuganForm from '@/app/components/AddBakuganForm';
import ManageRecommendations from '@/app/components/ManageRecommendations';
import ManageBakutechRecommendations from '@/app/components/ManageBakutechRecommendations';
import Link from 'next/link';
import { useBakuganData } from '@/app/hooks/useBakuganData';
import AdminBakuganTable from '@/app/components/AdminBakuganTable';
import { Bakugan, PricePoint } from '@/app/types/bakugan';
import BakuganEditForm from '@/app/components/BakuganCard/BakuganEditForm';
import PriceHistoryManager from '@/app/components/PriceHistoryManager';

// Admin page component
function AdminContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'recommendations' | 'bakutech'>('add');
  
  // Get Bakugan data for edit/delete tab
  const {
    filteredItems,
    loading,
    error: bakuganError,
    pagination,
    priceHistories,
    isTransitioning,
    handleUpdatePrice,
    handleUpdateDetails,
    handleDeleteBakugan,
    handleDeletePriceHistory,
    updatePagination,
    updateFilter,
    nameSuggestions,
    showSuggestions,
    setShowSuggestions,
    filters,
    fetchBakuganItems,
  } = useBakuganData({ initialLimit: 20 });

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [bakuganToEdit, setBakuganToEdit] = useState<Bakugan | null>(null);
  const [selectedPriceHistory, setSelectedPriceHistory] = useState<PricePoint[]>([]);

  // Handle edit button click
  const handleEditBakugan = (bakuganId: string) => {
    // Find the Bakugan to edit
    const bakugan = filteredItems.find(item => item._id === bakuganId);
    if (bakugan) {
      // Set the bakugan to edit and show the modal
      setBakuganToEdit(bakugan);
      setShowEditModal(true);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setBakuganToEdit(null);
    
    // Refresh data after editing with a longer delay to ensure UI updates
    setTimeout(async () => {
      await fetchBakuganItems();
    }, 500);
  };


  // Handle cancel price history
  const handleCancelPriceHistory = () => {
    setShowPriceModal(false);
    setBakuganToEdit(null);
    setSelectedPriceHistory([]);
    
    // Refresh data after updating price history with a longer delay to ensure UI updates
    setTimeout(async () => {
      await fetchBakuganItems();
    }, 500);
  };

  // Handle update price button click
  const handleUpdateBakuganPrice = (bakuganId: string) => {
    // Find the Bakugan to update price
    const bakugan = filteredItems.find(item => item._id === bakuganId);
    if (bakugan) {
      // Set the bakugan and show the price history modal
      setBakuganToEdit(bakugan);
      setSelectedPriceHistory(priceHistories[bakuganId] || []);
      setShowPriceModal(true);
    }
  };

  // Wrapper for handleDeletePriceHistory to update the selected price history
  const handleDeletePriceHistoryWrapper = async (priceHistoryId: string, bakuganId: string) => {
    const success = await handleDeletePriceHistory(priceHistoryId, bakuganId);
    if (success && bakuganToEdit && bakuganToEdit._id === bakuganId) {
      // Update the selected price history with the updated price history after a delay
      // to ensure the server has time to process the update
      setTimeout(() => {
        setSelectedPriceHistory(priceHistories[bakuganId] || []);
      }, 300);
    }
    return success;
  };
  
  // Wrapper for handleDeleteBakugan to refresh data after deletion
  const handleDeleteBakuganWrapper = async (bakuganId: string) => {
    const success = await handleDeleteBakugan(bakuganId);
    if (success) {
      // Refresh data after deletion with a longer delay to ensure UI updates
      setTimeout(async () => {
        await fetchBakuganItems();
      }, 500);
    }
    return success;
  };

  // Wrapper for handleUpdatePrice to update the selected price history
  const handleUpdatePriceWrapper = async (id: string, price: number, notes: string, referenceUri: string, date: string) => {
    const success = await handleUpdatePrice(id, price, notes, referenceUri, date);
    if (success && bakuganToEdit && bakuganToEdit._id === id) {
      // Update the selected price history with the updated price history after a delay
      // to ensure the server has time to process the update
      setTimeout(() => {
        setSelectedPriceHistory(priceHistories[id] || []);
      }, 300);
    }
    return success;
  };

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
    series: string,
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
          series,
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

      // Get the newly added Bakugan data
      const newBakugan = await response.json();
      
      // Show success message
      setError('Bakugan added successfully!');
      
      // Reset form (AddBakuganForm handles this internally)
      
      // First switch to edit tab, then refresh data with a longer delay to ensure UI updates
      setActiveTab('edit');
      
      // Use setTimeout with a longer delay to ensure the tab switch happens first
      // and the server has time to process the new data
      setTimeout(async () => {
        await fetchBakuganItems();
      }, 500);
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
          Admin Dashboard
        </h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab('add');
            }}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'add'
                ? 'bg-blue-600/20 text-blue-300 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            Add New Bakugan
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              // Refresh data when switching to edit tab with a longer delay to ensure UI updates
              setTimeout(async () => {
                await fetchBakuganItems();
              }, 500);
            }}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'edit'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            Edit or Delete Bakugan
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'recommendations'
                ? 'bg-green-600/20 text-green-300 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            Manage Recommendations
          </button>
          <button
            onClick={() => setActiveTab('bakutech')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'bakutech'
                ? 'bg-yellow-600/20 text-yellow-300 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            BakuTech Recommendations
          </button>
        </nav>
      </div>
      
      {error && (
        <div className={`mb-8 p-4 rounded-xl text-center ${
          error.includes('success') 
            ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          <p className="font-semibold">{error.includes('success') ? error : `Error: ${error}`}</p>
        </div>
      )}
      
      {/* Tab Content */}
      {activeTab === 'add' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-6">
            Add New Bakugan
          </h2>
          <AddBakuganForm onAddBakugan={handleAddBakugan} />
        </div>
      )}
      
      {activeTab === 'edit' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-purple-500 to-purple-600 animate-gradient-x mb-6">
            Edit or Delete Bakugan
          </h2>
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <p className="text-gray-300 mb-4">
              Select a Bakugan to edit its details or delete it from the database.
            </p>
            
            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Name Search with Suggestions */}
                <div className="relative">
                  <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-300 mb-1">
                    Search by Name
                  </label>
                  <input
                    type="text"
                    id="nameFilter"
                    value={filters.nameFilter}
                    onChange={(e) => updateFilter('nameFilter', e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white"
                    placeholder="Enter Bakugan name"
                  />
                  
                  {/* Name Suggestions Dropdown */}
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div 
                      className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {nameSuggestions.map((name, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                          onClick={() => {
                            updateFilter('nameFilter', name);
                            setShowSuggestions(false);
                          }}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Element Filter */}
                <div>
                  <label htmlFor="elementFilter" className="block text-sm font-medium text-gray-300 mb-1">
                    Filter by Element
                  </label>
                  <select
                    id="elementFilter"
                    value={filters.elementFilter}
                    onChange={(e) => updateFilter('elementFilter', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white"
                  >
                    <option value="">All Elements</option>
                    <option value="Pyrus">Pyrus</option>
                    <option value="Aquos">Aquos</option>
                    <option value="Ventus">Ventus</option>
                    <option value="Subterra">Subterra</option>
                    <option value="Haos">Haos</option>
                    <option value="Darkus">Darkus</option>
                  </select>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Items per page:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => updatePagination(1, parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 px-2 py-1"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updatePagination(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {pagination.page} of {Math.max(1, pagination.pages)}
                  </span>
                  <button
                    onClick={() => updatePagination(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            
            <AdminBakuganTable 
              filteredItems={filteredItems}
              loading={loading}
              error={bakuganError}
              onEdit={handleEditBakugan}
              onDelete={handleDeleteBakuganWrapper}
              onUpdatePrice={handleUpdateBakuganPrice}
              onRefresh={fetchBakuganItems}
            />
          </div>
        </div>
      )}
      
      {activeTab === 'recommendations' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-green-500 to-green-600 animate-gradient-x mb-6">
            Manage Recommendations
          </h2>
          <ManageRecommendations />
        </div>
      )}
      
      {activeTab === 'bakutech' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 animate-gradient-x mb-6">
            BakuTech Recommendations
          </h2>
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <p className="text-gray-300 mb-4">
              Manage your recommended BakuTech items. These will be displayed in the BakuTech recommendations section.
            </p>
            <Link 
              href="/bakumania/admin/add"
              className="inline-block px-4 py-2 rounded-lg bg-yellow-600/30 text-yellow-300 border border-yellow-600/30 hover:bg-yellow-600/50 transition-colors mb-6"
            >
              Add New BakuTech
            </Link>
            
            <div className="mt-4">
              <ManageBakutechRecommendations />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {showEditModal && bakuganToEdit && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelEdit} // Close modal when clicking the backdrop
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the form from closing the modal
          >
            <BakuganEditForm
              id={bakuganToEdit._id}
              initialNames={bakuganToEdit.names}
              initialSize={bakuganToEdit.size}
              initialElement={bakuganToEdit.element}
              initialSpecialProperties={bakuganToEdit.specialProperties || ''}
              initialSeries={bakuganToEdit.series || ''}
              initialImageUrl={bakuganToEdit.imageUrl || ''}
              initialReferenceUri={bakuganToEdit.referenceUri || ''}
              onUpdateDetails={handleUpdateDetails}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}
      
      {/* Price History Modal */}
      {showPriceModal && bakuganToEdit && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelPriceHistory} // Close modal when clicking the backdrop
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the form from closing the modal
          >
            <PriceHistoryManager
              bakugan={bakuganToEdit}
              priceHistory={selectedPriceHistory}
              onUpdatePrice={handleUpdatePriceWrapper}
              onClose={handleCancelPriceHistory}
              onDeletePriceHistory={handleDeletePriceHistoryWrapper}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Export the admin page component
export default function AdminPage() {
  return <AdminContent />;
}
