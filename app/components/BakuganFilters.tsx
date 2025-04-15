'use client';

import { useRef } from 'react';
import { elements, seriesOptions } from '../types/bakugan';

interface BakuganFiltersProps {
  nameFilter: string;
  sizeFilter: string;
  elementFilter: string;
  specialPropertiesFilter: string;
  minPriceFilter: string;
  maxPriceFilter: string;
  isFilterOpen: boolean;
  nameSuggestions: string[];
  showSuggestions: boolean;
  onNameFilterChange: (value: string) => void;
  onSizeFilterChange: (value: string) => void;
  onElementFilterChange: (value: string) => void;
  onSpecialPropertiesFilterChange: (value: string) => void;
  onMinPriceFilterChange: (value: string) => void;
  onMaxPriceFilterChange: (value: string) => void;
  onToggleFilter: () => void;
  onResetFilters: () => void;
  onSelectSuggestion: (name: string) => void;
  onFocusNameFilter: () => void;
}

export default function BakuganFilters({
  nameFilter,
  sizeFilter,
  elementFilter,
  specialPropertiesFilter,
  minPriceFilter,
  maxPriceFilter,
  isFilterOpen,
  nameSuggestions,
  showSuggestions,
  onNameFilterChange,
  onSizeFilterChange,
  onElementFilterChange,
  onSpecialPropertiesFilterChange,
  onMinPriceFilterChange,
  onMaxPriceFilterChange,
  onToggleFilter,
  onResetFilters,
  onSelectSuggestion,
  onFocusNameFilter
}: BakuganFiltersProps) {
  const suggestionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full mb-8 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-300">Filter Bakugan</h2>
        <button 
          onClick={onToggleFilter}
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
                onChange={(e) => onNameFilterChange(e.target.value)}
                onFocus={onFocusNameFilter}
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
                      onClick={() => onSelectSuggestion(name)}
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
                onChange={(e) => onSizeFilterChange(e.target.value)}
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
                  onChange={(e) => onElementFilterChange(e.target.value)}
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
                    onClick={() => onElementFilterChange(elem.value === elementFilter ? '' : elem.value)}
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
                onChange={(e) => onSpecialPropertiesFilterChange(e.target.value)}
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
                onChange={(e) => onMinPriceFilterChange(e.target.value)}
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
                onChange={(e) => onMaxPriceFilterChange(e.target.value)}
                min="0"
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Max price"
              />
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-lg bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
