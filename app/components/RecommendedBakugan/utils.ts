'use client';

import { Bakugan } from './types';

// Helper function to get the most recent price
export const getMostRecentPrice = (bakugan: Bakugan): number => {
  if (bakugan.priceHistory && bakugan.priceHistory.length > 0) {
    return bakugan.priceHistory[0].price;
  }
  return bakugan.currentPrice;
};

// Get medal color based on rank
export const getMedalColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'from-yellow-300 to-yellow-500'; // Gold
    case 2:
      return 'from-gray-300 to-gray-500'; // Silver
    case 3:
      return 'from-amber-600 to-amber-800'; // Bronze
    case 4:
      return 'from-purple-400 to-purple-600'; // Purple
    case 5:
      return 'from-teal-400 to-teal-600'; // Teal
    default:
      return 'from-blue-300 to-blue-500';
  }
};

// Get medal emoji based on rank
export const getMedalEmoji = (rank: number) => {
  switch (rank) {
    case 1:
      return '👑';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    case 4:
      return '💫';
    case 5:
      return '⭐';
    default:
      return null;
  }
};

// Get medal text based on rank
export const getMedalText = (rank: number) => {
  switch (rank) {
    case 1:
      return 'Top Pick';
    case 2:
      return 'Runner Up';
    case 3:
      return 'Notable Mention';
    case 4:
      return 'Great Choice';
    case 5:
      return 'Solid Option';
    default:
      return 'Recommended';
  }
};

// Base classes for the widget
export const baseClasses = `
  w-full z-30 mb-8
  bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 
  backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 
  shadow-[0_0_15px_rgba(59,130,246,0.15)] 
  hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] 
  hover:border-blue-400/50
  transition-all duration-300 ease-in-out
  relative
`;
