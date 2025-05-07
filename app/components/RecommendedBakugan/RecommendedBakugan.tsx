'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useImagePreloader } from '@/app/hooks/useImagePreloader';
import { RecommendedBakuganProps, Recommendation } from './types';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import Header from './Header';
import SimpleListView from './SimpleListView';
import Carousel3DView from './Carousel3DView';
import ShowMoreButton from './ShowMoreButton';
import { baseClasses } from './utils';

const RecommendedBakugan = ({ 
  onToggle, 
  useSimpleView, 
  setUseSimpleView 
}: RecommendedBakuganProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isBakugan, setIsBakugan] = useState(true);

  // Function to toggle expanded state
  const toggleExpanded = () => {
    setIsButtonClicked(!isButtonClicked);
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

  // Extract image URLs for preloading
  const imageUrls = useMemo(() => {
    return recommendations.map(rec => rec.bakuganId.imageUrl).filter(Boolean);
  }, [recommendations]);

  // Use image preloader
  const { priorityImagesLoaded, allImagesLoaded } = useImagePreloader(imageUrls, 3);
  
  // This effect was moved to the Carousel3DView component

  // Fetch recommendations with optimized loading strategy using combined endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setPricesLoading(true);
        
        console.log('Fetching combined recommendation data...');
        const startTime = performance.now();
        
        // Use the new combined endpoint that returns both basic data and price history in one request
        const response = await fetch('/api/recommendations/combined', {
          cache: 'force-cache', // Use cache if available
          next: { revalidate: 300 } // Revalidate every 5 minutes
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        const endTime = performance.now();
        console.log(`Combined recommendation data fetched in ${endTime - startTime}ms`);
        
        // Set recommendations with price history already included
        setRecommendations(data as Recommendation[]);
        setError(null);
        setLoading(false);
        setPricesLoading(false);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations');
        setLoading(false);
        setPricesLoading(false);
      }
    };
    
    // Start the optimized data fetching process
    fetchData();
    
    // Set up a cleanup function
    return () => {
      // Any cleanup needed
    };
  }, []);

  // Faster loading state updates - combined into a single effect
  useEffect(() => {
    // Show content as soon as we have data or priority images are loaded
    if ((recommendations.length > 0 && loading) || 
        (priorityImagesLoaded && loading && recommendations.length > 0)) {
      setLoading(false);
    }
  }, [recommendations.length, loading, priorityImagesLoaded]);

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
        isButtonHovered={isButtonHovered}
        setIsButtonHovered={setIsButtonHovered}
        isButtonClicked={isButtonClicked}
        setIsButtonClicked={setIsButtonClicked}
        isBakugan={isBakugan}
        setIsBakugan={setIsBakugan}
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
      <ShowMoreButton 
        isExpanded={isExpanded}
        toggleExpanded={toggleExpanded}
        recommendationsCount={recommendations.length}
      />
    </div>
  );
};

export default RecommendedBakugan;
