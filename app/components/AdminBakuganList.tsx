'use client';

import { Bakugan, PricePoint, elements } from '../types/bakugan';
import BakuganCard from './BakuganCard';
import Link from 'next/link';

interface AdminBakuganListProps {
  filteredItems: Bakugan[];
  loading: boolean;
  isTransitioning: boolean;
  error: string | null;
  priceHistories: Record<string, PricePoint[]>;
  pagination: {
    limit: number;
  };
  onUpdatePrice: (
    bakuganId: string,
    price: number,
    notes: string,
    referenceUri: string,
    date: string
  ) => void;
  onUpdateDetails?: (
    bakuganId: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    referenceUri: string
  ) => void;
  onDeleteBakugan?: (bakuganId: string) => void;
}

export default function AdminBakuganList({
  filteredItems,
  loading,
  isTransitioning,
  error,
  priceHistories,
  pagination,
  onUpdatePrice,
  onUpdateDetails,
  onDeleteBakugan
}: AdminBakuganListProps) {
  return (
    <div className="relative">
      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Instructions */}
      {!loading && filteredItems.length > 0 && (
        <div className="mb-6 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">How to Edit or Delete Bakugan</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Click the <span className="text-purple-300 font-medium">Edit Details</span> button to modify Bakugan information</li>
            <li>Click the <span className="text-red-300 font-medium">Delete</span> button to remove a Bakugan from the database</li>
            <li>Click the <span className="text-blue-300 font-medium">Update Price</span> button to update the current price</li>
          </ul>
        </div>
      )}

      {/* Content based on toggle with smooth transition */}
      <div className="relative">
        {/* Content container with fixed height to prevent layout shifts */}
        <div className="relative min-h-[500px]" style={{ minHeight: filteredItems.length > 0 ? `${Math.max(500, filteredItems.length * 400)}px` : '500px' }}>
          {/* Loading Skeleton */}
          {(loading || isTransitioning) && (
            <div className="space-y-8 absolute inset-0 w-full z-10">
              {[...Array(pagination.limit || 5)].map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 animate-pulse">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image and Info Skeleton */}
                    <div className="md:w-1/3">
                      <div className="relative w-full h-48 md:h-64 mb-4 overflow-hidden rounded-xl bg-gray-800/70"></div>
                      <div className="h-6 bg-gray-800/70 rounded-lg w-3/4 mb-4"></div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gray-800/70 h-16"></div>
                        <div className="p-2 rounded-lg bg-gray-800/70 h-16"></div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-800/70 h-20 mb-4"></div>
                    </div>
                    
                    {/* Chart Skeleton */}
                    <div className="md:w-2/3">
                      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-6 bg-gray-800/70 rounded-lg w-1/4"></div>
                          <div className="h-6 bg-gray-800/70 rounded-lg w-1/5"></div>
                        </div>
                        <div className="h-72 bg-gray-800/50 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Regular Bakugan Cards */}
          <div 
            className={`space-y-8 ${
              loading || isTransitioning ? 'hidden' : 'block'
            }`}
          >
            {filteredItems.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No Bakugan items found. Add new Bakugan in the "Add New Bakugan" tab.
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
                    onUpdatePrice={onUpdatePrice}
                    onUpdateDetails={onUpdateDetails}
                    onDeleteBakugan={onDeleteBakugan}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
