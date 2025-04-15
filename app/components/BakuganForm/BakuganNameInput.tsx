'use client';

import { useState, useEffect, useRef } from 'react';

interface BakuganNameInputProps {
  names: string[];
  onNameChange: (index: number, value: string) => void;
  onAddName: () => void;
  onRemoveName: (index: number) => void;
  nameSuggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}

const BakuganNameInput = ({
  names,
  onNameChange,
  onAddName,
  onRemoveName,
  nameSuggestions,
  showSuggestions,
  setShowSuggestions,
}: BakuganNameInputProps) => {
  const suggestionRef = useRef<HTMLDivElement>(null);

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
  }, [setShowSuggestions]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-300">
          Names
        </label>
        <button
          type="button"
          onClick={onAddName}
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
                onNameChange(index, e.target.value);
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
                      onNameChange(index, suggestionName);
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
              onClick={() => onRemoveName(index)}
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
  );
};

export default BakuganNameInput;
