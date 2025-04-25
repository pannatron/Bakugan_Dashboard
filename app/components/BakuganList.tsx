'use client';

import { Bakugan, PricePoint, elements } from '../types/bakugan';
import BakuganCard from './BakuganCard';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface BakuganListProps {
  filteredItems: Bakugan[];
  loading: boolean;
  isTransitioning: boolean;
  error: string | null;
  priceHistories: Record<string, PricePoint[]>;
  pagination: {
    limit: number;
  };
  isAdmin: boolean;
  portfolioItems?: string[]; // Array of bakugan IDs in the user's portfolio
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
    series: string,
    imageUrl: string,
    referenceUri: string
  ) => Promise<boolean>;
  onDeleteBakugan?: (bakuganId: string) => void;
  onAddToFavorite?: (bakuganId: string) => void;
  onRemoveFromFavorite?: (portfolioId: string) => void;
}

export default function BakuganList({
  filteredItems,
  loading,
  isTransitioning,
  error,
  priceHistories,
  pagination,
  isAdmin,
  portfolioItems = [],
  onUpdatePrice,
  onUpdateDetails,
  onDeleteBakugan,
  onAddToFavorite,
  onRemoveFromFavorite
}: BakuganListProps) {
  const { data: session } = useSession();
  return (
    <div className="relative">
      {/* Admin Link - Only for admins */}
      {isAdmin && (
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
                  {isAdmin 
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
                    series={bakugan.series}
                    imageUrl={bakugan.imageUrl}
                    currentPrice={bakugan.currentPrice}
                    referenceUri={bakugan.referenceUri}
                    priceHistory={priceHistories[bakugan._id] || []}
                    isInPortfolio={portfolioItems.includes(bakugan._id)}
                    onUpdatePrice={onUpdatePrice}
                    onUpdateDetails={isAdmin ? onUpdateDetails : undefined}
                    onDeleteBakugan={isAdmin ? onDeleteBakugan : undefined}
                    onAddToFavorite={onAddToFavorite}
                    onRemoveFromFavorite={onRemoveFromFavorite}
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
