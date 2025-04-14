'use client';

import { useState } from 'react';

interface PriceUpdateFormProps {
  id: string;
  initialPrice?: string;
  initialNotes?: string;
  initialReferenceUri?: string;
  initialDate?: string;
  onUpdatePrice: (id: string, price: number, notes: string, referenceUri: string, date: string) => void;
  onCancel: () => void;
}

const PriceUpdateForm = ({ 
  id, 
  initialPrice = '', 
  initialNotes = '', 
  initialReferenceUri = '', 
  initialDate = new Date().toISOString().split('T')[0],
  onUpdatePrice, 
  onCancel 
}: PriceUpdateFormProps) => {
  const [newPrice, setNewPrice] = useState(initialPrice);
  const [notes, setNotes] = useState(initialNotes);
  const [newReferenceUri, setNewReferenceUri] = useState(initialReferenceUri);
  const [updateDate, setUpdateDate] = useState(initialDate);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(newPrice);
    if (!isNaN(priceValue) && priceValue > 0) {
      onUpdatePrice(id, priceValue, notes, newReferenceUri, updateDate);
      setNewPrice('');
      setNotes('');
      setNewReferenceUri('');
      onCancel();
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 animate-fade-in">
      <h3 className="text-lg font-semibold text-blue-300 mb-4">Update Price</h3>
      <form onSubmit={handlePriceSubmit} className="space-y-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
            New Price (฿)
          </label>
          <input
            type="number"
            id="price"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter new price"
          />
        </div>
        
        {/* Date Field */}
        <div>
          <label htmlFor="updateDate" className="block text-sm font-medium text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="updateDate"
            value={updateDate}
            onChange={(e) => setUpdateDate(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          />
        </div>
        
        <div>
          <label htmlFor="referenceUri" className="block text-sm font-medium text-gray-300 mb-1">
            Reference URI (optional)
          </label>
          <input
            type="text"
            id="referenceUri"
            value={newReferenceUri}
            onChange={(e) => setNewReferenceUri(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter reference URI for price"
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Add notes about this price update"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save Price Update
        </button>
      </form>
    </div>
  );
};

export default PriceUpdateForm;
