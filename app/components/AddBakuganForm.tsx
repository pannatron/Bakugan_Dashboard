'use client';

import { useState, useEffect } from 'react';
import {
  BakuganNameInput,
  BakuganRecommendations,
  SelectedBakuganDisplay,
  AddBakuganFields,
  UpdateBakuganFields,
  BakuganSelectionList,
  BakuganRecommendation,
  AddBakuganFormProps
} from './BakuganForm';

const AddBakuganForm = ({ onAddBakugan, onUpdateBakugan }: AddBakuganFormProps) => {
  const [names, setNames] = useState<string[]>(['']);
  const [size, setSize] = useState('B1');
  const [element, setElement] = useState('Pyrus');
  const [specialProperties, setSpecialProperties] = useState('Normal');
  const [series, setSeries] = useState('');
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
  
  // Name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
          series,
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
    setSeries('');
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
    setSeries(bakugan.series || '');
    setIsUpdateMode(true);
    
    // Set the current price as a reference
    setPrice(bakugan.currentPrice.toString());
    
    // Clear recommendations when switching to update mode
    setRecommendations([]);
  };

  const handleCopyBakugan = (bakugan: BakuganRecommendation) => {
    setNames([...bakugan.names]);
    setSize(bakugan.size);
    setElement(bakugan.element);
    setSpecialProperties(bakugan.specialProperties || 'Normal');
    setSeries(bakugan.series || '');
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
      <BakuganSelectionList 
        recommendations={recommendations} 
        onSelectBakugan={handleSelectBakugan} 
      />
      
      {/* Selected Bakugan Display */}
      {selectedBakugan && (
        <SelectedBakuganDisplay selectedBakugan={selectedBakugan} />
      )}

      {/* Similar Bakugan Recommendations */}
      {!isUpdateMode && names[0]?.trim().length > 2 && recommendations.length > 0 && (
        <BakuganRecommendations 
          recommendations={recommendations}
          isSearching={isSearching}
          onSelectBakugan={handleSelectBakugan}
          onCopyBakugan={handleCopyBakugan}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isUpdateMode ? (
          <>
            {/* Names Input */}
            <BakuganNameInput 
              names={names}
              onNameChange={handleNameChange}
              onAddName={handleAddName}
              onRemoveName={handleRemoveName}
              nameSuggestions={nameSuggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
            />

            {/* Add Bakugan Fields */}
            <AddBakuganFields 
              size={size}
              setSize={setSize}
              element={element}
              setElement={setElement}
              specialProperties={specialProperties}
              setSpecialProperties={setSpecialProperties}
              series={series}
              setSeries={setSeries}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              price={price}
              setPrice={setPrice}
              referenceUri={referenceUri}
              setReferenceUri={setReferenceUri}
              date={date}
              setDate={setDate}
            />
          </>
        ) : (
          <>
            {/* Update Bakugan Fields */}
            <UpdateBakuganFields 
              price={price}
              setPrice={setPrice}
              notes={notes}
              setNotes={setNotes}
              referenceUri={referenceUri}
              setReferenceUri={setReferenceUri}
              date={date}
              setDate={setDate}
              currentPrice={selectedBakugan?.currentPrice}
            />
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
