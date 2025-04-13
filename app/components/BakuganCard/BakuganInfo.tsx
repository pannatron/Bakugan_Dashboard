'use client';

import { BakuganCardProps } from './types';

interface BakuganInfoProps {
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
}

const BakuganInfo = ({
  names,
  size,
  element,
  specialProperties,
  imageUrl,
}: BakuganInfoProps) => {
  return (
    <div>
      <div className="relative w-full h-48 md:h-64 mb-4 overflow-hidden rounded-xl">
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
    </div>
  );
};

export default BakuganInfo;
