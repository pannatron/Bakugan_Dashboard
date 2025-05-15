'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useImagePreloader } from '@/app/hooks/useImagePreloader';
import { BakutechRecommendation, BakutechRecommendedBakuganProps } from './types';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import SimpleListView from './SimpleListView';
import Carousel3DView from './Carousel3DView';
import Header from './Header';
import ShowMoreButton from './ShowMoreButton';

const BakutechRecommendedBakugan = ({ 
  onToggle, 
  useSimpleView, 
  setUseSimpleView 
}: BakutechRecommendedBakuganProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [recommendations, setRecommendations] = useState<BakutechRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isBakutech, setIsBakutech] = useState(true);

  // Function to toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prevState => !prevState);
  };

  // Check device type for responsive design (but don't set useSimpleView here)
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 768;
      const isTabletDevice = width >= 768 && width <= 1024;
      
      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Extract image URLs for preloading with rank 1 prioritized
  const { imageUrls, rank1ImageUrl } = useMemo(() => {
    // Sort recommendations by rank to ensure rank 1 is first
    const sortedRecs = [...recommendations].sort((a, b) => a.rank - b.rank);
    const urls = sortedRecs.map(rec => rec.bakuganId.imageUrl).filter(Boolean);
    
    // Get the rank 1 image URL if it exists
    const rank1Rec = recommendations.find(rec => rec.rank === 1);
    const rank1Url = rank1Rec?.bakuganId.imageUrl;
    
    return { 
      imageUrls: urls,
      rank1ImageUrl: rank1Url ? [rank1Url] : []
    };
  }, [recommendations]);

  // Use image preloader with rank 1 prioritization
  const { priorityImagesLoaded, allImagesLoaded, rank1ImageLoaded } = useImagePreloader(
    imageUrls, 
    3,
    rank1ImageUrl
  );

  // Fetch recommendations with optimized loading strategy
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/bakutech-recommendations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch BakuTech recommendations');
        }
        
        const data = await response.json();
        
        // Sort recommendations by rank to ensure rank 1 is first
        const sortedData = [...data].sort((a, b) => a.rank - b.rank);
        
        // Set recommendations immediately to start loading images
        setRecommendations(sortedData);
        setError(null);
        
        // Start loading prices separately
        fetchPriceData();
      } catch (err: any) {
        console.error('Error fetching BakuTech recommendations:', err);
        setError(err.message || 'Failed to fetch BakuTech recommendations');
        setLoading(false);
      }
    };
    
    // Separate function to fetch price data
    const fetchPriceData = () => {
      try {
        setPricesLoading(true);
        
        // Simulate price data loading with a slight delay
        // In a real implementation, this would be a separate API call
        setTimeout(() => {
          setPricesLoading(false);
        }, 1500);
      } catch (err: any) {
        console.error('Error fetching price data:', err);
        setPricesLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  // Optimized loading state management
  useEffect(() => {
    // If rank 1 image is loaded, show content immediately
    if (rank1ImageLoaded && loading && recommendations.length > 0) {
      setLoading(false);
      return;
    }
    
    // If rank 1 image isn't available but priority images are loaded, show content
    if (priorityImagesLoaded && loading && recommendations.length > 0) {
      setLoading(false);
      return;
    }
    
    // Fallback: show content quickly even if images aren't loaded yet
    if (recommendations.length > 0 && loading) {
      const quickShowTimer = setTimeout(() => {
        setLoading(false);
      }, 150); // Reduced from 200ms to 150ms for faster display
      
      return () => clearTimeout(quickShowTimer);
    }
  }, [rank1ImageLoaded, priorityImagesLoaded, loading, recommendations.length]);

  // Base classes for the widget
  const baseClasses = `
    w-full z-30 mb-8
    bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 
    backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 
    shadow-[0_0_15px_rgba(59,130,246,0.15)] 
    hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] 
    hover:border-blue-400/50
    transition-all duration-300 ease-in-out
    relative
  `;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (recommendations.length === 0) {
    return <EmptyState isAdmin={user?.isAdmin} />;
  }

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
      
      {/* Header with Toggle Button */}
      <Header 
        onToggle={onToggle}
        isAdmin={user?.isAdmin}
        isBakutech={isBakutech}
        setIsBakutech={setIsBakutech}
        isButtonHovered={isButtonHovered}
        setIsButtonHovered={setIsButtonHovered}
        isButtonClicked={isButtonClicked}
        setIsButtonClicked={setIsButtonClicked}
      />
      
      {/* Show simple list view during loading or on mobile devices */}
      {!allImagesLoaded || useSimpleView ? (
        <SimpleListView 
          recommendations={recommendations}
          allImagesLoaded={allImagesLoaded}
          useSimpleView={useSimpleView}
          setUseSimpleView={setUseSimpleView}
          isMobile={isMobile}
        />
      ) : (
        <>
          <Carousel3DView 
            recommendations={recommendations}
            isExpanded={isExpanded}
            isMobile={isMobile}
            isTablet={isTablet}
            pricesLoading={pricesLoading}
            setUseSimpleView={setUseSimpleView}
          />
          {/* Button to switch back to simple view - positioned below the carousel with higher z-index */}
          <div className="flex justify-center mt-2 relative z-50">
            <button 
              onClick={() => setUseSimpleView(true)}
              className="text-blue-300 text-xs bg-blue-500/20 px-2 py-1 rounded-lg hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors border border-blue-500/20 flex items-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>Switch to Simple View</span>
            </button>
          </div>
        </>
      )}
      
      {/* Show More/Less Button */}
      {recommendations.length > 5 && (
        <ShowMoreButton 
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
      )}
    </div>
  );
};

export default BakutechRecommendedBakugan;
