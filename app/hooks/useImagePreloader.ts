'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for optimized image preloading with caching
 * @param imageUrls Array of image URLs to preload
 * @param priorityCount Number of images to load with high priority
 * @returns Object containing loading status
 */
export function useImagePreloader(imageUrls: string[], priorityCount: number = 3) {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [priorityImagesLoaded, setPriorityImagesLoaded] = useState<boolean>(false);
  const cachedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setImagesPreloaded(true);
      setPriorityImagesLoaded(true);
      return;
    }

    // Filter out already cached images
    const uncachedUrls = imageUrls.filter(url => !cachedUrls.current.has(url));
    
    // If all images are already cached, mark as loaded immediately
    if (uncachedUrls.length === 0) {
      setPriorityImagesLoaded(true);
      setImagesPreloaded(true);
      return;
    }

    // Set a timeout to show UI quickly even if images are still loading
    // Increased from 100ms to 150ms to ensure UI responsiveness
    const quickLoadTimer = setTimeout(() => {
      setPriorityImagesLoaded(true);
    }, 150);

    // Preload priority images first
    const priorityUrls = uncachedUrls.slice(0, priorityCount);
    let priorityLoadedCount = 0;

    // Then preload the rest
    const remainingUrls = uncachedUrls.slice(priorityCount);
    let remainingLoadedCount = 0;

    // Function to preload a single image with optimized loading
    const preloadImage = (src: string, isPriority: boolean) => {
      return new Promise<void>((resolve) => {
        // Check if image is already in browser cache
        fetch(src, { method: 'HEAD', cache: 'force-cache' })
          .then(response => {
            if (response.ok) {
              // Image is likely in cache, mark as loaded immediately
              handleImageLoaded(src, isPriority);
              resolve();
              return;
            }
            
            // Image not in cache, load it normally
            const img = new Image();
            
            img.onload = () => {
              handleImageLoaded(src, isPriority);
              resolve();
            };
            
            img.onerror = () => {
              // Even if there's an error, consider it "loaded" to avoid blocking
              handleImageLoaded(src, isPriority);
              resolve();
            };
            
            // Set src after attaching event handlers
            img.src = src;
          })
          .catch(() => {
            // If fetch fails, fall back to normal image loading
            const img = new Image();
            
            img.onload = () => {
              handleImageLoaded(src, isPriority);
              resolve();
            };
            
            img.onerror = () => {
              handleImageLoaded(src, isPriority);
              resolve();
            };
            
            img.src = src;
          });
      });
    };

    // Helper function to handle image loaded state
    const handleImageLoaded = (src: string, isPriority: boolean) => {
      // Add to cached URLs set
      cachedUrls.current.add(src);
      
      if (isPriority) {
        priorityLoadedCount++;
        if (priorityLoadedCount === priorityUrls.length) {
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

    // Use Promise.all with a small batch size to avoid overwhelming the browser
    const loadImagesInBatches = async (urls: string[], isPriority: boolean) => {
      const batchSize = isPriority ? 3 : 2; // Load priority images faster
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(batch.map(url => preloadImage(url, isPriority)));
      }
    };

    // Start preloading priority images immediately
    loadImagesInBatches(priorityUrls, true);

    // If no priority images, mark as loaded
    if (priorityUrls.length === 0) {
      clearTimeout(quickLoadTimer);
      setPriorityImagesLoaded(true);
    }

    // Start preloading remaining images with a slight delay to prioritize visible images
    const remainingImagesTimer = setTimeout(() => {
      loadImagesInBatches(remainingUrls, false);
    }, 200);

    // If no remaining images, mark as loaded
    if (remainingUrls.length === 0) {
      setImagesPreloaded(true);
    }

    // Cleanup
    return () => {
      clearTimeout(quickLoadTimer);
      clearTimeout(remainingImagesTimer);
    };

  }, [imageUrls, priorityCount]);

  return {
    priorityImagesLoaded,
    allImagesLoaded: imagesPreloaded,
  };
}
