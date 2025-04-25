'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BakuganList from '../components/BakuganList';
import Link from 'next/link';

interface PortfolioItem {
  portfolioId: string;
  addedAt: string;
  notes?: string;
  bakugan: any;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [priceHistories, setPriceHistories] = useState<Record<string, any[]>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/portfolio');
    }
  }, [status, router]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (status !== 'authenticated') return;

      try {
        setLoading(true);
        const response = await fetch('/api/portfolio');
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        
        const data = await response.json();
        setPortfolioItems(data);
        
        // Calculate total portfolio value
        const total = data.reduce((sum: number, item: PortfolioItem) => {
          return sum + (item.bakugan?.currentPrice || 0);
        }, 0);
        
        setTotalValue(total);
        
        // Fetch price histories for all bakugan in portfolio
        const histories: Record<string, any[]> = {};
        await Promise.all(
          data.map(async (item: PortfolioItem) => {
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
        console.error('Error fetching portfolio:', err);
        setError(err.message || 'Failed to fetch portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [status]);

  // Handle removing a bakugan from favorites
  const handleRemoveFromFavorite = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the item from the local state
        setPortfolioItems(prev => prev.filter(item => item.portfolioId !== portfolioId));
        
        // Recalculate total value
        setTotalValue(prev => {
          const removedItem = portfolioItems.find(item => item.portfolioId === portfolioId);
          return prev - (removedItem?.bakugan?.currentPrice || 0);
        });
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  // Format bakugan items for BakuganList component
  const formattedBakuganItems = portfolioItems
    .filter(item => item.bakugan)
    .map(item => ({
      ...item.bakugan,
      portfolioId: item.portfolioId
    }));

  // Get portfolio IDs for checking if items are in portfolio
  const portfolioIds = portfolioItems.map(item => item.bakugan?._id).filter(Boolean);

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
        <h1 className="text-3xl font-bold text-blue-300 mb-4">Your Bakugan Portfolio</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <p className="text-gray-300">
            Manage your favorite Bakugan collection and track their value over time.
          </p>
          <Link 
            href="/bakumania"
            className="px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
          >
            Browse More Bakugan
          </Link>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 mb-8">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-1">Total Items</p>
            <p className="text-2xl font-bold text-white">{portfolioItems.length}</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-1">Total Value</p>
            <p className="text-2xl font-bold text-white">฿{totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-1">Average Item Value</p>
            <p className="text-2xl font-bold text-white">
              ฿{portfolioItems.length > 0 
                ? (totalValue / portfolioItems.length).toLocaleString(undefined, {maximumFractionDigits: 0}) 
                : 0}
            </p>
          </div>
        </div>
      </div>
      
      {/* Portfolio Items */}
      {formattedBakuganItems.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <p className="text-gray-400 text-lg mb-4">Your portfolio is empty.</p>
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
          portfolioItems={portfolioIds}
          onUpdatePrice={() => {}}
          onRemoveFromFavorite={handleRemoveFromFavorite}
        />
      )}
    </div>
  );
}
