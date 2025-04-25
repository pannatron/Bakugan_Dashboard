'use client';

import { useState, useEffect } from 'react';
import { elements } from '@/app/types/bakugan';

interface PortfolioCardProps {
  id: string;
  names: string[];
  element: string;
  imageUrl: string;
  currentPrice: number;
  portfolioId?: string;
  quantity?: number;
  onRemoveFromPortfolio?: (portfolioId: string) => void;
  onUpdateQuantity?: (portfolioId: string, quantity: number) => void;
}

const PortfolioCard = ({
  id,
  names,
  element,
  imageUrl,
  currentPrice,
  portfolioId,
  quantity = 1,
  onRemoveFromPortfolio,
  onUpdateQuantity,
}: PortfolioCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setError('Quantity must be at least 1');
      setNewQuantity(1);
    } else {
      setError(null);
      setNewQuantity(value);
    }
  };

  const handleUpdateQuantity = async () => {
    if (error) return;
    
    // Store the quantity value we're going to update to
    const numericQuantity = Number(newQuantity);
    
    // Don't update if the quantity hasn't changed
    if (numericQuantity === quantity) return;
    
    setIsUpdating(true);
    try {
      if (portfolioId && onUpdateQuantity) {
        console.log(`Updating quantity to ${numericQuantity} for item ${portfolioId}`);
        
        // Call the update function
        await onUpdateQuantity(portfolioId, numericQuantity);
        
        // We don't need to set newQuantity here as it will be updated
        // when the quantity prop changes via the useEffect
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
      // Reset to the original quantity on error
      setNewQuantity(quantity);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Update the internal state when the quantity prop changes
  useEffect(() => {
    setNewQuantity(quantity);
  }, [quantity]);

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium hover:-translate-y-1">
      <div className="flex items-center gap-4">
        {/* Element Icon */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-8 h-8 rounded-full bg-gray-800/80 p-1 border border-gray-700/50 flex items-center justify-center">
            {elements.find(e => e.value === element) && (
              <img 
                src={elements.find(e => e.value === element)?.image} 
                alt={element}
                className="w-5 h-5 object-contain"
              />
            )}
          </div>
        </div>
        
        {/* Image */}
        <div className="relative w-16 h-16 overflow-hidden rounded-lg" style={{ 
          backgroundColor: '#4A5056',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={names && names.length > 0 ? names[0] : 'Bakugan'}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-blue-600/20">
              <span className="text-blue-300">{names && names.length > 0 ? names[0].charAt(0) : 'B'}</span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-300 truncate">
            {names && names.length > 0 ? names[0] : 'Unknown Bakugan'}
          </h3>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-green-300 font-medium text-sm">฿{currentPrice.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Quantity Input */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center">
            <label htmlFor={`quantity-${id}`} className="text-xs text-gray-400 mr-2">Qty:</label>
            <input
              id={`quantity-${id}`}
              type="number"
              min="1"
              value={newQuantity}
              onChange={handleQuantityChange}
              className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {error && <p className="text-xs text-red-400">{error}</p>}
          
          {quantity !== newQuantity && !error && (
            <button
              onClick={handleUpdateQuantity}
              disabled={isUpdating}
              className="text-xs px-2 py-1 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>
      </div>
      
      {/* Remove Button */}
      {portfolioId && onRemoveFromPortfolio && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onRemoveFromPortfolio(portfolioId)}
            className="text-xs px-2 py-1 bg-red-600/30 text-red-300 rounded-lg hover:bg-red-600/50 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
