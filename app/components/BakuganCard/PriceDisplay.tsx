'use client';

import { PricePoint, PriceTrend } from './types';

interface PriceDisplayProps {
  currentPrice: number;
  referenceUri: string;
  priceHistory: PricePoint[];
  isChartLoading: boolean;
  priceTrend: PriceTrend;
}

const PriceDisplay = ({
  currentPrice,
  referenceUri,
  priceHistory,
  isChartLoading,
  priceTrend,
}: PriceDisplayProps) => {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-green-600/30 to-green-400/30 hover:from-green-600/40 hover:to-green-400/40 mb-4">
      <div className="font-bold flex items-center justify-between text-green-300">
        <span className="flex items-center gap-2">
          Current Price
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div className="relative">
          {isChartLoading ? (
            <div className="w-20 h-6 bg-gradient-to-r from-green-600/20 to-green-400/20 animate-pulse rounded-lg"></div>
          ) : (
            <span className="text-lg">฿{priceHistory.length > 0 ? priceHistory[0].price.toLocaleString() : currentPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
      
      {/* Price trend indicator */}
      {priceHistory.length > 1 && !isChartLoading && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Price Trend:</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${
            priceTrend.trend === 'up' 
              ? 'text-green-400' 
              : priceTrend.trend === 'down' 
                ? 'text-red-400' 
                : 'text-gray-400'
          }`}>
            {priceTrend.trend === 'up' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {priceTrend.trend === 'down' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {priceTrend.trend === 'stable' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            )}
            {priceTrend.trend !== 'stable' 
              ? `${priceTrend.percentage}%` 
              : 'Stable'
            }
          </span>
        </div>
      )}
      
      {!isChartLoading && (priceHistory.length > 0 ? priceHistory[0].referenceUri : referenceUri) && (
        <div className="mt-2 text-xs text-gray-400">
          <a 
            href={priceHistory.length > 0 ? priceHistory[0].referenceUri || referenceUri : referenceUri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Reference
          </a>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
