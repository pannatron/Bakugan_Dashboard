'use client';

import { useState } from 'react';
import PortfolioCard from './BakuganCard/PortfolioCard';

interface PortfolioItem {
  portfolioId: string;
  addedAt: string;
  notes?: string;
  quantity: number;
  bakugan: any;
}

interface PortfolioListProps {
  portfolioItems: PortfolioItem[];
  onRemoveFromPortfolio: (portfolioId: string) => Promise<void>;
  onUpdateQuantity: (portfolioId: string, quantity: number) => Promise<void>;
}

const PortfolioList = ({
  portfolioItems,
  onRemoveFromPortfolio,
  onUpdateQuantity,
}: PortfolioListProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateQuantity = async (portfolioId: string, quantity: number) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      await onUpdateQuantity(portfolioId, quantity);
      
      // Log success for debugging
      console.log(`Successfully updated quantity for portfolio item ${portfolioId} to ${quantity}`);
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate total portfolio value
  const totalValue = portfolioItems.reduce((sum, item) => {
    return sum + (item.bakugan?.currentPrice || 0) * (item.quantity || 1);
  }, 0);

  return (
    <div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Portfolio Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolioItems.map((item) => (
          <div key={item.portfolioId} className="relative">
            <PortfolioCard
              id={item.bakugan._id}
              names={item.bakugan.names}
              element={item.bakugan.element}
              imageUrl={item.bakugan.imageUrl}
              currentPrice={item.bakugan.currentPrice}
              portfolioId={item.portfolioId}
              quantity={item.quantity}
              onRemoveFromPortfolio={onRemoveFromPortfolio}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {portfolioItems.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <p className="text-gray-400 text-lg mb-4">Your portfolio is empty.</p>
          <a 
            href="/bakumania"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
          >
            Browse Bakugan to Add
          </a>
        </div>
      )}
    </div>
  );
};

export default PortfolioList;
