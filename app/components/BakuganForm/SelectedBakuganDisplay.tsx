'use client';

interface PriceHistory {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

interface BakuganRecommendation {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl?: string;
  currentPrice: number;
  priceHistory?: PriceHistory[];
}

interface SelectedBakuganDisplayProps {
  selectedBakugan: BakuganRecommendation;
}

const SelectedBakuganDisplay = ({ selectedBakugan }: SelectedBakuganDisplayProps) => {
  return (
    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-blue-300 uppercase">Updating: {selectedBakugan.names[0]}</h3>
          <p className="text-sm text-gray-400">
            {selectedBakugan.size} • {selectedBakugan.element} • 
            {selectedBakugan.specialProperties || 'Normal'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-300">Current Price</p>
          <p className="font-medium text-white">฿{selectedBakugan.currentPrice.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Price History */}
      {selectedBakugan.priceHistory && selectedBakugan.priceHistory.length > 0 && (
        <div className="mt-3 border-t border-blue-500/30 pt-3">
          <p className="text-sm text-blue-300 mb-2">Price History:</p>
          <div className="max-h-32 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left pb-1">Date</th>
                  <th className="text-right pb-1">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedBakugan.priceHistory.map((history, index) => (
                  <tr key={index} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-1 text-gray-400">
                      {typeof history.timestamp === 'string' && history.timestamp.match(/^\d{4}-\d{2}-\d{2}$/)
                        ? history.timestamp // Display the date string directly if it's in YYYY-MM-DD format
                        : new Date(history.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-1 text-right text-gray-300">
                      ฿{history.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedBakuganDisplay;
