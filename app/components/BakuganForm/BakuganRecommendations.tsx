'use client';

interface BakuganRecommendation {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl?: string;
  currentPrice: number;
  priceHistory?: {
    price: number;
    timestamp: string;
    notes?: string;
    referenceUri?: string;
  }[];
}

interface BakuganRecommendationsProps {
  recommendations: BakuganRecommendation[];
  isSearching: boolean;
  onSelectBakugan: (bakugan: BakuganRecommendation) => void;
  onCopyBakugan: (bakugan: BakuganRecommendation) => void;
}

const BakuganRecommendations = ({
  recommendations,
  isSearching,
  onSelectBakugan,
  onCopyBakugan,
}: BakuganRecommendationsProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-blue-300">Similar Bakugan Found:</h3>
        {isSearching && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        )}
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {recommendations.map((rec) => (
          <div 
            key={rec._id} 
            className="flex-shrink-0 w-[220px] p-2 bg-gray-800/70 hover:bg-gray-700/50 rounded-lg cursor-pointer border border-gray-700/50 hover:border-blue-500/50 transition-all"
          >
            {/* Display Bakugan image if available */}
            {rec.imageUrl && (
              <div className="mb-2">
                <img 
                  src={rec.imageUrl} 
                  alt={rec.names[0]} 
                  className="w-full h-24 object-contain bg-gray-900/50 rounded-lg"
                />
              </div>
            )}
            
            <div className="font-medium text-blue-400 uppercase truncate">{rec.names[0]}</div>
            <div className="text-xs text-gray-400 mb-1">{rec.size} • {rec.element} • {rec.specialProperties || 'Normal'}</div>
            <div className="text-sm text-gray-300 mb-2">฿{rec.currentPrice.toLocaleString()}</div>
            
            <div className="flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBakugan(rec);
                }}
                className="text-xs px-2 py-1 bg-blue-600/50 hover:bg-blue-500/50 text-blue-300 rounded flex-1"
              >
                Update
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyBakugan(rec);
                }}
                className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded flex-1"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BakuganRecommendations;
