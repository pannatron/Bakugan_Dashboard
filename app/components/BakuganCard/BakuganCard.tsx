'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { useSession, signIn } from 'next-auth/react';
import { BakuganCardProps, PriceTrend } from './types';
import BakuganInfo from './BakuganInfo';
import PriceDisplay from './PriceDisplay';
import AdminButtons from './AdminButtons';
import PriceUpdateForm from './PriceUpdateForm';
import BakuganEditForm from './BakuganEditForm';
import PriceHistoryChart from './PriceHistoryChart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BakuganCard = ({
  id,
  names,
  size,
  element,
  specialProperties,
  series,
  imageUrl,
  currentPrice,
  referenceUri,
  priceHistory,
  isInFavorites,
  isInPortfolio,
  favoriteId,
  portfolioId,
  quantity,
  activeTab = 'main',
  onUpdatePrice,
  onUpdateDetails,
  onDeleteBakugan,
  onAddToFavorite,
  onRemoveFromFavorite,
  onAddToPortfolio,
  onRemoveFromPortfolio,
  onUpdatePortfolioQuantity,
}: BakuganCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: session } = useSession();
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
            series={series}
            imageUrl={imageUrl}
            difficultyOfObtaining={priceHistory?.[0]?.difficultyOfObtaining}
          />
          
          <PriceDisplay
            currentPrice={currentPrice}
            displayPrice={displayPrice}
            referenceUri={referenceUri}
            priceHistory={priceHistory}
            isChartLoading={isChartLoading}
            priceTrend={priceTrend}
          />
          
          {/* Admin buttons and action buttons */}
          <div className="flex flex-col gap-2">
            {user?.isAdmin && (
              <AdminButtons
                showUpdateForm={showUpdateForm}
                showEditForm={showEditForm}
                setShowUpdateForm={setShowUpdateForm}
                setShowEditForm={setShowEditForm}
                hasUpdateDetails={!!onUpdateDetails}
                onDelete={onDeleteBakugan ? () => onDeleteBakugan(id) : undefined}
              />
            )}
            
            {/* Favorite Button - Always show in main list */}
            {isInFavorites ? (
              <button
                onClick={() => onRemoveFromFavorite && favoriteId && onRemoveFromFavorite(favoriteId)}
                className="w-full px-4 py-2 rounded-lg bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors flex items-center justify-center gap-2"
                disabled={!session}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Remove from Favorites
              </button>
            ) : (
              <button
                onClick={() => {
                  if (session) {
                    onAddToFavorite && onAddToFavorite(id);
                  } else {
                    signIn();
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {session ? 'Add to Favorites' : 'Login to Add to Favorites'}
              </button>
            )}
            
            {/* Difficulty Stars - Increasing size and effects */}
            <div className="mt-2 mb-2 relative">
              <div className="flex justify-center items-center py-0">
                {Array.from({ length: 10 }).map((_, index) => {
                  // Calculate if star should be filled
                  const difficultyValue = priceHistory?.[0]?.difficultyOfObtaining || 5;
                  const isFilled = index < difficultyValue;
                  
                  // Calculate size (increasing from left to right)
                  const size = 18 + (index * 0.8); // Increased base size from 14 to 18
                  
                  // Styling for filled stars with enhanced effects based on difficulty
                  if (isFilled) {
                    // Calculate effect intensity based on star position and total filled stars
                    const effectIntensity = (index + 1) / difficultyValue;
                    const rotationDeg = (index % 2 === 0) ? 2 : -2; // Very subtle alternate rotation
                    
                    // Pastel blue colors
                    const pastelBlue1 = "rgb(138, 180, 248)"; // Light pastel blue
                    const pastelBlue2 = "rgb(108, 156, 240)"; // Slightly darker pastel blue
                    
                    return (
                      <div 
                        key={index} 
                        className="relative mx-0.5 transform hover:scale-110 transition-all duration-300"
                        style={{
                          transform: `rotate(${rotationDeg}deg)`,
                          zIndex: index + 1, // Higher stars appear on top
                          animation: `twinkle ${3 + Math.random() * 2}s infinite alternate ease-in-out`, // Subtle twinkling effect
                        }}
                      >
                        {/* Star with pastel blue color and subtle twinkling */}
                        <div 
                          className="relative flex items-center justify-center"
                          style={{ 
                            fontSize: `${size}px`,
                            filter: `drop-shadow(0px 0px ${1 + (effectIntensity * 0.5)}px rgba(138,180,248,${0.3}))`,
                            // No pulse animation as requested
                          }}
                        >
                          <span style={{ 
                            backgroundImage: `linear-gradient(135deg, ${pastelBlue1}, ${pastelBlue2})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                          }}>
                            ★
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    // Empty stars with subtle styling
                    return (
                      <span 
                        key={index} 
                        className="text-gray-700 mx-0.5 opacity-10" // Reduced opacity further
                        style={{ 
                          fontSize: `${size}px`
                        }}
                      >
                        ★
                      </span>
                    );
                  }
                })}
              </div>
              {/* Add keyframes for twinkling animation */}
              <style jsx>{`
                @keyframes twinkle {
                  0% { opacity: 0.85; transform: scale(1); }
                  100% { opacity: 1; transform: scale(1.05); }
                }
              `}</style>
              
              <div className="text-center mt-1">
                <span className="text-xs font-medium" style={{ 
                  backgroundImage: 'linear-gradient(135deg, rgb(138, 180, 248, 0.8), rgb(108, 156, 240, 0.8))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Difficulty: {priceHistory?.[0]?.difficultyOfObtaining || 5}/10
                </span>
              </div>
            </div>
            
            {/* Portfolio Button - Only show in favorites view */}
            {activeTab === 'favorites' && (
              isInPortfolio ? (
                <button
                  onClick={() => onRemoveFromPortfolio && portfolioId && onRemoveFromPortfolio(portfolioId)}
                  className="w-full px-4 py-2 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-600/30 hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-2"
                  disabled={!session}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 100 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0z" clipRule="evenodd" />
                  </svg>
                  Remove from Portfolio
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (session) {
                      onAddToPortfolio && onAddToPortfolio(id);
                    } else {
                      signIn();
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-green-600/30 text-green-300 border border-green-600/30 hover:bg-green-600/50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add to Portfolio
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Column: Chart, Update Form, and Edit Form */}
        <div className="md:w-2/3">
          {showUpdateForm && user?.isAdmin ? (
            <PriceUpdateForm
              id={id}
              initialDifficultyOfObtaining={priceHistory?.[0]?.difficultyOfObtaining || 5}
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
            initialSeries={series}
            initialImageUrl={imageUrl}
            initialReferenceUri={referenceUri}
            initialDifficultyOfObtaining={priceHistory?.[0]?.difficultyOfObtaining || 5}
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
