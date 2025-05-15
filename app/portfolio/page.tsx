'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BakuganList from '../components/BakuganList';
import PortfolioList from '../components/PortfolioList';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import Link from 'next/link';

interface PortfolioItem {
  portfolioId: string;
  addedAt: string;
  notes?: string;
  quantity: number;
  bakugan: any;
}

interface FavoriteItem {
  favoriteId: string;
  addedAt: string;
  notes?: string;
  bakugan: any;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [priceHistories, setPriceHistories] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<'portfolio' | 'favorites'>('portfolio');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/portfolio');
    }
  }, [status, router]);

  // Fetch portfolio and favorites data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== 'authenticated') return;

      try {
        setLoading(true);
        
        // Fetch portfolio data
        const portfolioResponse = await fetch('/api/portfolio');
        if (!portfolioResponse.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        const portfolioData = await portfolioResponse.json();
        
        // Add default quantity of 1 if not specified
        const portfolioWithQuantity = portfolioData.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1
        }));
        
        setPortfolioItems(portfolioWithQuantity);
        
        // Calculate total portfolio value (price * quantity)
        const total = portfolioWithQuantity.reduce((sum: number, item: PortfolioItem) => {
          return sum + (item.bakugan?.currentPrice || 0) * (item.quantity || 1);
        }, 0);
        
        setTotalValue(total);
        
        // Fetch favorites data
        const favoritesResponse = await fetch('/api/favorites');
        let favoritesData: FavoriteItem[] = [];
        if (favoritesResponse.ok) {
          favoritesData = await favoritesResponse.json();
          setFavoriteItems(favoritesData);
        }
        
        // Fetch price histories for all bakugan
        const allBakuganIds = new Set([
          ...portfolioData.map((item: PortfolioItem) => item.bakugan?._id),
          ...favoritesData.map((item: FavoriteItem) => item.bakugan?._id)
        ].filter(Boolean));
        
        const histories: Record<string, any[]> = {};
        await Promise.all(
          Array.from(allBakuganIds).map(async (bakuganId: string) => {
            try {
              const historyResponse = await fetch(`/api/bakugan/${bakuganId}`);
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                histories[bakuganId] = historyData.priceHistory || [];
              }
            } catch (err) {
              console.error(`Error fetching price history for ${bakuganId}:`, err);
            }
          })
        );
        
        setPriceHistories(histories);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Add an event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'authenticated') {
        fetchUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status]);

  // Handle removing a bakugan from portfolio
  const handleRemoveFromPortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Find the item before removing it to recalculate total value
        const removedItem = portfolioItems.find(item => item.portfolioId === portfolioId);
        
        // Remove the item from the local state
        setPortfolioItems(prev => prev.filter(item => item.portfolioId !== portfolioId));
        
        // Recalculate total value
        if (removedItem) {
          setTotalValue(prev => 
            prev - (removedItem.bakugan?.currentPrice || 0) * (removedItem.quantity || 1)
          );
        }
      }
    } catch (error) {
      console.error('Error removing from portfolio:', error);
    }
  };
  
  // Handle updating portfolio item quantity
  const handleUpdateQuantity = async (portfolioId: string, quantity: number) => {
    try {
      console.log(`Updating portfolio item ${portfolioId} quantity to ${quantity}`);
      
      // Ensure quantity is a number
      const numericQuantity = Number(quantity);
      
      // Find the current item to get its current quantity
      const currentItem = portfolioItems.find(item => item.portfolioId === portfolioId);
      if (!currentItem) {
        console.error(`Portfolio item ${portfolioId} not found`);
        return;
      }
      
      // Get the current quantity before updating
      const oldQuantity = currentItem.quantity || 1;
      
      // Send the API request to update the database
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: numericQuantity }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update quantity response:', result);
        
        // Only update the local state after the API call is successful
        setPortfolioItems(prev => {
          const updatedItems = prev.map(item => {
            if (item.portfolioId === portfolioId) {
              // Return updated item with new quantity
              return {
                ...item,
                quantity: numericQuantity // Explicitly set the new quantity
              };
            }
            return item;
          });
          
          return updatedItems;
        });
        
        // Update total value based on the quantity difference
        const quantityDiff = numericQuantity - oldQuantity;
        setTotalValue(prevValue => 
          prevValue + (currentItem.bakugan?.currentPrice || 0) * quantityDiff
        );
        
        // Refresh the portfolio data to ensure we have the latest state
        setTimeout(() => {
          fetch('/api/portfolio')
            .then(res => res.json())
            .then(data => {
              const portfolioWithQuantity = data.map((item: any) => ({
                ...item,
                quantity: item.quantity || 1
              }));
              
              setPortfolioItems(portfolioWithQuantity);
              
              // Recalculate total value
              const total = portfolioWithQuantity.reduce((sum: number, item: PortfolioItem) => {
                return sum + (item.bakugan?.currentPrice || 0) * (item.quantity || 1);
              }, 0);
              
              setTotalValue(total);
            })
            .catch(err => {
              console.error('Error refreshing portfolio after update:', err);
            });
        }, 500); // Small delay to ensure the update has been processed
      } else {
        console.error('Failed to update quantity:', await response.text());
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating portfolio quantity:', error);
      throw error;
    }
  };
  
  // Handle removing a bakugan from favorites
  const handleRemoveFromFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the item from the local state
        setFavoriteItems(prev => prev.filter(item => item.favoriteId !== favoriteId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  // Format bakugan items for BakuganList component based on active tab
  const formattedBakuganItems = activeTab === 'portfolio' 
    ? portfolioItems
        .filter(item => item.bakugan)
        .map(item => ({
          ...item.bakugan,
          portfolioId: item.portfolioId,
          quantity: item.quantity
        }))
    : favoriteItems
        .filter(item => item.bakugan)
        .map(item => ({
          ...item.bakugan,
          favoriteId: item.favoriteId
        }));

  // Format portfolio and favorite items for BakuganList component
  const formattedPortfolioItems = portfolioItems
    .filter(item => item.bakugan)
    .map(item => ({
      id: item.portfolioId,
      bakuganId: item.bakugan._id,
      quantity: item.quantity
    }));

  const formattedFavoriteItems = favoriteItems
    .filter(item => item.bakugan)
    .map(item => ({
      id: item.favoriteId,
      bakuganId: item.bakugan._id
    }));

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      {/* Header with Tabs */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1.5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Your Bakugan Collection</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <p className="text-gray-300 ml-5">
            Manage your Bakugan collection and track prices over time.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLoading(true);
                fetch('/api/portfolio')
                  .then(res => res.json())
                  .then(data => {
                    const portfolioWithQuantity = data.map((item: any) => ({
                      ...item,
                      quantity: item.quantity || 1
                    }));
                    
                    setPortfolioItems(portfolioWithQuantity);
                    
                    // Calculate total portfolio value
                    const total = portfolioWithQuantity.reduce((sum: number, item: PortfolioItem) => {
                      return sum + (item.bakugan?.currentPrice || 0) * (item.quantity || 1);
                    }, 0);
                    
                    setTotalValue(total);
                    setLoading(false);
                  })
                  .catch(err => {
                    console.error('Error refreshing portfolio:', err);
                    setLoading(false);
                  });
              }}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white border border-green-500/30 hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300 shadow-md hover:shadow-green-500/10 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </span>
              )}
            </button>
            <Link 
              href="/favorites"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-md hover:shadow-red-500/10"
            >
              View Favorites
            </Link>
            <Link 
              href="/bakumania"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-md hover:shadow-blue-500/10"
            >
              Browse More
            </Link>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50 mb-8 ml-5">
          <button
            className={`py-3 px-8 font-medium relative ${
              activeTab === 'portfolio'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
            {activeTab === 'portfolio' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            )}
          </button>
          <button
            className={`py-3 px-8 font-medium relative ${
              activeTab === 'favorites'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
            {activeTab === 'favorites' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-pink-500"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* Portfolio Summary - Only show when portfolio tab is active */}
      {activeTab === 'portfolio' && (
        <>
          <div className="mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Portfolio Summary</h2>
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Total Items</p>
                </div>
                <p className="text-3xl font-bold text-white ml-4">{portfolioItems.length}</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Total Value</p>
                </div>
                <p className="text-3xl font-bold text-white ml-4">฿{totalValue.toLocaleString()}</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-teal-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Average Value</p>
                </div>
                <p className="text-3xl font-bold text-white ml-4">
                  ฿{portfolioItems.length > 0 
                    ? (totalValue / portfolioItems.length).toLocaleString(undefined, {maximumFractionDigits: 0}) 
                    : 0}
                </p>
              </div>
            </div>
          </div>
          
          {/* Portfolio Analytics */}
          {portfolioItems.length > 0 && (
            <PortfolioAnalytics portfolioItems={portfolioItems} />
          )}
        </>
      )}
      
      {/* Favorites Summary - Only show when favorites tab is active */}
      {activeTab === 'favorites' && (
        <div className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">Favorites Summary</h2>
            <div className="flex items-center gap-2">
              <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-1 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></div>
                <p className="text-gray-300 font-medium">Total Favorites</p>
              </div>
              <p className="text-3xl font-bold text-white ml-4">{favoriteItems.length}</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-1 bg-gradient-to-b from-pink-400 to-purple-500 rounded-full"></div>
                <p className="text-gray-300 font-medium">Tracking</p>
              </div>
              <p className="text-3xl font-bold text-white ml-4">Price Changes & Availability</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Items List */}
      {activeTab === 'portfolio' ? (
        <PortfolioList 
          portfolioItems={portfolioItems}
          onRemoveFromPortfolio={handleRemoveFromPortfolio}
          onUpdateQuantity={handleUpdateQuantity}
        />
      ) : formattedBakuganItems.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-1 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></div>
          </div>
          <p className="text-white text-xl font-medium mb-6">
            You don't have any favorites yet.
          </p>
          <Link 
            href="/bakumania"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-pink-500/20"
          >
            Browse Bakugan to Add
          </Link>
        </div>
      ) : (
        <BakuganList
          filteredItems={formattedBakuganItems}
          loading={loading}
          isTransitioning={false}
          error={error}
          priceHistories={priceHistories}
          pagination={{ limit: 100 }}
          isAdmin={false}
          favoriteItems={formattedFavoriteItems}
          portfolioItems={formattedPortfolioItems}
          onUpdatePrice={() => {}}
          onRemoveFromFavorite={handleRemoveFromFavorite}
          onRemoveFromPortfolio={handleRemoveFromPortfolio}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}
