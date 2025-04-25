'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BakuganList from '../components/BakuganList';
import Link from 'next/link';

interface FavoriteItem {
  favoriteId: string;
  addedAt: string;
  notes?: string;
  bakugan: any;
}

interface PortfolioItem {
  portfolioId: string;
  addedAt: string;
  notes?: string;
  quantity: number;
  bakugan: any;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, any[]>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/favorites');
    }
  }, [status, router]);

  // Fetch favorites and portfolio data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== 'authenticated') return;

      try {
        setLoading(true);
        
        // Fetch favorites data
        const favoritesResponse = await fetch('/api/favorites');
        if (!favoritesResponse.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const favoritesData = await favoritesResponse.json();
        setFavoriteItems(favoritesData);
        
        // Fetch portfolio data for cross-reference
        const portfolioResponse = await fetch('/api/portfolio');
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          setPortfolioItems(portfolioData);
        }
        
        // Fetch price histories for all bakugan in favorites
        const histories: Record<string, any[]> = {};
        await Promise.all(
          favoritesData.map(async (item: FavoriteItem) => {
            if (item.bakugan?._id) {
              try {
                const historyResponse = await fetch(`/api/bakugan/${item.bakugan._id}`);
                if (historyResponse.ok) {
                  const historyData = await historyResponse.json();
                  histories[item.bakugan._id] = historyData.priceHistory || [];
                }
              } catch (err) {
                console.error(`Error fetching price history for ${item.bakugan._id}:`, err);
              }
            }
          })
        );
        
        setPriceHistories(histories);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError(err.message || 'Failed to fetch favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status]);

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

  // Handle adding a bakugan to portfolio
  const handleAddToPortfolio = async (bakuganId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bakuganId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add the bakugan to the local portfolio items state
        const bakugan = favoriteItems.find(item => item.bakugan._id === bakuganId)?.bakugan;
        if (bakugan) {
          setPortfolioItems(prev => [...prev, {
            portfolioId: data.portfolioItem.id,
            addedAt: data.portfolioItem.addedAt,
            notes: data.portfolioItem.notes,
            quantity: data.portfolioItem.quantity,
            bakugan
          }]);
        }
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    }
  };

  // Handle removing a bakugan from portfolio
  const handleRemoveFromPortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the item from the local state
        setPortfolioItems(prev => prev.filter(item => item.portfolioId !== portfolioId));
      }
    } catch (error) {
      console.error('Error removing from portfolio:', error);
    }
  };

  // Format bakugan items for BakuganList component
  const formattedBakuganItems = favoriteItems
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-300 mb-4">Your Favorite Bakugan</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <p className="text-gray-300">
            Track your favorite Bakugan and their price changes over time.
          </p>
          <div className="flex gap-2">
            <Link 
              href="/portfolio"
              className="px-4 py-2 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-600/30 hover:bg-purple-600/50 transition-colors"
            >
              View Portfolio
            </Link>
            <Link 
              href="/bakumania"
              className="px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
            >
              Browse More Bakugan
            </Link>
          </div>
        </div>
      </div>
      
      {/* Favorites Summary */}
      <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 mb-8">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Favorites Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-1">Total Favorites</p>
            <p className="text-2xl font-bold text-white">{favoriteItems.length}</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-1">Tracking</p>
            <p className="text-2xl font-bold text-white">Price Changes & Availability</p>
          </div>
        </div>
      </div>
      
      {/* Favorites List */}
      {formattedBakuganItems.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <p className="text-gray-400 text-lg mb-4">You don't have any favorites yet.</p>
          <Link 
            href="/bakumania"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
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
          activeTab="favorites"
          onUpdatePrice={() => {}}
          onRemoveFromFavorite={handleRemoveFromFavorite}
          onAddToPortfolio={handleAddToPortfolio}
          onRemoveFromPortfolio={handleRemoveFromPortfolio}
        />
      )}
    </div>
  );
}
