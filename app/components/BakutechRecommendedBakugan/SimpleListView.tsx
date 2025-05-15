'use client';

import { memo } from 'react';
import { BakutechRecommendation } from './types';
import { getMostRecentPrice } from './utils';

interface SimpleListViewProps {
  recommendations: BakutechRecommendation[];
  allImagesLoaded: boolean;
  useSimpleView: boolean;
  setUseSimpleView: (value: boolean) => void;
  isMobile?: boolean;
}

// Memoized list item component to prevent unnecessary re-renders
const BakuganListItem = memo(({ recommendation, allImagesLoaded }: { 
  recommendation: BakutechRecommendation;
  allImagesLoaded: boolean;
}) => {
  // Pre-calculate values to avoid recalculation during render
  const firstLetter = recommendation.bakuganId.names[0].charAt(0);
  const name = recommendation.bakuganId.names[0];
  const price = getMostRecentPrice(recommendation.bakuganId).toLocaleString();
  const hasImage = Boolean(recommendation.bakuganId.imageUrl);
  
  return (
    <div 
      className="flex items-center p-2 rounded-lg bg-black/30 border border-blue-500/20"
    >
      {/* Use letter placeholder or optimized image */}
      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
        {hasImage && allImagesLoaded ? (
          <img 
            src={recommendation.bakuganId.imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
            loading="eager" // Change to eager for faster loading in simple view
          />
        ) : (
          <span className="text-blue-300 text-lg font-bold">
            {firstLetter}
          </span>
        )}
      </div>
      
      {/* Simple content layout */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white truncate">
          {name}
        </h3>
        <div className="flex justify-between items-center">
          <div className="text-green-400 text-xs font-bold">
            ฿{price}
          </div>
          <div className="text-xs text-white px-1 py-0.5 rounded bg-blue-500/50">
            {recommendation.rank}
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for debugging
BakuganListItem.displayName = 'BakuganListItem';

// Main component also memoized
const SimpleListView = memo(({ 
  recommendations, 
  allImagesLoaded, 
  useSimpleView, 
  setUseSimpleView,
  isMobile = false
}: SimpleListViewProps) => {
  // Only show top 5 recommendations
  const visibleRecommendations = recommendations.slice(0, 5);
  
  // Handle view toggle
  const handleViewToggle = () => {
    setUseSimpleView(false);
  };
  
  return (
    <div className="w-full relative rounded-xl z-50 py-2">
      <div className="absolute inset-0 bg-black/50 rounded-xl" />
      
      <div className="flex flex-col space-y-2 p-2 relative z-10">
        {visibleRecommendations.map((recommendation) => (
          <BakuganListItem 
            key={recommendation._id}
            recommendation={recommendation}
            allImagesLoaded={allImagesLoaded}
          />
        ))}
      </div>
      
      {!allImagesLoaded && (
        <div className="text-center mt-2 text-blue-300 text-xs">
          Loading gallery...
        </div>
      )}
      
      {useSimpleView && allImagesLoaded && !isMobile && (
        <div className="text-center mt-2 relative z-50">
          <button 
            onClick={handleViewToggle}
            className="text-blue-300 text-xs bg-blue-500/20 px-2 py-1 rounded-lg hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors"
          >
            Switch to 3D View
          </button>
        </div>
      )}
    </div>
  );
});

// Set display name for debugging
SimpleListView.displayName = 'SimpleListView';

export default SimpleListView;
