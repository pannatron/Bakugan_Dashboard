'use client';

import { useState, useEffect, useRef } from 'react';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __IMAGE_CACHE__?: Map<string, boolean>;
  }
}

/**
 * Custom hook for optimized image preloading with caching
 * @param imageUrls Array of image URLs to preload
 * @param priorityCount Number of images to load with high priority
 * @param priorityUrls Optional array of specific URLs to prioritize (e.g., rank 1 image)
 * @returns Object containing loading status
 */
export function useImagePreloader(
  imageUrls: string[], 
  priorityCount: number = 3,
  priorityUrls: string[] = []
) {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [priorityImagesLoaded, setPriorityImagesLoaded] = useState<boolean>(false);
  const [rank1ImageLoaded, setRank1ImageLoaded] = useState<boolean>(false);
  
  // Use a ref to persist the cached URLs between renders
  const cachedUrls = useRef<Set<string>>(new Set());
  
  // Use a ref to store the global image cache
  const globalImageCache = useRef<Map<string, boolean>>(
    typeof window !== 'undefined' ? 
      (window.__IMAGE_CACHE__ || (window.__IMAGE_CACHE__ = new Map())) : 
      new Map()
  );

  useEffect(() => {
    // If no images to load, mark everything as loaded immediately
    if (!imageUrls || imageUrls.length === 0) {
      setImagesPreloaded(true);
      setPriorityImagesLoaded(true);
      setRank1ImageLoaded(true);
      return;
    }

    // Check for already cached images in both local and global cache
    const isImageCached = (url: string) => {
      return cachedUrls.current.has(url) || globalImageCache.current.get(url) === true;
    };
    
    // Filter out already cached images
    const uncachedUrls = imageUrls.filter(url => !isImageCached(url));
    
    // If all images are already cached, mark as loaded immediately
    if (uncachedUrls.length === 0) {
      setPriorityImagesLoaded(true);
      setImagesPreloaded(true);
      
      // Check if rank 1 image is in the priorityUrls and already cached
      if (priorityUrls.length > 0 && isImageCached(priorityUrls[0])) {
        setRank1ImageLoaded(true);
      }
      return;
    }

    // Set a very short timeout to show UI quickly even if images are still loading
    // Reduced from 150ms to 50ms for much faster UI display
    const quickLoadTimer = setTimeout(() => {
      setPriorityImagesLoaded(true);
    }, 50);

    // First, identify any specifically prioritized URLs (like rank 1)
    const specificPriorityUrls = priorityUrls.filter(url => uncachedUrls.includes(url));
    
    // Then get additional priority images up to the priorityCount
    const regularPriorityUrls = uncachedUrls
      .filter(url => !specificPriorityUrls.includes(url))
      .slice(0, Math.max(0, priorityCount - specificPriorityUrls.length));
    
    // Combine specific priority URLs with regular priority URLs
    const allPriorityUrls = [...specificPriorityUrls, ...regularPriorityUrls];
    let priorityLoadedCount = 0;

    // Then preload the rest
    const remainingUrls = uncachedUrls.filter(url => !allPriorityUrls.includes(url));
    let remainingLoadedCount = 0;

    // Function to preload a single image with optimized loading
    const preloadImage = (src: string, isPriority: boolean, isRank1: boolean = false) => {
      return new Promise<void>((resolve) => {
        // Skip if already cached
        if (isImageCached(src)) {
          handleImageLoaded(src, isPriority, isRank1);
          resolve();
          return;
        }
        
        // Use a faster approach - skip HEAD request and directly load the image
        // This reduces network requests and is faster in most cases
        const img = new Image();
        
        img.onload = () => {
          handleImageLoaded(src, isPriority, isRank1);
          resolve();
        };
        
        img.onerror = () => {
          // Even if there's an error, consider it "loaded" to avoid blocking
          handleImageLoaded(src, isPriority, isRank1);
          resolve();
        };
        
        // Add loading attribute for better browser resource prioritization
        img.loading = isRank1 || isPriority ? 'eager' : 'lazy';
        
        // Set src after attaching event handlers
        img.src = src;
      });
    };

    // Helper function to handle image loaded state
    const handleImageLoaded = (src: string, isPriority: boolean, isRank1: boolean = false) => {
      // Add to both local and global cache
      cachedUrls.current.add(src);
      globalImageCache.current.set(src, true);
      
      // If this is the rank 1 image, mark it as loaded
      if (isRank1) {
        setRank1ImageLoaded(true);
      }
      
      if (isPriority) {
        priorityLoadedCount++;
        if (priorityLoadedCount === allPriorityUrls.length) {
          clearTimeout(quickLoadTimer);
          setPriorityImagesLoaded(true);
        }
      } else {
        remainingLoadedCount++;
        if (remainingLoadedCount === remainingUrls.length) {
          setImagesPreloaded(true);
        }
      }
    };

    // Load rank 1 image first if it exists
    if (specificPriorityUrls.length > 0) {
      // Load the first specific priority URL (rank 1) immediately
      preloadImage(specificPriorityUrls[0], true, true);
    } else {
      // If no rank 1 image, mark it as loaded to avoid waiting
      setRank1ImageLoaded(true);
    }

    // Use Promise.all with a small batch size to avoid overwhelming the browser
    const loadImagesInBatches = async (urls: string[], isPriority: boolean) => {
      // Increase batch size for faster loading
      const batchSize = isPriority ? 5 : 3; 
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        // Skip the first specific priority URL as it's already being loaded
        const filteredBatch = specificPriorityUrls.length > 0 && isPriority && i === 0
          ? batch.filter(url => url !== specificPriorityUrls[0])
          : batch;
        
        await Promise.all(filteredBatch.map(url => preloadImage(url, isPriority)));
      }
    };

    // Start preloading remaining priority images immediately
    loadImagesInBatches(allPriorityUrls, true);

    // If no priority images, mark as loaded
    if (allPriorityUrls.length === 0) {
      clearTimeout(quickLoadTimer);
      setPriorityImagesLoaded(true);
    }

    // Start preloading remaining images with a slight delay to prioritize visible images
    // Reduced delay from 200ms to 100ms for faster loading of all images
    const remainingImagesTimer = setTimeout(() => {
      loadImagesInBatches(remainingUrls, false);
    }, 100);

    // If no remaining images, mark as loaded
    if (remainingUrls.length === 0) {
      setImagesPreloaded(true);
    }

    // Cleanup
    return () => {
      clearTimeout(quickLoadTimer);
      clearTimeout(remainingImagesTimer);
    };

  }, [imageUrls, priorityCount, priorityUrls]);

  // Add global image cache to window object for persistence between page loads
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__IMAGE_CACHE__) {
      window.__IMAGE_CACHE__ = new Map();
    }
  }, []);

  return {
    priorityImagesLoaded,
    allImagesLoaded: imagesPreloaded,
    rank1ImageLoaded,
  };
}
