'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

interface PricePoint {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  priceHistory?: PricePoint[];
}

interface BakutechRecommendation {
  _id: string;
  bakuganId: Bakugan;
  rank: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface BakutechRecommendedBakuganProps {
  onToggle: () => void;
}

// Helper function to get the most recent price
const getMostRecentPrice = (bakugan: Bakugan): number => {
  if (bakugan.priceHistory && bakugan.priceHistory.length > 0) {
    return bakugan.priceHistory[0].price;
  }
  return bakugan.currentPrice;
};

const BakutechRecommendedBakugan = ({ onToggle }: BakutechRecommendedBakuganProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<BakutechRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isBakutech, setIsBakutech] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Function to toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prevState => !prevState);
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation loop for auto-rotation with smoother motion
  useEffect(() => {
    let lastTime = 0;
    const rotationSpeed = 0.05; // Reduced from 0.2 for smoother rotation
    
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (autoRotate) {
        // Use deltaTime to ensure consistent rotation speed regardless of frame rate
        setRotation(prev => (prev + rotationSpeed * (deltaTime / 16.67)) % 360);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate]);

  // Fetch recommendations and price history
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bakutech-recommendations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch BakuTech recommendations');
        }
        
        const data = await response.json();
        
        // Fetch price history for each Bakugan
        const recommendationsWithPriceHistory = await Promise.all(
          data.map(async (recommendation: BakutechRecommendation) => {
            try {
              const bakuganResponse = await fetch(`/api/bakugan/${recommendation.bakuganId._id}`);
              if (bakuganResponse.ok) {
                const bakuganData = await bakuganResponse.json();
                // Update the bakuganId with price history
                recommendation.bakuganId.priceHistory = bakuganData.priceHistory;
              }
            } catch (error) {
              console.error(`Error fetching price history for Bakugan ${recommendation.bakuganId._id}:`, error);
            }
            return recommendation;
          })
        );
        
        setRecommendations(recommendationsWithPriceHistory);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching BakuTech recommendations:', err);
        setError(err.message || 'Failed to fetch BakuTech recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-300 to-yellow-500'; // Gold
      case 2:
        return 'from-gray-300 to-gray-500'; // Silver
      case 3:
        return 'from-amber-600 to-amber-800'; // Bronze
      case 4:
        return 'from-purple-400 to-purple-600'; // Purple
      case 5:
        return 'from-teal-400 to-teal-600'; // Teal
      default:
        return 'from-blue-300 to-blue-500';
    }
  };

  // Get medal emoji based on rank
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      case 4:
        return '💫';
      case 5:
        return '⭐';
      default:
        return null;
    }
  };

  // Get medal text based on rank
  const getMedalText = (rank: number) => {
    switch (rank) {
      case 1:
        return 'Top Pick';
      case 2:
        return 'Runner Up';
      case 3:
        return 'Notable Mention';
      case 4:
        return 'Great Choice';
      case 5:
        return 'Solid Option';
      default:
        return 'Recommended';
    }
  };

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
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended BakuTech</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended BakuTech</h2>
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended BakuTech</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No BakuTech recommendations available yet.</p>
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
            >
              Add BakuTech Recommendations
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
      
      {/* Header with Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-blue-400 mr-2">🏆</span>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Recommended BakuTech
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className="px-2 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors text-xs"
            >
              Manage
            </Link>
          )}
        </div>
        
        {/* Compact icon button with independent state */}
        <button
          onClick={() => {
            onToggle();
            setIsButtonClicked(!isButtonClicked);
            setIsBakutech(!isBakutech);
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="ml-2 px-2 py-1 bg-transparent text-blue-400 hover:text-indigo-400 transition-all duration-300 hover:scale-110 relative z-50"
          aria-label="Switch between Bakugan and BakuTech"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">
              Switch to Bakugan
            </span>
          </div>
        </button>
      </div>
      
      {/* Enhanced 3D Carousel Gallery */}
      <div 
        className={`w-full h-[450px] relative ${hoveredIndex !== null ? '' : 'overflow-hidden'} rounded-xl cursor-grab active:cursor-grabbing z-50`}
        ref={containerRef}
        onMouseEnter={() => setAutoRotate(false)}
        onMouseLeave={() => {
          setIsDragging(false);
          setAutoRotate(true);
        }}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent default behavior
          setIsDragging(true);
          setStartX(e.clientX);
          setRotationOffset(rotation);
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            e.preventDefault(); // Prevent default behavior
            const sensitivity = 0.5; // Adjust for faster/slower rotation
            const deltaX = (e.clientX - startX) * sensitivity;
            setRotation(rotationOffset + deltaX);
          }
        }}
        onMouseUp={() => {
          setIsDragging(false);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          setStartX(e.touches[0].clientX);
          setRotationOffset(rotation);
        }}
        onTouchMove={(e) => {
          if (isDragging) {
            const sensitivity = 0.5;
            const deltaX = (e.touches[0].clientX - startX) * sensitivity;
            setRotation(rotationOffset + deltaX);
          }
        }}
        onTouchEnd={() => {
          setIsDragging(false);
        }}
      >
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black/80 to-indigo-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        
        {/* Ambient light effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-blue-500/10 blur-[80px] rounded-full"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
            {recommendations.slice(0, isExpanded ? recommendations.length : 5).map((recommendation, index) => {
              const angle = (360 / (isExpanded ? recommendations.length : 5)) * index + rotation;
              const radian = (angle * Math.PI) / 180;
              const radius = isMobile ? 150 : 250;
              
              const x = Math.sin(radian) * radius;
              const z = Math.cos(radian) * radius;
              const scale = (z + radius) / (radius * 2);
              
              return (
                <div
                  key={recommendation._id}
                  className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out will-change-transform cursor-pointer"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${0.6 + scale * 0.4})`,
                    zIndex: Math.round(scale * 100) + 40,
                    opacity: scale,
                    filter: `drop-shadow(0 ${10 * scale}px ${15 * scale}px rgba(59, 130, 246, ${0.2 * scale}))`
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    // Only trigger click if not dragging
                    if (!isDragging) {
                      // Navigate to the bakugan details or perform an action when clicked
                      console.log(`Clicked on ${recommendation.bakuganId.names[0]}`);
                      // You could add navigation here if needed
                    }
                    e.stopPropagation(); // Stop event propagation
                  }}
                >
                  <div 
                    className={`relative w-64 h-80 md:w-72 md:h-96 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-out ${
                      hoveredIndex === index ? 'scale-110 shadow-blue-500/40 shadow-xl z-50 brightness-110' : hoveredIndex !== null ? 'brightness-50' : ''
                    }`}
                  >
                    {/* Enhanced background glow based on rank */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getMedalColor(recommendation.rank)} opacity-10`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${getMedalColor(recommendation.rank)} opacity-0 ${
                      hoveredIndex === index ? 'animate-pulse-slow opacity-20' : ''
                    }`}></div>
                    
                    {/* Bakugan Image */}
                    <div className="absolute inset-0 w-full h-full">
                      {recommendation.bakuganId.imageUrl ? (
                        <img
                          src={recommendation.bakuganId.imageUrl}
                          alt={recommendation.bakuganId.names[0]}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-blue-600/20">
                          <span className="text-blue-300 text-5xl font-bold">
                            {recommendation.bakuganId.names[0].charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>
                    
                    {/* Premium shine effect */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 ${
                        hoveredIndex === index ? 'animate-shine-slow' : ''
                      }`}
                    ></div>
 
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-500/30 rounded-lg text-xs text-white backdrop-blur-sm border border-blue-500/30">
                          {recommendation.bakuganId.element}
                        </span>
                        <span className="px-2 py-1 bg-indigo-500/30 rounded-lg text-xs text-white backdrop-blur-sm border border-indigo-500/30">
                          {recommendation.bakuganId.size}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-1">
                        {recommendation.bakuganId.names[0]}
                      </h3>
                      
                      <div className="text-sm text-blue-200 mb-2 line-clamp-2">
                        {recommendation.reason}
                      </div>
                      
                      <div className="flex justify-between items-center">
                      <div className="text-green-400 font-bold">
                        ฿{getMostRecentPrice(recommendation.bakuganId).toLocaleString()}
                      </div>
                        <div className="text-xs text-white px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500/50 to-indigo-500/50 backdrop-blur-sm">
                          {getMedalText(recommendation.rank)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Show More/Less Button */}
      {recommendations.length > 5 && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={toggleExpanded}
            className="px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BakutechRecommendedBakugan;
