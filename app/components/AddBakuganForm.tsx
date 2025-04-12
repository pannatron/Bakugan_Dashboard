'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AddBakuganFormProps {
  onAddBakugan: (
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    currentPrice: number,
    referenceUri: string,
    date: string
  ) => void;
  onUpdateBakugan?: (
    id: string,
    price: number,
    referenceUri: string,
    notes: string,
    date: string
  ) => void;
}

interface BakuganRecommendation {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl?: string;
  currentPrice: number;
  priceHistory?: {
    price: number;
    timestamp: string;
    notes?: string;
    referenceUri?: string;
  }[];
}

const AddBakuganForm = ({ onAddBakugan, onUpdateBakugan }: AddBakuganFormProps) => {
  const [names, setNames] = useState<string[]>(['']);
  const [size, setSize] = useState('B1');
  const [element, setElement] = useState('Pyrus');
  const [specialProperties, setSpecialProperties] = useState('Normal');
  const [filterSpecialProperties, setFilterSpecialProperties] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [referenceUri, setReferenceUri] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<BakuganRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedBakugan, setSelectedBakugan] = useState<BakuganRecommendation | null>(null);
  
  // No longer needed as we're using Link component

  const elements = [
    { value: 'Pyrus', image: '/element/Pyrus.svg' },
    { value: 'Aquos', image: '/element/Aquos.webp' },
    { value: 'Ventus', image: '/element/ventus.png' },
    { value: 'Subterra', image: '/element/Subterra.png' },
    { value: 'Haos', image: '/element/Haos.webp' },
    { value: 'Darkus', image: '/element/Darkus.webp' },
  ];

  const specialPropertiesOptions = [
    'Normal',
    'Clear',
    'Pearl',
    'Prototype',
    'Painted',
    'Translucent',
  ];

  // Name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Search for recommendations when name changes (only in Add mode)
  useEffect(() => {
    // Skip search if in update mode
    if (isUpdateMode) {
      return;
    }
    
    const searchRecommendations = async () => {
      if (names[0]?.trim().length > 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/bakugan?search=${encodeURIComponent(names[0])}`);
          if (response.ok) {
            const data = await response.json();
            const bakuganItems = data.items || [];
            
            // Extract all names from all Bakugan items for suggestions
            const allNames = bakuganItems.flatMap((item: BakuganRecommendation) => item.names);
            // Filter unique names that match the query
            const uniqueNames = Array.from(new Set(allNames))
              .filter((name) => 
                typeof name === 'string' && name.toLowerCase().includes(names[0].toLowerCase())
              ) as string[];
            
            setNameSuggestions(uniqueNames);
            setShowSuggestions(uniqueNames.length > 0);
            
            // For each Bakugan, fetch its price history
            const bakuganWithHistory = await Promise.all(
              bakuganItems.map(async (bakugan: BakuganRecommendation) => {
                try {
                  const historyResponse = await fetch(`/api/bakugan/${bakugan._id}`);
                  if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    return {
                      ...bakugan,
                      priceHistory: historyData.priceHistory || []
                    };
                  }
                  return bakugan;
                } catch (error) {
                  console.error(`Error fetching history for ${bakugan._id}:`, error);
                  return bakugan;
                }
              })
            );
            
            setRecommendations(bakuganWithHistory);
          }
        } catch (error) {
          console.error('Error searching for recommendations:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setRecommendations([]);
        setNameSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchRecommendations();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [names[0], isUpdateMode]);
  
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

  // Function to directly search for a Bakugan by name, size, and element and switch to update mode
  const searchAndSelectBakugan = async (name: string, searchSize?: string, searchElement?: string) => {
    if (!name || name.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      // Build the search URL with optional size and element parameters
      let searchUrl = `/api/bakugan?search=${encodeURIComponent(name)}`;
      
      // Add size parameter if provided
      if (searchSize) {
        searchUrl += `&size=${encodeURIComponent(searchSize)}`;
      }
      
      // Add element parameter if provided
      if (searchElement) {
        searchUrl += `&element=${encodeURIComponent(searchElement)}`;
      }
      
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        const bakuganItems = data.items || [];
        if (bakuganItems.length > 0) {
          // If there's only one result, select it directly
          if (bakuganItems.length === 1) {
            const bakugan = bakuganItems[0];
            
            // Fetch price history
            const historyResponse = await fetch(`/api/bakugan/${bakugan._id}`);
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              const bakuganWithHistory = {
                ...bakugan,
                priceHistory: historyData.priceHistory || []
              };
              
              // Select this Bakugan for update
              handleSelectBakugan(bakuganWithHistory);
            }
          } else {
            // If there are multiple results, set them as recommendations and show the selection UI
            const bakuganWithHistory = await Promise.all(
              bakuganItems.map(async (bakugan: BakuganRecommendation) => {
                try {
                  const historyResponse = await fetch(`/api/bakugan/${bakugan._id}`);
                  if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    return {
                      ...bakugan,
                      priceHistory: historyData.priceHistory || []
                    };
                  }
                  return bakugan;
                } catch (error) {
                  console.error(`Error fetching history for ${bakugan._id}:`, error);
                  return bakugan;
                }
              })
            );
            
            setRecommendations(bakuganWithHistory);
            setIsFormOpen(true);
            // Show a message to select from the recommendations
            console.log('Multiple Bakugan found. Please select one from the recommendations.');
          }
        } else {
          // No matching Bakugan found with the specified criteria
          console.log('No matching Bakugan found with the specified criteria');
        }
      }
    } catch (error) {
      console.error('Error searching for Bakugan:', error);
    } finally {
      setIsSearching(false);
    }
  };


  const handleAddName = () => {
    setNames([...names, '']);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleRemoveName = (index: number) => {
    if (names.length > 1) {
      const newNames = [...names];
      newNames.splice(index, 1);
      setNames(newNames);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    
    // Debug date value
    console.log('Form date value before submission:', date);
    
    if (isUpdateMode && selectedBakugan && onUpdateBakugan) {
      // Update existing Bakugan price
      if (!isNaN(priceValue) && priceValue > 0) {
        console.log('Updating Bakugan with date:', date);
        console.log('Update date type:', typeof date);
        
        // Ensure date is a string in YYYY-MM-DD format
        const formattedDate = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
        console.log('Formatted update date:', formattedDate);
        
        onUpdateBakugan(
          selectedBakugan._id,
          priceValue,
          referenceUri,
          notes,
          formattedDate
        );
        
        // Reset form
        resetForm();
      }
    } else {
      // Add new Bakugan
      const filteredNames = names.filter(name => name.trim() !== '');
      
      if (
        filteredNames.length > 0 &&
        size &&
        element &&
        !isNaN(priceValue) &&
        priceValue > 0
      ) {
        console.log('Adding new Bakugan with date:', date);
        console.log('Date type:', typeof date);
        
        // Ensure date is a string in YYYY-MM-DD format
        const formattedDate = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
        console.log('Formatted date:', formattedDate);
        
        onAddBakugan(
          filteredNames,
          size,
          element,
          specialProperties,
          imageUrl,
          priceValue,
          referenceUri,
          formattedDate
        );
        
        // Reset form
        resetForm();
      }
    }
  };
  
  const resetForm = () => {
    setNames(['']);
    setSize('B1');
    setElement('Pyrus');
    setSpecialProperties('Normal');
    setImageUrl('');
    setPrice('');
    setReferenceUri('');
    setNotes('');
    // Don't reset the date to keep the user's selected date
    // setDate(new Date().toISOString().split('T')[0]);
    setIsUpdateMode(false);
    setSelectedBakugan(null);
    setIsFormOpen(false);
  };
  
  const handleSelectBakugan = (bakugan: BakuganRecommendation) => {
    setSelectedBakugan(bakugan);
    setNames([...bakugan.names]);
    setSize(bakugan.size);
    setElement(bakugan.element);
    setSpecialProperties(bakugan.specialProperties || 'Normal');
    setIsUpdateMode(true);
    
    // Set the current price as a reference
    setPrice(bakugan.currentPrice.toString());
    
    // Clear recommendations when switching to update mode
    setRecommendations([]);
  };

  if (!isFormOpen) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add or Update Bakugan
          </button>
          
        </div>
        
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium card-shimmer animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x">
          {isUpdateMode ? 'Update Bakugan Price' : 'Add New Bakugan'}
        </h2>
        <div className="flex items-center gap-2">
          {isUpdateMode && (
            <button
              type="button"
              onClick={() => {
                setIsUpdateMode(false);
                setSelectedBakugan(null);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Switch to Add Mode
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Bakugan Selection UI - Show when there are multiple matches */}
      {!isUpdateMode && recommendations.length > 1 && (
        <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
          <h3 className="font-medium text-blue-300 mb-2">Multiple Bakugan Found - Select One:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommendations.map((rec) => (
              <div 
                key={rec._id}
                onClick={() => handleSelectBakugan(rec)}
                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg cursor-pointer border border-gray-700/50 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  {rec.imageUrl && (
                    <div className="w-12 h-12 bg-gray-900/50 rounded-md overflow-hidden flex items-center justify-center">
                      <img 
                        src={rec.imageUrl} 
                        alt={rec.names[0]} 
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-blue-400 uppercase">{rec.names[0]}</div>
                    <div className="text-xs text-gray-400">
                      {rec.size} • {rec.element} • {rec.specialProperties || 'Normal'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">฿{rec.currentPrice.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedBakugan && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-blue-300 uppercase">Updating: {selectedBakugan.names[0]}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedBakugan.size} • {selectedBakugan.element} • 
                    {selectedBakugan.specialProperties || 'Normal'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Current Price</p>
                  <p className="font-medium text-white">฿{selectedBakugan.currentPrice.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Price History */}
              {selectedBakugan.priceHistory && selectedBakugan.priceHistory.length > 0 && (
                <div className="mt-3 border-t border-blue-500/30 pt-3">
                  <p className="text-sm text-blue-300 mb-2">Price History:</p>
                  <div className="max-h-32 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-400">
                        <tr>
                          <th className="text-left pb-1">Date</th>
                          <th className="text-right pb-1">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBakugan.priceHistory.map((history, index) => (
                          <tr key={index} className="border-b border-gray-800/50 last:border-0">
                            <td className="py-1 text-gray-400">
                              {typeof history.timestamp === 'string' && history.timestamp.match(/^\d{4}-\d{2}-\d{2}$/)
                                ? history.timestamp // Display the date string directly if it's in YYYY-MM-DD format
                                : new Date(history.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-1 text-right text-gray-300">
                              ฿{history.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
        </div>
      )}

      {/* Similar Bakugan Recommendations - Moved to top */}
      {!isUpdateMode && names[0]?.trim().length > 2 && recommendations.length > 0 && (
        <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-blue-300">Similar Bakugan Found:</h3>
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
            )}
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {recommendations.map((rec) => (
              <div 
                key={rec._id} 
                className="flex-shrink-0 w-[220px] p-2 bg-gray-800/70 hover:bg-gray-700/50 rounded-lg cursor-pointer border border-gray-700/50 hover:border-blue-500/50 transition-all"
              >
                {/* Display Bakugan image if available */}
                {rec.imageUrl && (
                  <div className="mb-2">
                    <img 
                      src={rec.imageUrl} 
                      alt={rec.names[0]} 
                      className="w-full h-24 object-contain bg-gray-900/50 rounded-lg"
                    />
                  </div>
                )}
                
                <div className="font-medium text-blue-400 uppercase truncate">{rec.names[0]}</div>
                <div className="text-xs text-gray-400 mb-1">{rec.size} • {rec.element} • {rec.specialProperties || 'Normal'}</div>
                <div className="text-sm text-gray-300 mb-2">฿{rec.currentPrice.toLocaleString()}</div>
                
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBakugan(rec);
                    }}
                    className="text-xs px-2 py-1 bg-blue-600/50 hover:bg-blue-500/50 text-blue-300 rounded flex-1"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNames([...rec.names]);
                      setSize(rec.size);
                      setElement(rec.element);
                      setSpecialProperties(rec.specialProperties || 'Normal');
                    }}
                    className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded flex-1"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isUpdateMode ? (
          <>
            {/* Names */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Names
                  </label>
                  <button
                    type="button"
                    onClick={handleAddName}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Add another name
                  </button>
                </div>
                
                {names.map((name, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          handleNameChange(index, e.target.value);
                          if (index === 0 && e.target.value.length > 0) {
                            setShowSuggestions(true);
                          } else {
                            setShowSuggestions(false);
                          }
                        }}
                        onFocus={() => index === 0 && name.length > 0 && setShowSuggestions(true)}
                        required={index === 0}
                        className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white uppercase"
                        placeholder={index === 0 ? "Primary name (required)" : `Alternative name ${index + 1}`}
                      />
                      
                      {/* Name Suggestions Dropdown - Only for the first name field */}
                      {index === 0 && showSuggestions && nameSuggestions.length > 0 && (
                        <div 
                          ref={suggestionRef}
                          className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {nameSuggestions.map((suggestionName, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                              onClick={() => {
                                handleNameChange(index, suggestionName);
                                setShowSuggestions(false);
                              }}
                            >
                              {suggestionName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveName(index)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Add multiple names (Thai, English, or community names)</p>
              </div>

            {/* Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">
                Size
              </label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
              </select>
            </div>

            {/* Element Dropdown with Images */}
            <div>
              <label htmlFor="element" className="block text-sm font-medium text-gray-300 mb-1">
                Element
              </label>
              <div className="relative">
                <select
                  id="element"
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  {elements.map((elem) => (
                    <option key={elem.value} value={elem.value}>
                      {elem.value}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Display selected element image */}
              <div className="mt-2 flex items-center">
                <div className="w-8 h-8 mr-2 bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                  {element && (
                    <img 
                      src={elements.find(e => e.value === element)?.image || ''} 
                      alt={element} 
                      className="w-6 h-6 object-contain"
                    />
                  )}
                </div>
                <span className="text-sm text-gray-300">{element}</span>
              </div>
            </div>

            {/* Special Properties Dropdown */}
            <div>
              <label htmlFor="specialProperties" className="block text-sm font-medium text-gray-300 mb-1">
                Special Properties
              </label>
              <div className="relative">
                <select
                  id="specialProperties"
                  value={specialProperties}
                  onChange={(e) => setSpecialProperties(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  {specialPropertiesOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
                Image URL (optional)
              </label>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter image URL"
              />
            </div>
            
            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Initial Price (฿)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter initial price"
              />
            </div>
            
            {/* Reference URI */}
            <div>
              <label htmlFor="referenceUri" className="block text-sm font-medium text-gray-300 mb-1">
                Reference URI (optional)
              </label>
              <input
                type="text"
                id="referenceUri"
                value={referenceUri}
                onChange={(e) => setReferenceUri(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter reference URI for price"
              />
            </div>
            
            {/* Recommendations section removed from here and moved to the top */}
          </>
        ) : (
          <>
            {/* UPDATE MODE - Only show price update fields */}
            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                New Price (฿)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Enter new price"
                />
                {selectedBakugan && parseFloat(price) !== selectedBakugan.currentPrice && (
                  <div className="absolute right-3 top-2 text-xs">
                    {parseFloat(price) > selectedBakugan.currentPrice ? (
                      <span className="text-green-400">+฿{(parseFloat(price) - selectedBakugan.currentPrice).toLocaleString()}</span>
                    ) : (
                      <span className="text-red-400">-฿{(selectedBakugan.currentPrice - parseFloat(price)).toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
              {selectedBakugan && (
                <p className="text-xs text-gray-400 mt-1">
                  Previous price: ฿{selectedBakugan.currentPrice.toLocaleString()}
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter notes about this price update"
                rows={2}
              />
            </div>
            
            {/* Reference URI */}
            <div>
              <label htmlFor="referenceUri" className="block text-sm font-medium text-gray-300 mb-1">
                Reference URI (optional)
              </label>
              <input
                type="text"
                id="referenceUri"
                value={referenceUri}
                onChange={(e) => setReferenceUri(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Enter reference URI for price"
              />
            </div>
          </>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="w-1/2 px-4 py-2 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isUpdateMode ? 'Update Price' : 'Add Bakugan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBakuganForm;
