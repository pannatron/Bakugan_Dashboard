'use client';

import { BakuganCardProps } from './types';

// Function to determine color class based on series name
const getSeriesColorClass = (series: string): string => {
  const seriesLower = series.toLowerCase();
  
  if (seriesLower.includes('battle brawlers') || seriesLower.includes('vol.1')) {
    return 'bg-red-600/90'; // Red for Battle Brawlers
  } else if (seriesLower.includes('new vestroia') || seriesLower.includes('vol.2')) {
    return 'bg-green-600/90'; // Green for New Vestroia
  } else if (seriesLower.includes('gundalian invaders') || seriesLower.includes('vol.3')) {
    return 'bg-yellow-600/90'; // Yellow for Gundalian Invaders
  } else if (seriesLower.includes('mechtanium surge') || seriesLower.includes('vol.4')) {
    return 'bg-purple-600/90'; // Purple for Mechtanium Surge
  } else if (seriesLower.includes('bakutech')) {
    return 'bg-blue-600/90'; // Blue for Bakutech
  } else {
    return 'bg-blue-600/90'; // Default blue for other series
  }
};

interface BakuganInfoProps {
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  series?: string;
  imageUrl: string;
  difficultyOfObtaining?: number;
}

// Difficulty stars rendering moved to BakuganCard component

const BakuganInfo = ({
  names,
  size,
  element,
  specialProperties,
  series,
  imageUrl,
  difficultyOfObtaining = 5,
}: BakuganInfoProps) => {
  return (
    <div>
      {/* Series text with reduced glow effect */}
      {series && (
        <div className="relative z-20 mb-2">
          <p className="text-lg font-semibold uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-100 to-yellow-300">
              {series}
            </span>
          </p>
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 blur-md opacity-30 -z-10 bg-gradient-to-r from-white/30 to-yellow-500/30"></div>
        </div>
      )}
      
      <div className="relative w-full h-48 md:h-64 mb-4 overflow-hidden rounded-xl" style={{ 
        backgroundColor: '#4A5056',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)'
      }}>
        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={names && names.length > 0 ? names[0] : 'Bakugan'}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-blue-600/20">
            <span className="text-blue-300">{names && names.length > 0 ? names[0].charAt(0) : 'B'}</span>
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-2 uppercase">
        {names && names.length > 0 ? names[0] : 'Unknown Bakugan'}
      </h2>
      
      {names && names.length > 1 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Also known as:</p>
          <div className="flex flex-wrap gap-1">
            {names.slice(1).map((altName, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300"
              >
                {altName}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Grid with Size and Element only (2 columns) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gray-800/50 text-center">
          <p className="text-xs text-gray-400">Size</p>
          <p className="text-sm text-blue-300 font-medium uppercase">{size}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50 text-center">
          <p className="text-xs text-gray-400">Element</p>
          <p className="text-sm text-blue-300 font-medium uppercase">{element}</p>
        </div>
      </div>
      
      {specialProperties && (
        <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-800/30 mb-4">
          <p className="text-xs text-gray-400">Special Properties</p>
          <p className="text-sm text-purple-300">{specialProperties}</p>
        </div>
      )}
      
      {/* Difficulty of Obtaining removed from here and moved to BakuganCard */}
    </div>
  );
};

export default BakuganInfo;
