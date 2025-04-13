'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { BakuganCardProps, PriceTrend } from './types';
import BakuganInfo from './BakuganInfo';
import PriceDisplay from './PriceDisplay';
import AdminButtons from './AdminButtons';
import PriceUpdateForm from './PriceUpdateForm';
import BakuganEditForm from './BakuganEditForm';
import PriceHistoryChart from './PriceHistoryChart';

const BakuganCard = ({
  id,
  names,
  size,
  element,
  specialProperties,
  imageUrl,
  currentPrice,
  referenceUri,
  priceHistory,
  onUpdatePrice,
  onUpdateDetails,
}: BakuganCardProps) => {
  const { user } = useAuth();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [displayPrice, setDisplayPrice] = useState<number | null>(null);

  // Calculate price trends based on filtered data
  const calculatePriceTrend = (): PriceTrend => {
    if (priceHistory.length < 2) return { trend: 'stable', percentage: '0' };
    
    // The newest price is the first item in the array
    const newestPrice = priceHistory[0].price;
    // The oldest price is the last item in the array
    const oldestPrice = priceHistory[priceHistory.length - 1].price;
    
    const priceDiff = newestPrice - oldestPrice;
    const percentageChange = (priceDiff / oldestPrice) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 1) trend = 'up';
    if (percentageChange < -1) trend = 'down';
    
    return {
      trend,
      percentage: Math.abs(percentageChange).toFixed(1)
    };
  };
  
  const priceTrend = calculatePriceTrend();

  // Initialize with null displayPrice to ensure loading state
  useEffect(() => {
    // Reset displayPrice to null on component mount or when priceHistory changes
    setDisplayPrice(null);
    setIsChartLoading(true);
  }, [priceHistory]); // Reset when priceHistory changes
  
  // Set chart as loaded when price history data is available or confirmed empty
  useEffect(() => {
    // Only set display price when price history is loaded
    if (priceHistory && priceHistory.length > 0) {
      // Short timeout to ensure smooth transition and complete loading
      const timer = setTimeout(() => {
        setDisplayPrice(priceHistory[0].price);
        setIsChartLoading(false);
      }, 800); // Increased timeout to ensure data is fully loaded
      return () => clearTimeout(timer);
    } else if (priceHistory) {
      // If price history is empty array (not undefined/null), use currentPrice
      const timer = setTimeout(() => {
        setDisplayPrice(currentPrice);
        setIsChartLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [priceHistory, currentPrice]);

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-premium hover:-translate-y-1 card-shimmer animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Image and Info */}
        <div className="md:w-1/3">
          <BakuganInfo
            names={names}
            size={size}
            element={element}
            specialProperties={specialProperties}
            imageUrl={imageUrl}
          />
          
          <PriceDisplay
            currentPrice={currentPrice}
            displayPrice={displayPrice}
            referenceUri={referenceUri}
            priceHistory={priceHistory}
            isChartLoading={isChartLoading}
            priceTrend={priceTrend}
          />
          
          {/* Admin buttons */}
          {user?.isAdmin && (
            <AdminButtons
              showUpdateForm={showUpdateForm}
              showEditForm={showEditForm}
              setShowUpdateForm={setShowUpdateForm}
              setShowEditForm={setShowEditForm}
              hasUpdateDetails={!!onUpdateDetails}
            />
          )}
        </div>

        {/* Right Column: Chart, Update Form, and Edit Form */}
        <div className="md:w-2/3">
          {showUpdateForm && user?.isAdmin ? (
            <PriceUpdateForm
              id={id}
              onUpdatePrice={onUpdatePrice}
              onCancel={() => setShowUpdateForm(false)}
            />
          ) : showEditForm && user?.isAdmin && onUpdateDetails ? (
            <BakuganEditForm
              id={id}
              initialNames={names}
              initialSize={size}
              initialElement={element}
              initialSpecialProperties={specialProperties}
              initialImageUrl={imageUrl}
              initialReferenceUri={referenceUri}
              onUpdateDetails={onUpdateDetails}
              onCancel={() => setShowEditForm(false)}
            />
          ) : (
            <PriceHistoryChart
              priceHistory={priceHistory}
              isChartLoading={isChartLoading}
              priceTrend={priceTrend}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BakuganCard;
