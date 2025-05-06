'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bakugan, PaginationInfo, PricePoint } from '../types/bakugan';

interface CacheItem {
  data: any;
  timestamp: number;
}

interface Cache {
  [key: string]: CacheItem;
}

interface UseBakuganDataProps {
  initialPage?: number;
  initialLimit?: number;
  prioritizeBakutech?: boolean;
}

interface FilterState {
  nameFilter: string;
  sizeFilter: string;
  elementFilter: string;
  specialPropertiesFilter: string;
  minPriceFilter: string;
  maxPriceFilter: string;
  filterMode: 'all' | 'bakugan' | 'bakutech' | 'battle-brawlers' | 'new-vestroia' | 'gundalian-invaders' | 'mechtanium-surge';
}

export function useBakuganData({ initialPage = 1, initialLimit = 5, prioritizeBakutech = false }: UseBakuganDataProps = {}) {
  // State for the main component
  const [bakuganItems, setBakuganItems] = useState<Bakugan[]>([]);
  const [filteredItems, setFilteredItems] = useState<Bakugan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBakugan, setSelectedBakugan] = useState<string | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bakutechItemsLoaded, setBakutechItemsLoaded] = useState(false);
  const [regularItemsLoading, setRegularItemsLoading] = useState(false);
  
  // Use a ref to track if a fetch is in progress to prevent double fetching
  const isFetchingRef = useRef(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    pages: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    nameFilter: '',
    sizeFilter: '',
    elementFilter: '',
    specialPropertiesFilter: '',
    minPriceFilter: '',
    maxPriceFilter: '',
    filterMode: 'all'
  });
  
  // Name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Unique values for filter dropdowns
  const [uniqueElements, setUniqueElements] = useState<string[]>([]);
  const [uniqueSpecialProperties, setUniqueSpecialProperties] = useState<string[]>([]);
  
  // Cache state
  const [cache, setCache] = useState<Cache>({});

  // Simple cache function
  const getCachedData = useCallback((key: string, ttl: number = 60000) => {
    const cachedItem = cache[key];
    if (cachedItem && Date.now() - cachedItem.timestamp < ttl) {
      return cachedItem.data;
    }
    return null;
  }, [cache]);
  
  const setCachedData = useCallback((key: string, data: any) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Update filter values
  const updateFilter = useCallback((key: keyof FilterState, value: string | 'all' | 'bakugan' | 'bakutech' | 'battle-brawlers' | 'new-vestroia' | 'gundalian-invaders' | 'mechtanium-surge') => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Always reset to first page when any filter changes
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    // Set transitioning state to show loading animation
    setIsTransitioning(true);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      nameFilter: '',
      sizeFilter: '',
      elementFilter: '',
      specialPropertiesFilter: '',
      minPriceFilter: '',
      maxPriceFilter: '',
      filterMode: 'all'
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    setIsTransitioning(true);
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPage: number, newLimit?: number) => {
    setIsTransitioning(true);
    setPagination(prev => ({
      ...prev,
      page: newPage,
      ...(newLimit ? { limit: newLimit } : {})
    }));
    
    // Reset cache for price histories when changing page
    setPriceHistories({});
  }, []);

  // Fetch Bakugan items with server-side pagination and filtering
  const fetchBakuganItems = useCallback(async (forceFetchAll = false) => {
    // Prevent double fetching
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      // Only set loading to true if we're not already displaying Bakutech items
      if (!bakutechItemsLoaded || forceFetchAll) {
        setLoading(true);
      } else if (filters.filterMode === 'all') {
        // If we're loading regular items after Bakutech, show a different loading state
        setRegularItemsLoading(true);
      }
      
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (filters.nameFilter) params.append('search', filters.nameFilter);
      if (filters.sizeFilter) params.append('size', filters.sizeFilter);
      if (filters.elementFilter) params.append('element', filters.elementFilter);
      
      // Handle filter modes
      if (filters.filterMode === 'bakutech' || (prioritizeBakutech && !bakutechItemsLoaded && filters.filterMode === 'all' && !forceFetchAll)) {
        params.append('bakutech', 'true');
      } else if (filters.filterMode === 'bakugan') {
        params.append('excludeSize', 'B3');
      } else if (filters.filterMode === 'battle-brawlers') {
        params.append('excludeSize', 'B3');
        params.append('series', 'Battle Brawlers Vol.1');
      } else if (filters.filterMode === 'new-vestroia') {
        params.append('excludeSize', 'B3');
        params.append('series', 'New Vestroia Vol.2');
      } else if (filters.filterMode === 'gundalian-invaders') {
        params.append('excludeSize', 'B3');
        params.append('series', 'Gundalian Invaders Vol.3');
      } else if (filters.filterMode === 'mechtanium-surge') {
        params.append('excludeSize', 'B3');
        params.append('series', 'Mechtanium Surge Vol.4');
      } else if (prioritizeBakutech && bakutechItemsLoaded && filters.filterMode === 'all') {
        // When loading regular items after Bakutech in 'all' mode
        params.append('excludeSize', 'B3');
      }
      
      // Add price filters if needed
      if (filters.minPriceFilter) params.append('minPrice', filters.minPriceFilter);
      if (filters.maxPriceFilter) params.append('maxPrice', filters.maxPriceFilter);
      if (filters.specialPropertiesFilter) params.append('specialProperties', filters.specialPropertiesFilter);
      
      // Add pagination parameters
      params.append('limit', pagination.limit.toString());
      params.append('page', pagination.page.toString());

      const url = `/api/bakugan${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching from URL:", url);
      
      // Check cache first
      const cacheKey = url;
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        console.log("Using cached data for:", url);
        
        if (prioritizeBakutech && filters.filterMode === 'all' && !forceFetchAll) {
          if (!bakutechItemsLoaded) {
            // First load - just Bakutech items
            setFilteredItems(cachedData.items);
            setBakutechItemsLoaded(true);
            
            // Immediately trigger loading of regular items
            setTimeout(() => {
              fetchBakuganItems(true);
            }, 100);
          } else {
            // Second load - append regular items to Bakutech items
            setFilteredItems(prev => {
              // Create a map of existing IDs to avoid duplicates
              const existingIds = new Set(prev.map(item => item._id));
              // Filter out any duplicates from the new items
              const newItems = cachedData.items.filter((item: Bakugan) => !existingIds.has(item._id));
              return [...prev, ...newItems];
            });
          }
        } else {
          // Normal mode - replace all items
          setFilteredItems(cachedData.items);
          setBakutechItemsLoaded(false);
        }
        
        setPagination(cachedData.pagination);
        setError(null);
        setLoading(false);
        setRegularItemsLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bakugan items');
      }
      
      const data = await response.json();
      console.log("Fetched items:", data.items?.length);
      
      // Store in cache
      setCachedData(cacheKey, data);
      
      // Handle the prioritized loading logic
      if (prioritizeBakutech && filters.filterMode === 'all' && !forceFetchAll) {
        if (!bakutechItemsLoaded) {
          // First load - just Bakutech items
          setFilteredItems(data.items || []);
          setBakutechItemsLoaded(true);
          
          // Immediately trigger loading of regular items
          setTimeout(() => {
            fetchBakuganItems(true);
          }, 100);
        } else {
          // Second load - append regular items to Bakutech items
          setFilteredItems(prev => {
            // Create a map of existing IDs to avoid duplicates
            const existingIds = new Set(prev.map(item => item._id));
            // Filter out any duplicates from the new items
            const newItems = (data.items || []).filter((item: Bakugan) => !existingIds.has(item._id));
            return [...prev, ...newItems];
          });
        }
      } else {
        // Normal mode - replace all items
        setFilteredItems(data.items || []);
        setBakutechItemsLoaded(false);
      }
      
      // Update pagination from server response
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      // Extract unique values for filter dropdowns
      const items = data.items || [];
      if (items.length > 0) {
        // Create arrays of unique values using Set and Array.from for proper typing
        const elementValues = Array.from(new Set(items.map((item: Bakugan) => item.element).filter(Boolean))) as string[];
        const specialPropValues = Array.from(new Set(items.map((item: Bakugan) => item.specialProperties).filter(Boolean))) as string[];
        
        console.log("Unique elements:", elementValues);
        console.log("Unique special properties:", specialPropValues);
        
        setUniqueElements(elementValues);
        setUniqueSpecialProperties(specialPropValues);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching Bakugan items:', err);
      setError(err.message || 'Failed to fetch Bakugan items');
    } finally {
      setLoading(false);
      setRegularItemsLoading(false);
      isFetchingRef.current = false;
      
      // Add a shorter delay before resetting the transitioning state
      // This ensures the loading animation completes smoothly but doesn't feel too slow
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [filters, pagination, getCachedData, setCachedData, bakutechItemsLoaded, prioritizeBakutech]);

  // Fetch name suggestions
  const fetchNameSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/bakugan?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old and new API response formats
        const items = Array.isArray(data) ? data : data.items || [];
        
        // Extract all names from all Bakugan items
        const allNames = items.flatMap((item: Bakugan) => item.names || []);
        // Filter unique names that match the query
        const uniqueNames = Array.from(new Set(allNames))
          .filter((name) => 
            typeof name === 'string' && name.toLowerCase().includes(query.toLowerCase())
          ) as string[];
        
        setNameSuggestions(uniqueNames);
        setShowSuggestions(uniqueNames.length > 0);
      }
    } catch (error) {
      console.error('Error fetching name suggestions:', error);
    }
  }, []);

  // Fetch price history for a specific Bakugan with caching
  const fetchPriceHistory = useCallback(async (bakuganId: string) => {
    try {
      const cacheKey = `priceHistory-${bakuganId}`;
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setPriceHistories(prev => ({
          ...prev,
          [bakuganId]: cachedData
        }));
        return;
      }
      
      const response = await fetch(`/api/bakugan/${bakuganId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      const data = await response.json();
      const priceHistory = data.priceHistory || [];
      
      // Store in cache
      setCachedData(cacheKey, priceHistory);
      
      setPriceHistories((prev) => ({
        ...prev,
        [bakuganId]: priceHistory,
      }));
    } catch (err) {
      console.error('Error fetching price history:', err);
    }
  }, [getCachedData, setCachedData]);

  // Update a Bakugan's price (admin only)
  const handleUpdatePrice = useCallback(async (bakuganId: string, price: number, notes: string, referenceUri: string, date: string, difficultyOfObtaining?: number) => {
    try {
      // Set loading state to true to show loading indicator
      setLoading(true);
      
      const response = await fetch(`/api/bakugan/${bakuganId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price,
          notes,
          referenceUri,
          timestamp: date, // Include the date as timestamp
          difficultyOfObtaining, // Include the difficulty of obtaining if provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update price');
      }

      // Update the Bakugan item in the state immediately
      setFilteredItems((prevItems) =>
        prevItems.map((item) =>
          item._id === bakuganId ? { ...item, currentPrice: price } : item
        )
      );
      
      setBakuganItems((prevItems) =>
        prevItems.map((item) =>
          item._id === bakuganId ? { ...item, currentPrice: price } : item
        )
      );

      // Clear the cache for this Bakugan's price history
      const cacheKey = `priceHistory-${bakuganId}`;
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[cacheKey];
        return newCache;
      });

      // Refresh the price history
      await fetchPriceHistory(bakuganId);
      
      // Refresh the list to get updated data from the server
      await fetchBakuganItems();
      
      // Show success message
      setError('Price updated successfully!');
      
      return true;
    } catch (err: any) {
      console.error('Error updating price:', err);
      setError(err.message || 'Failed to update price');
      return false;
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
  }, [fetchPriceHistory, fetchBakuganItems, setCache]);

  // Update Bakugan details (admin only)
  const handleUpdateDetails = useCallback(async (
    bakuganId: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    series: string,
    imageUrl: string,
    referenceUri: string,
    difficultyOfObtaining: number
  ) => {
    try {
      // Set loading state to true to show loading indicator
      setLoading(true);
      
      const response = await fetch(`/api/bakugan/${bakuganId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names,
          size,
          element,
          specialProperties,
          series,
          imageUrl,
          referenceUri,
          difficultyOfObtaining,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Bakugan details');
      }

      // Update the Bakugan item in the state immediately
      setFilteredItems((prevItems) =>
        prevItems.map((item) =>
          item._id === bakuganId ? { 
            ...item, 
            names, 
            size, 
            element, 
            specialProperties, 
            series,
            imageUrl, 
            referenceUri,
            difficultyOfObtaining
          } : item
        )
      );
      
      // Clear any cache entries related to this Bakugan
      // This ensures fresh data will be fetched next time
      setCache(prev => {
        const newCache = { ...prev };
        // Remove any cache entries that might contain this Bakugan
        Object.keys(newCache).forEach(key => {
          if (key.includes('bakugan') || key.includes(bakuganId)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
      
      // Add a delay before refreshing the data to ensure the server has time to process the update
      setTimeout(async () => {
        // Refresh the list to get updated data from the server
        await fetchBakuganItems();
      }, 500);
      
      // Show success message
      setError('Bakugan details updated successfully!');
      
      return true;
    } catch (err: any) {
      console.error('Error updating Bakugan details:', err);
      setError(err.message || 'Failed to update Bakugan details');
      return false;
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
  }, [fetchBakuganItems]);

  // Prefetch price histories for visible Bakugan items
  const prefetchPriceHistories = useCallback(async () => {
    // Only fetch if we're not in a transitioning state
    if (isTransitioning) return;
    
    // Fetch price histories for all visible items
    const visibleBakugan = filteredItems;
    
    // Create an array of promises for parallel fetching
    const fetchPromises = visibleBakugan
      .filter(bakugan => !priceHistories[bakugan._id])
      .map(async (bakugan) => {
        // Check cache first
        const cacheKey = `priceHistory-${bakugan._id}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          return { id: bakugan._id, data: cachedData };
        } else {
          try {
            const response = await fetch(`/api/bakugan/${bakugan._id}`);
            if (response.ok) {
              const data = await response.json();
              const priceHistory = data.priceHistory || [];
              
              // Store in cache
              setCachedData(cacheKey, priceHistory);
              
              return { id: bakugan._id, data: priceHistory };
            }
          } catch (err) {
            console.error(`Error fetching price history for ${bakugan._id}:`, err);
          }
          return null;
        }
      });
    
    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);
    
    // Update state with all results at once to minimize re-renders
    const newHistories = results.reduce<Record<string, PricePoint[]>>((acc, result) => {
      if (result) {
        acc[result.id] = result.data;
      }
      return acc;
    }, {});
    
    if (Object.keys(newHistories).length > 0) {
      setPriceHistories(prev => ({
        ...prev,
        ...newHistories
      }));
    }
  }, [filteredItems, priceHistories, getCachedData, isTransitioning, setCachedData]);

  // Fetch all Bakugan items on component mount
  useEffect(() => {
    fetchBakuganItems();
  }, [fetchBakuganItems]);
  
  // Apply server-side filters when filter values change or pagination changes
  useEffect(() => {
    // Reset bakutechItemsLoaded when filter mode changes
    if (filters.filterMode !== 'all') {
      setBakutechItemsLoaded(false);
    }
    
    // Use a debounce to prevent rapid fetching
    const timeoutId = setTimeout(() => {
      fetchBakuganItems(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters, pagination.page, pagination.limit, fetchBakuganItems]);
  
  // Fetch name suggestions when name filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNameSuggestions(filters.nameFilter);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters.nameFilter, fetchNameSuggestions]);
  
  // Fetch price history when a Bakugan is selected
  useEffect(() => {
    if (selectedBakugan) {
      fetchPriceHistory(selectedBakugan);
    }
  }, [selectedBakugan, fetchPriceHistory]);

  // Prefetch price histories for visible Bakugan items
  useEffect(() => {
    if (filteredItems.length > 0) {
      prefetchPriceHistories();
    }
  }, [filteredItems, prefetchPriceHistories]);

  // Delete a Bakugan (admin only)
  const handleDeleteBakugan = useCallback(async (bakuganId: string) => {
    try {
      // Set loading state to true to show loading indicator
      setLoading(true);
      
      const response = await fetch(`/api/bakugan/${bakuganId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete Bakugan');
      }

      // Remove the deleted item from the current state immediately
      setFilteredItems((prevItems) => prevItems.filter(item => item._id !== bakuganId));
      
      // Clear the price history for the deleted Bakugan
      setPriceHistories((prev) => {
        const newHistories = { ...prev };
        delete newHistories[bakuganId];
        return newHistories;
      });
      
      // Clear any cache entries related to Bakugan data
      // This ensures fresh data will be fetched next time
      setCache(prev => {
        const newCache = { ...prev };
        // Remove any cache entries that might contain Bakugan data
        Object.keys(newCache).forEach(key => {
          if (key.includes('bakugan') || key.includes(bakuganId)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
      
      // Add a delay before refreshing the data to ensure the server has time to process the deletion
      setTimeout(async () => {
        // Refresh the list to get updated data from the server
        await fetchBakuganItems();
      }, 500);
      
      // Show success message
      setError('Bakugan deleted successfully!');
      
      return true;
    } catch (err: any) {
      console.error('Error deleting Bakugan:', err);
      setError(err.message || 'Failed to delete Bakugan');
      return false;
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
  }, [fetchBakuganItems]);

  // Delete a price history entry
  const handleDeletePriceHistory = useCallback(async (priceHistoryId: string, bakuganId: string) => {
    try {
      // Set loading state to true to show loading indicator
      setLoading(true);
      
      const response = await fetch(`/api/price-history/${priceHistoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete price history entry');
      }

      const data = await response.json();
      
      // Update the price histories state with the updated price history
      setPriceHistories((prev) => ({
        ...prev,
        [bakuganId]: data.priceHistory,
      }));
      
      // Update the Bakugan item in the state if the current price has changed
      const bakugan = filteredItems.find(item => item._id === bakuganId);
      if (bakugan && data.priceHistory.length > 0) {
        const latestPrice = data.priceHistory[0].price;
        if (bakugan.currentPrice !== latestPrice) {
          setBakuganItems((prevItems) =>
            prevItems.map((item) =>
              item._id === bakuganId ? { ...item, currentPrice: latestPrice } : item
            )
          );
          setFilteredItems((prevItems) =>
            prevItems.map((item) =>
              item._id === bakuganId ? { ...item, currentPrice: latestPrice } : item
            )
          );
        }
      }
      
      // Refresh the list to get updated data from the server
      await fetchBakuganItems();
      
      // Show success message
      setError('Price history entry deleted successfully!');
      
      return true;
    } catch (err: any) {
      console.error('Error deleting price history entry:', err);
      setError(err.message || 'Failed to delete price history entry');
      return false;
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
  }, [filteredItems, fetchBakuganItems]);

  return {
    // State
    filteredItems,
    loading,
    error,
    pagination,
    filters,
    nameSuggestions,
    showSuggestions,
    isTransitioning,
    priceHistories,
    uniqueElements,
    uniqueSpecialProperties,
    regularItemsLoading,
    
    // Actions
    setSelectedBakugan,
    updateFilter,
    resetFilters,
    updatePagination,
    setShowSuggestions,
    handleUpdatePrice,
    handleUpdateDetails,
    handleDeleteBakugan,
    handleDeletePriceHistory,
    fetchBakuganItems,
  };
}
