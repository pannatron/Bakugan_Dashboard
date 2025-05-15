'use client';

import { memo } from 'react';

// Optimized loading state with simpler animation and memoization
const LoadingState = memo(() => {
  // Use a simpler class structure to reduce CSS processing
  return (
    <div className="w-full z-30 mb-8 bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 shadow-md relative">
      {/* Simplified background animation */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-50"></div>
      
      {/* Static header */}
      <h2 className="text-xl font-semibold text-blue-300 mb-4 relative z-10">Recommended BakuTech</h2>
      
      {/* Simplified loading skeleton */}
      <div className="flex flex-col space-y-2 p-2 relative z-10">
        {/* Generate 5 skeleton items for a more realistic loading state */}
        {[...Array(5)].map((_, index) => (
          <div 
            key={index}
            className="flex items-center p-2 rounded-lg bg-black/30 border border-blue-500/20"
          >
            {/* Skeleton avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-900/50 mr-3 flex-shrink-0">
              <div className="w-full h-full bg-blue-500/20 animate-pulse rounded-full"></div>
            </div>
            
            {/* Skeleton content */}
            <div className="flex-1">
              <div className="h-4 bg-blue-500/20 animate-pulse rounded w-3/4 mb-2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-green-500/20 animate-pulse rounded w-1/4"></div>
                <div className="h-3 bg-blue-500/20 animate-pulse rounded w-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Set display name for debugging
LoadingState.displayName = 'LoadingState';

export default LoadingState;
