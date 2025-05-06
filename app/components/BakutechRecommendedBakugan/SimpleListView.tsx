'use client';

import { BakutechRecommendation } from './types';
import { getMostRecentPrice } from './utils';

interface SimpleListViewProps {
  recommendations: BakutechRecommendation[];
  allImagesLoaded: boolean;
  useSimpleView: boolean;
  setUseSimpleView: (value: boolean) => void;
}

const SimpleListView = ({ 
  recommendations, 
  allImagesLoaded, 
  useSimpleView, 
  setUseSimpleView 
}: SimpleListViewProps) => {
  return (
    <div className="w-full relative rounded-xl z-50 py-2">
      <div className="absolute inset-0 bg-black/50 rounded-xl" />
      
      <div className="flex flex-col space-y-2 p-2 relative z-10">
        {recommendations.slice(0, 5).map((recommendation, index) => (
          <div 
            key={recommendation._id}
            className="flex items-center p-2 rounded-lg bg-black/30 border border-blue-500/20"
          >
            {/* Use letter placeholder or optimized image */}
            <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
              {recommendation.bakuganId.imageUrl && allImagesLoaded ? (
                <img 
                  src={recommendation.bakuganId.imageUrl} 
                  alt={recommendation.bakuganId.names[0]}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-blue-300 text-lg font-bold">
                  {recommendation.bakuganId.names[0].charAt(0)}
                </span>
              )}
            </div>
            
            {/* Simple content layout */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {recommendation.bakuganId.names[0]}
              </h3>
              <div className="flex justify-between items-center">
                <div className="text-green-400 text-xs font-bold">
                  ฿{getMostRecentPrice(recommendation.bakuganId).toLocaleString()}
                </div>
                <div className="text-xs text-white px-1 py-0.5 rounded bg-blue-500/50">
                  {recommendation.rank}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!allImagesLoaded && (
        <div className="text-center mt-2 text-blue-300 text-xs">
          Loading gallery...
        </div>
      )}
      
      {useSimpleView && allImagesLoaded && (
        <div className="text-center mt-2 relative z-50">
          <button 
            onClick={() => setUseSimpleView(false)}
            className="text-blue-300 text-xs bg-blue-500/20 px-2 py-1 rounded-lg hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors"
          >
            Switch to 3D View
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleListView;
