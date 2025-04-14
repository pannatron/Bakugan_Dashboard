'use client';

import { useState, useEffect } from 'react';
import { Bakugan, PricePoint } from '@/app/types/bakugan';
import PriceUpdateForm from './BakuganCard/PriceUpdateForm';

interface PriceHistoryManagerProps {
  bakugan: Bakugan;
  priceHistory: PricePoint[];
  onUpdatePrice: (id: string, price: number, notes: string, referenceUri: string, date: string) => void;
  onClose: () => void;
}

const PriceHistoryManager = ({ 
  bakugan, 
  priceHistory, 
  onUpdatePrice, 
  onClose 
}: PriceHistoryManagerProps) => {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedPricePoint, setSelectedPricePoint] = useState<PricePoint | null>(null);
  const [sortedPriceHistory, setSortedPriceHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    // Sort price history by date (newest first)
    const sorted = [...priceHistory].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setSortedPriceHistory(sorted);
  }, [priceHistory]);

  const handleAddNewPrice = () => {
    setSelectedPricePoint(null);
    setShowUpdateForm(true);
  };

  const handleEditPrice = (pricePoint: PricePoint) => {
    setSelectedPricePoint(pricePoint);
    setShowUpdateForm(true);
  };

  const handleCancelUpdate = () => {
    setShowUpdateForm(false);
    setSelectedPricePoint(null);
  };

  const handlePriceUpdate = (id: string, price: number, notes: string, referenceUri: string, date: string) => {
    onUpdatePrice(id, price, notes, referenceUri, date);
    setShowUpdateForm(false);
    setSelectedPricePoint(null);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-300">
          Price History for {bakugan.names[0]}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showUpdateForm ? (
        <PriceUpdateForm
          id={bakugan._id}
          initialPrice={selectedPricePoint?.price.toString() || ''}
          initialNotes={selectedPricePoint?.notes || ''}
          initialReferenceUri={selectedPricePoint?.referenceUri || ''}
          initialDate={selectedPricePoint ? new Date(selectedPricePoint.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
          onUpdatePrice={handlePriceUpdate}
          onCancel={handleCancelUpdate}
        />
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={handleAddNewPrice}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add New Price Point
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-800/50">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                {sortedPriceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                      No price history available
                    </td>
                  </tr>
                ) : (
                  sortedPriceHistory.map((point) => (
                    <tr key={point._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(point.timestamp).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-300 font-medium">
                        ฿{point.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">
                        {point.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {point.referenceUri ? (
                          <a 
                            href={point.referenceUri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                          >
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-blue-400 hover:underline">Link</span>
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        <button
                          onClick={() => handleEditPrice(point)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceHistoryManager;
