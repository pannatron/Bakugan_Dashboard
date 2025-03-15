'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
}

interface Recommendation {
  _id: string;
  bakuganId: Bakugan;
  rank: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

const RecommendedBakugan = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Function to toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prevState => !prevState);
  };

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/recommendations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
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
  const getMedalEmoji = (rank: number) => {
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
  const getMedalText = (rank: number) => {
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
  const baseClasses = `
    w-full xl:fixed xl:left-8 xl:top-48 xl:w-80 z-10
    bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 
    backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 
    shadow-[0_0_15px_rgba(59,130,246,0.15)] 
    transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] 
    animate-float hover:border-blue-400/50
    transition-all duration-300 ease-in-out
    mb-8 xl:mb-0
  `;

  if (loading) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-gradient"></div>
        <div className="shimmer-wrapper">
          <div className="shimmer"></div>
        </div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended Bakugan</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-gradient"></div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended Bakugan</h2>
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-gradient"></div>
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended Bakugan</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No recommendations available yet.</p>
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
            >
              Add Recommendations
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-gradient"></div>
      <div className="shimmer-wrapper">
        <div className="shimmer"></div>
      </div>
      
      {/* Header with Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-indigo-300 transition-colors duration-300">
          Recommended Bakugan
        </h2>
        <div className="flex items-center space-x-2">
          {user?.isAdmin && (
            <Link 
              href="/admin"
              className="px-2 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors text-xs"
            >
              Manage
            </Link>
          )}
          <button
            onClick={toggleExpanded}
            className="text-blue-400 hover:text-blue-300 transition-all duration-300 p-2 hover:bg-blue-500/20 rounded-lg transform hover:scale-110 cursor-pointer"
            aria-label={isExpanded ? "Show less" : "Show more"}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Recommendations List */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {recommendations.slice(0, isExpanded ? recommendations.length : 3).map((recommendation, index) => (
          <div 
            key={recommendation._id}
            style={{ 
              animationDelay: `${index * 150}ms`,
              opacity: 0,
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
            className={`relative flex bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium hover:scale-[1.02] overflow-hidden ${index === 0 ? 'animate-spotlight' : ''}`}
          >
            {/* Bakugan Image */}
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
              {recommendation.bakuganId.imageUrl ? (
                <img
                  src={recommendation.bakuganId.imageUrl}
                  alt={recommendation.bakuganId.names[0]}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-blue-600/20">
                  <span className="text-blue-300 text-2xl font-bold">{recommendation.bakuganId.names[0].charAt(0)}</span>
                </div>
              )}
              
              {/* Rank Medal */}
              <div className="absolute -top-2 -left-2 z-10">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(recommendation.rank)} p-0.5 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white text-xs font-bold">
                    {getMedalEmoji(recommendation.rank) || recommendation.rank}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Info Section */}
            <div className="flex-1 p-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x truncate">
                  {recommendation.bakuganId.names[0]}
                </h3>
                
                <div className="flex justify-between items-center mt-1 text-xs">
                  <span className="text-blue-300">{recommendation.bakuganId.size} • {recommendation.bakuganId.element}</span>
                </div>
                
                <div className="mt-1 text-xs font-bold text-green-300">
                  ฿{recommendation.bakuganId.currentPrice.toLocaleString()}
                </div>
              </div>
              
              {recommendation.reason && (
                <div className="text-xs text-blue-200/80 line-clamp-2 mt-1 italic">
                  "{recommendation.reason}"
                </div>
              )}
            </div>
            
            {/* Rank Label */}
            <div className={`absolute bottom-0 right-0 py-0.5 px-2 bg-gradient-to-r ${getMedalColor(recommendation.rank)} text-white text-xs font-semibold rounded-tl-lg`}>
              {getMedalText(recommendation.rank)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Show More/Less Button (only if there are more than 3 recommendations) */}
      {recommendations.length > 3 && (
        <button
          type="button"
          onClick={toggleExpanded}
          className="relative z-20 w-full mt-3 px-3 py-3 rounded-lg bg-blue-600/50 text-blue-200 border border-blue-500/50 hover:bg-blue-600/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm font-medium flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
        >
          {isExpanded ? 'Show Less' : `Show ${recommendations.length - 3} More`}
          {isExpanded ? (
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .shimmer-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 1rem;
        }

        .shimmer {
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.1),
            transparent
          );
          position: absolute;
          top: 0;
          left: 0;
          animation: shimmer 3s infinite;
          transform: skewX(-20deg);
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          50% {
            transform: translateX(200%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }

        @keyframes spotlight {
          0%, 100% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
          }
        }

        .animate-spotlight {
          animation: spotlight 3s ease-in-out infinite;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default RecommendedBakugan;
