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
}

interface FilterState {
  nameFilter: string;
  sizeFilter: string;
  elementFilter: string;
  specialPropertiesFilter: string;
  minPriceFilter: string;
  maxPriceFilter: string;
  filterMode: 'all' | 'bakugan' | 'bakutech';
}

export function useBakuganData({ initialPage = 1, initialLimit = 5 }: UseBakuganDataProps = {}) {
  // State for the main component
  const [bakuganItems, setBakuganItems] = useState<Bakugan[]>([]);
  const [filteredItems, setFilteredItems] = useState<Bakugan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBakugan, setSelectedBakugan] = useState<string | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
  const updateFilter = useCallback((key: keyof FilterState, value: string | 'all' | 'bakugan' | 'bakutech') => {
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
  const fetchBakuganItems = useCallback(async () => {
    // Prevent double fetching
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (filters.nameFilter) params.append('search', filters.nameFilter);
      if (filters.sizeFilter) params.append('size', filters.sizeFilter);
      if (filters.elementFilter) params.append('element', filters.elementFilter);
      if (filters.filterMode === 'bakutech') params.append('bakutech', 'true');
      else if (filters.filterMode === 'bakugan') params.append('excludeSize', 'B3');
      
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
        setFilteredItems(cachedData.items);
        setPagination(cachedData.pagination);
        setError(null);
        setLoading(false);
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
      
      // Set filtered items directly from API response
      setFilteredItems(data.items || []);
      
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
      isFetchingRef.current = false;
      
      // Add a delay before resetting the transitioning state
      // This ensures the loading animation completes smoothly
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }
  }, [filters, pagination, getCachedData, setCachedData]);

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
  const handleUpdatePrice = useCallback(async (bakuganId: string, price: number, notes: string, referenceUri: string, date: string) => {
    try {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update price');
      }

      // Update the Bakugan item in the state
      setBakuganItems((prevItems) =>
        prevItems.map((item) =>
          item._id === bakuganId ? { ...item, currentPrice: price } : item
        )
      );

      // Refresh the price history
      fetchPriceHistory(bakuganId);
    } catch (err: any) {
      console.error('Error updating price:', err);
      setError(err.message || 'Failed to update price');
    }
  }, [fetchPriceHistory]);

  // Update Bakugan details (admin only)
  const handleUpdateDetails = useCallback(async (
    bakuganId: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    referenceUri: string
  ) => {
    try {
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
          imageUrl,
          referenceUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Bakugan details');
      }

      // Refresh the list to get updated data
      fetchBakuganItems();
    } catch (err: any) {
      console.error('Error updating Bakugan details:', err);
      setError(err.message || 'Failed to update Bakugan details');
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
    // Use a debounce to prevent rapid fetching
    const timeoutId = setTimeout(() => {
      fetchBakuganItems();
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
    
    // Actions
    setSelectedBakugan,
    updateFilter,
    resetFilters,
    updatePagination,
    setShowSuggestions,
    handleUpdatePrice,
    handleUpdateDetails,
  };
}
