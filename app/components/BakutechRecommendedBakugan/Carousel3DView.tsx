'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { BakutechRecommendation } from './types';
import { getMedalColor, getMedalText, getMostRecentPrice } from './utils';

interface Carousel3DViewProps {
  recommendations: BakutechRecommendation[];
  isExpanded: boolean;
  isMobile: boolean;
  isTablet: boolean;
  pricesLoading: boolean;
  setUseSimpleView: (value: boolean) => void;
}

const Carousel3DView = ({ 
  recommendations, 
  isExpanded, 
  isMobile, 
  isTablet, 
  pricesLoading,
  setUseSimpleView
}: Carousel3DViewProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef<number>(0);

  // Highly optimized animation loop for auto-rotation with smoother motion and reduced re-renders
  useEffect(() => {
    // Update rotation ref to avoid unnecessary re-renders
    rotationRef.current = rotation;
    
    let lastTime = 0;
    // Further reduce rotation speed for better performance
    const rotationSpeed = isMobile ? 0.008 : isTablet ? 0.012 : 0.025;
    
    // Increase throttling for even better performance
    const frameInterval = isMobile ? 6 : isTablet ? 4 : 2; // Higher values = fewer updates
    let frameCount = 0;
    
    // Use a separate variable to track rotation without triggering re-renders
    let currentRotation = rotation;
    
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      frameCount++;
      
      if (autoRotate) {
        // Update internal rotation value on every frame
        currentRotation = (currentRotation + rotationSpeed * (deltaTime / 16.67)) % 360;
        
        // Only update state on certain frames to reduce render frequency
        if (frameCount % frameInterval === 0) {
          // Update rotation state (this will trigger a re-render)
          setRotation(currentRotation);
        }
        
        // Always update ref value for consistent motion
        rotationRef.current = currentRotation;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, isMobile, isTablet]);

  return (
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
      {/* Simplified background effects for better performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black/80 to-indigo-900/30" />
      {/* Remove complex radial gradient and noise texture on mobile/tablet */}
      {!isMobile && !isTablet && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        </>
      )}
      {/* Simplified glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[50px] rounded-full"></div>
      
      {/* Removed button from here - now positioned below the carousel */}
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
          {recommendations.slice(0, isExpanded ? recommendations.length : 5).map((recommendation, index) => {
            const angle = (360 / (isExpanded ? recommendations.length : 5)) * index + rotation;
            const radian = (angle * Math.PI) / 180;
            // Adjust radius based on device type
            const radius = isMobile ? 130 : isTablet ? 200 : 250;
            
            const x = Math.sin(radian) * radius;
            const z = Math.cos(radian) * radius;
            const scale = (z + radius) / (radius * 2);
            
            // Performance optimization: only render visible items
            const isVisible = scale > 0.2;
            
            // Skip rendering items that aren't visible on mobile
            if (!isVisible && isMobile) return null;
            
            // For tablets, only render fewer items to improve performance
            if (isTablet) {
              // Only show items that are more prominently visible
              if (scale < 0.4) return null;
            }
            
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
                  className={`relative ${isMobile ? 'w-56 h-72' : isTablet ? 'w-64 h-80' : 'w-64 h-80 md:w-72 md:h-96'} rounded-xl overflow-hidden shadow-lg ${
                    !isMobile && hoveredIndex === index ? 'scale-110 shadow-blue-500/40 shadow-xl z-50 brightness-110' : 
                    !isMobile && hoveredIndex !== null ? 'brightness-50' : ''
                  }`}
                  style={{
                    // Use hardware acceleration
                    willChange: 'transform',
                    // Use simpler transitions on tablet
                    transition: isMobile ? 'none' : isTablet ? 'transform 200ms linear' : 'all 300ms ease-out'
                  }}
                >
                  {/* Enhanced background glow based on rank */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getMedalColor(recommendation.rank)} opacity-10`}></div>
                  {/* Only use pulse animation on desktop */}
                  {!isMobile && !isTablet && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getMedalColor(recommendation.rank)} opacity-0 ${
                      hoveredIndex === index ? 'animate-pulse-slow opacity-20' : ''
                    }`}></div>
                  )}
                  
                  {/* Bakugan Image with Smooth Loading */}
                  <div className="absolute inset-0 w-full h-full">
                    {recommendation.bakuganId.imageUrl ? (
                      <div className="relative w-full h-full">
                        {/* Placeholder/Skeleton while loading */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-600/20 animate-pulse">
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-blue-300 text-5xl font-bold opacity-30">
                              {recommendation.bakuganId.names[0].charAt(0)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Use regular img tag on mobile for better performance */}
                        {isMobile ? (
                          <img
                            src={recommendation.bakuganId.imageUrl}
                            alt={recommendation.bakuganId.names[0]}
                            className="w-full h-full object-cover"
                            loading={recommendation.rank === 1 ? "eager" : "lazy"}
                          />
                        ) : (
                          <Image
                            src={recommendation.bakuganId.imageUrl}
                            alt={recommendation.bakuganId.names[0]}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            priority={recommendation.rank === 1} // Only prioritize rank 1 image
                            loading={recommendation.rank === 1 ? "eager" : "lazy"}
                            className={`object-cover transition-opacity duration-300 ${
                              recommendation.rank === 1 ? "opacity-100" : "opacity-0"
                            }`}
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                            onLoadingComplete={(image) => {
                              // Fade in the image once it's loaded
                              image.classList.remove('opacity-0');
                              image.classList.add('opacity-100');
                            }}
                            unoptimized={isTablet} // Skip Next.js image optimization for tablets too
                          />
                        )}
                      </div>
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
                  
                  {/* Shine effect - only on desktop */}
                  {!isMobile && !isTablet && (
                    <div 
                      className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 ${
                        hoveredIndex === index ? 'animate-shine-slow' : ''
                      }`}
                    ></div>
                  )}
                  
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
                  
                  {/* Enhanced shine effect - only on desktop */}
                  {!isMobile && !isTablet && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Carousel3DView;
