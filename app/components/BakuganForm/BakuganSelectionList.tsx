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

interface BakuganSelectionListProps {
  recommendations: BakuganRecommendation[];
  onSelectBakugan: (bakugan: BakuganRecommendation) => void;
}

const BakuganSelectionList = ({
  recommendations,
  onSelectBakugan,
}: BakuganSelectionListProps) => {
  if (recommendations.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
      <h3 className="font-medium text-blue-300 mb-2">Multiple Bakugan Found - Select One:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {recommendations.map((rec) => (
          <div 
            key={rec._id}
            onClick={() => onSelectBakugan(rec)}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg cursor-pointer border border-gray-700/50 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center gap-2">
              {rec.imageUrl && (
                <div className="w-12 h-12 bg-gray-900/50 rounded-md overflow-hidden flex items-center justify-center">
                  <img 
                    src={rec.imageUrl} 
                    alt={rec.names[0]} 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-blue-400 uppercase">{rec.names[0]}</div>
                <div className="text-xs text-gray-400">
                  {rec.size} • {rec.element} • {rec.specialProperties || 'Normal'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">฿{rec.currentPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BakuganSelectionList;
