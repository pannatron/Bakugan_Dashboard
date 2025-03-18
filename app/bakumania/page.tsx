'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import BakuganCard from '../components/BakuganCard';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  createdAt: string;
  updatedAt: string;
}

interface PricePoint {
  _id: string;
  bakuganId: string;
  price: number;
  timestamp: string;
  notes: string;
  referenceUri?: string;
}

// Element definitions with images
const elements = [
  { value: 'Pyrus', image: '/element/Pyrus.svg' },
  { value: 'Aquos', image: '/element/Aquos.webp' },
  { value: 'Ventus', image: '/element/ventus.png' },
  { value: 'Subterra', image: '/element/Subterra.png' },
  { value: 'Haos', image: '/element/Haos.webp' },
  { value: 'Darkus', image: '/element/Darkus.webp' },
];

function BakumaniaContent() {
  const { user } = useAuth();

  // State for the main component
  const [bakuganItems, setBakuganItems] = useState<Bakugan[]>([]);
  const [filteredItems, setFilteredItems] = useState<Bakugan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBakugan, setSelectedBakugan] = useState<string | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'bakugan' | 'bakutech'>('all'); // Default to showing all
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [elementFilter, setElementFilter] = useState('');
  const [specialPropertiesFilter, setSpecialPropertiesFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true); // Open by default
  
  // Name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Unique values for filter dropdowns
  const [uniqueElements, setUniqueElements] = useState<string[]>([]);
  const [uniqueSpecialProperties, setUniqueSpecialProperties] = useState<string[]>([]);

  // Fetch all Bakugan items
  const fetchBakuganItems = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for API filtering
      const params = new URLSearchParams();
      if (nameFilter) params.append('search', nameFilter);
      if (sizeFilter) params.append('size', sizeFilter);
      if (elementFilter) params.append('element', elementFilter);
      
      // Add bakutech parameter if in BakuTech view
      if (filterMode === 'bakutech') {
        params.append('bakutech', 'true');
      }
      
      const url = `/api/bakugan${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching from URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bakugan items');
      }
      
      const data = await response.json();
      console.log("Fetched items:", data.length);
      setBakuganItems(data);
      
      // Extract unique values for filter dropdowns
      if (data.length > 0) {
        // Create arrays of unique values using Set and Array.from for proper typing
        const elementValues = Array.from(new Set(data.map((item: Bakugan) => item.element).filter(Boolean))) as string[];
        const specialPropValues = Array.from(new Set(data.map((item: Bakugan) => item.specialProperties).filter(Boolean))) as string[];
        
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
    }
  };
  
  // Fetch name suggestions
  const fetchNameSuggestions = async (query: string) => {
    if (query.length < 1) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/bakugan?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Extract all names from all Bakugan items
        const allNames = data.flatMap((item: Bakugan) => item.names);
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
  };
  
  // Handle click outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Apply client-side filters (for all filters to ensure they work correctly)
  const applyFilters = useCallback(() => {
    let filtered = [...bakuganItems];
    
    // Apply filtering based on the selected mode
    if (filterMode === 'bakutech') {
      // For BakuTech view, only show B3 size
      filtered = filtered.filter(item => item.size === 'B3');
      console.log('BakuTech view: Showing only B3 size:', filtered.length);
    } else if (filterMode === 'bakugan') {
      // For regular Bakugan view, filter out B3 size
      filtered = filtered.filter(item => item.size !== 'B3');
      console.log('Bakugan view: Filtering out B3 size:', filtered.length);
    } else {
      // 'all' mode - show everything
      console.log('Showing all sizes:', filtered.length);
    }
    
    // Filter by element if selected (client-side filtering in addition to server-side)
    if (elementFilter) {
      filtered = filtered.filter(item => 
        item.element === elementFilter
      );
      console.log(`After element filter (${elementFilter}):`, filtered.length);
    }
    
    // Filter by size if selected (client-side filtering in addition to server-side)
    if (sizeFilter) {
      filtered = filtered.filter(item => 
        item.size === sizeFilter
      );
      console.log(`After size filter (${sizeFilter}):`, filtered.length);
    }
    
    // Filter by special properties if selected
    if (specialPropertiesFilter) {
      filtered = filtered.filter(item => 
        item.specialProperties === specialPropertiesFilter
      );
      console.log(`After special properties filter (${specialPropertiesFilter}):`, filtered.length);
    }
    
    // Filter by price range
    if (minPriceFilter) {
      const minPrice = parseFloat(minPriceFilter);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(item => item.currentPrice >= minPrice);
      }
      console.log(`After min price filter (${minPriceFilter}):`, filtered.length);
    }
    
    if (maxPriceFilter) {
      const maxPrice = parseFloat(maxPriceFilter);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(item => item.currentPrice <= maxPrice);
      }
      console.log(`After max price filter (${maxPriceFilter}):`, filtered.length);
    }
    
    setFilteredItems(filtered);
    console.log("Applied filters:", { elementFilter, sizeFilter, specialPropertiesFilter, minPriceFilter, maxPriceFilter });
    console.log("Filtered items:", filtered.length);
  }, [bakuganItems, elementFilter, sizeFilter, specialPropertiesFilter, minPriceFilter, maxPriceFilter]);
  
  // Debounced search function
  const debouncedFetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchBakuganItems();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [nameFilter, sizeFilter, elementFilter, filterMode]);
  
  // Debounced name suggestions
  const debouncedSuggestions = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchNameSuggestions(nameFilter);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [nameFilter]);
  
  // Reset all filters
  const resetFilters = () => {
    setNameFilter('');
    setSizeFilter('');
    setElementFilter('');
    setSpecialPropertiesFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
    fetchBakuganItems();
  };

  // Fetch price history for a specific Bakugan
  const fetchPriceHistory = async (bakuganId: string) => {
    try {
      const response = await fetch(`/api/bakugan/${bakuganId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      const data = await response.json();
      setPriceHistories((prev) => ({
        ...prev,
        [bakuganId]: data.priceHistory || [],
      }));
    } catch (err) {
      console.error('Error fetching price history:', err);
    }
  };

  // Update a Bakugan's price (admin only)
  const handleUpdatePrice = async (bakuganId: string, price: number, notes: string, referenceUri: string, date: string) => {
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
  };

  // Update Bakugan details (admin only)
  const handleUpdateDetails = async (
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
  };

  // Fetch all Bakugan items on component mount
  useEffect(() => {
    fetchBakuganItems();
    
    // Initialize with all elements for the filter
    setUniqueElements(elements.map(e => e.value));
  }, []);
  
  // Apply server-side filters when filter values change
  useEffect(() => {
    const cleanup = debouncedFetch();
    return cleanup;
  }, [nameFilter, sizeFilter, elementFilter, filterMode, debouncedFetch]);
  
  // Fetch name suggestions when name filter changes
  useEffect(() => {
    const cleanup = debouncedSuggestions();
    return cleanup;
  }, [nameFilter, debouncedSuggestions]);
  
  // Apply client-side filters when needed
  useEffect(() => {
    applyFilters();
  }, [bakuganItems, elementFilter, sizeFilter, specialPropertiesFilter, minPriceFilter, maxPriceFilter, applyFilters]);

  // Fetch price history when a Bakugan is selected
  useEffect(() => {
    if (selectedBakugan) {
      fetchPriceHistory(selectedBakugan);
    }
  }, [selectedBakugan]);

  // Fetch price histories for all Bakugan items
  useEffect(() => {
    const fetchAllPriceHistories = async () => {
      for (const bakugan of bakuganItems) {
        if (!priceHistories[bakugan._id]) {
          await fetchPriceHistory(bakugan._id);
        }
      }
    };

    if (bakuganItems.length > 0) {
      fetchAllPriceHistories();
    }
  }, [bakuganItems, priceHistories]);


  return (
    <main className="relative max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Section */}
      <div className="flex flex-col justify-center items-center mb-8 w-full">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x glow-text-premium relative text-center">
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x blur-sm opacity-50"></span>
            <span className="inline-block py-4">Bakugan List</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-4 text-center">
            Browse, filter, and track all Bakugan in our database.
          </p>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="w-full mb-8 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-300">Filter Bakugan</h2>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="text-sm text-gray-400 hover:text-blue-400 flex items-center gap-1"
          >
            {isFilterOpen ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide Filters
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show Filters
              </>
            )}
          </button>
        </div>
        
        {isFilterOpen && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name Filter with Suggestions */}
              <div className="relative">
                <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="nameFilter"
                  value={nameFilter}
                  onChange={(e) => {
                    setNameFilter(e.target.value);
                    if (e.target.value.length > 0) {
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => nameFilter.length > 0 && setShowSuggestions(true)}
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Search by name"
                />
                
                {/* Name Suggestions Dropdown */}
                {showSuggestions && nameSuggestions.length > 0 && (
                  <div 
                    ref={suggestionRef}
                    className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {nameSuggestions.map((name, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                        onClick={() => {
                          setNameFilter(name);
                          setShowSuggestions(false);
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Size Filter */}
              <div>
                <label htmlFor="sizeFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Size
                </label>
                <select
                  id="sizeFilter"
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="">All Sizes</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="B3">B3</option>
                </select>
              </div>
              
              {/* Element Filter with Icons */}
              <div>
                <label htmlFor="elementFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Element
                </label>
                <div className="relative">
                  <select
                    id="elementFilter"
                    value={elementFilter}
                    onChange={(e) => setElementFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Elements</option>
                    {elements.map((elem) => (
                      <option key={elem.value} value={elem.value}>{elem.value}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Element Icons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {elements.map((elem) => (
                    <div 
                      key={elem.value}
                      onClick={() => setElementFilter(elem.value === elementFilter ? '' : elem.value)}
                      className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
                        elem.value === elementFilter 
                          ? 'ring-2 ring-blue-500 scale-110' 
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img 
                        src={elem.image} 
                        alt={elem.value} 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Special Properties Filter */}
              <div>
                <label htmlFor="specialPropertiesFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Special Properties
                </label>
                <select
                  id="specialPropertiesFilter"
                  value={specialPropertiesFilter}
                  onChange={(e) => setSpecialPropertiesFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="">All Properties</option>
                  <option value="Normal">Normal</option>
                  <option value="Clear">Clear</option>
                  <option value="Pearl">Pearl</option>
                  <option value="Prototype">Prototype</option>
                  <option value="Painted">Painted</option>
                  <option value="Translucent">Translucent</option>
                </select>
              </div>
              
              {/* Price Range Filters */}
              <div>
                <label htmlFor="minPriceFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Min Price (฿)
                </label>
                <input
                  type="number"
                  id="minPriceFilter"
                  value={minPriceFilter}
                  onChange={(e) => setMinPriceFilter(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Min price"
                />
              </div>
              
              <div>
                <label htmlFor="maxPriceFilter" className="block text-sm font-medium text-gray-300 mb-1">
                  Max Price (฿)
                </label>
                <input
                  type="number"
                  id="maxPriceFilter"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Max price"
                />
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Filter buttons: ALL, Bakugan, BakuTech */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-full p-1 border border-gray-800/50 inline-flex">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                filterMode === 'all' 
                  ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterMode('bakugan')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                filterMode === 'bakugan' 
                  ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Bakugan
            </button>
            <button
              onClick={() => setFilterMode('bakutech')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                filterMode === 'bakutech' 
                  ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Bakutech
            </button>
          </div>
        </div>
      </div>
      
      {/* Admin Link - Only for admins */}
      {user?.isAdmin && (
        <div className="mb-8">
          <Link 
            href="/admin"
            className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Bakugan
            </span>
          </Link>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Content based on toggle with smooth transition */}
      <div className="relative">
        {/* Regular Bakugan Cards with transition */}
        <div 
          className={`space-y-8 transition-all duration-500 ease-in-out opacity-100 scale-100 z-10`}
        >

          {filteredItems.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {user?.isAdmin 
                  ? "No Bakugan items found. Add your first one above!" 
                  : "No Bakugan items found. Please check back later!"}
              </p>
            </div>
          ) : (
            filteredItems.map((bakugan) => (
              <div key={bakugan._id} className="relative">
                {/* Element Icon Overlay */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-gray-800/80 p-1 border border-gray-700/50 flex items-center justify-center">
                    {elements.find(e => e.value === bakugan.element) && (
                      <img 
                        src={elements.find(e => e.value === bakugan.element)?.image} 
                        alt={bakugan.element}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                </div>
                
                <BakuganCard
                  id={bakugan._id}
                  names={bakugan.names}
                  size={bakugan.size}
                  element={bakugan.element}
                  specialProperties={bakugan.specialProperties}
                  imageUrl={bakugan.imageUrl}
                  currentPrice={bakugan.currentPrice}
                  referenceUri={bakugan.referenceUri}
                  priceHistory={priceHistories[bakugan._id] || []}
                  onUpdatePrice={handleUpdatePrice}
                  onUpdateDetails={user?.isAdmin ? handleUpdateDetails : undefined}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

// Export the component
export default function BakumaniaPage() {
  return <BakumaniaContent />;
}
