'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for preloading images with immediate loading
 * @param imageUrls Array of image URLs to preload
 * @param priorityCount Number of images to load with high priority
 * @returns Object containing loading status
 */
export function useImagePreloader(imageUrls: string[], priorityCount: number = 2) {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [priorityImagesLoaded, setPriorityImagesLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setImagesPreloaded(true);
      setPriorityImagesLoaded(true);
      return;
    }

    // Set a short timeout to immediately mark priority images as loaded
    // This ensures the UI shows up quickly even if images are still loading
    const quickLoadTimer = setTimeout(() => {
      setPriorityImagesLoaded(true);
    }, 100);

    // Preload priority images first
    const priorityUrls = imageUrls.slice(0, priorityCount);
    let priorityLoadedCount = 0;

    // Then preload the rest
    const remainingUrls = imageUrls.slice(priorityCount);
    let remainingLoadedCount = 0;

    // Function to preload a single image
    const preloadImage = (src: string, isPriority: boolean) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          if (isPriority) {
            priorityLoadedCount++;
            if (priorityLoadedCount === priorityUrls.length) {
              clearTimeout(quickLoadTimer); // Clear the timeout if images load naturally
              setPriorityImagesLoaded(true);
            }
          } else {
            remainingLoadedCount++;
            if (remainingLoadedCount === remainingUrls.length) {
              setImagesPreloaded(true);
            }
          }
          resolve();
        };
        
        img.onerror = () => {
          // Even if there's an error, we consider it "loaded" to avoid blocking
          if (isPriority) {
            priorityLoadedCount++;
            if (priorityLoadedCount === priorityUrls.length) {
              clearTimeout(quickLoadTimer); // Clear the timeout if images load naturally
              setPriorityImagesLoaded(true);
            }
          } else {
            remainingLoadedCount++;
            if (remainingLoadedCount === remainingUrls.length) {
              setImagesPreloaded(true);
            }
          }
          resolve();
        };
        
        // Set src after attaching event handlers
        img.src = src;
      });
    };

    // Start preloading priority images immediately
    priorityUrls.forEach(url => {
      preloadImage(url, true);
    });

    // If no priority images, mark as loaded
    if (priorityUrls.length === 0) {
      clearTimeout(quickLoadTimer);
      setPriorityImagesLoaded(true);
    }

    // Start preloading remaining images
    remainingUrls.forEach(url => {
      preloadImage(url, false);
    });

    // If no remaining images, mark as loaded
    if (remainingUrls.length === 0) {
      setImagesPreloaded(true);
    }

    // Cleanup
    return () => {
      clearTimeout(quickLoadTimer);
    };

  }, [imageUrls, priorityCount]);

  return {
    priorityImagesLoaded,
    allImagesLoaded: imagesPreloaded,
  };
}
