'use client';

import { seriesOptions } from '@/app/types/bakugan';

interface ElementOption {
  value: string;
  image: string;
}

interface AddBakuganFieldsProps {
  size: string;
  setSize: (size: string) => void;
  element: string;
  setElement: (element: string) => void;
  specialProperties: string;
  setSpecialProperties: (properties: string) => void;
  series: string;
  setSeries: (series: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  price: string;
  setPrice: (price: string) => void;
  referenceUri: string;
  setReferenceUri: (uri: string) => void;
  date: string;
  setDate: (date: string) => void;
  difficultyOfObtaining?: number;
  setDifficultyOfObtaining?: (difficulty: number) => void;
}

const AddBakuganFields = ({
  size,
  setSize,
  element,
  setElement,
  specialProperties,
  setSpecialProperties,
  series,
  setSeries,
  imageUrl,
  setImageUrl,
  price,
  setPrice,
  referenceUri,
  setReferenceUri,
  date,
  setDate,
  difficultyOfObtaining = 5,
  setDifficultyOfObtaining,
}: AddBakuganFieldsProps) => {
  const elements: ElementOption[] = [
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

  return (
    <>
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

      {/* Series Dropdown */}
      <div>
        <label htmlFor="series" className="block text-sm font-medium text-gray-300 mb-1">
          Series
        </label>
        <div className="relative">
          <select
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
          >
            <option value="">Select Series</option>
            {seriesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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

      {/* Difficulty of Obtaining */}
      {setDifficultyOfObtaining && (
        <div>
          <label htmlFor="difficultyOfObtaining" className="block text-sm font-medium text-gray-300 mb-1">
            Difficulty of Obtaining (1-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="difficultyOfObtaining"
              min="1"
              max="10"
              step="1"
              value={difficultyOfObtaining}
              onChange={(e) => setDifficultyOfObtaining(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-amber-300 font-medium min-w-[2.5rem] text-center">
              {difficultyOfObtaining}/10
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            {Array.from({ length: 10 }).map((_, index) => (
              <span 
                key={index} 
                className={`text-sm cursor-pointer ${index < difficultyOfObtaining ? 'text-yellow-400' : 'text-gray-600'}`}
                onClick={() => setDifficultyOfObtaining(index + 1)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AddBakuganFields;
