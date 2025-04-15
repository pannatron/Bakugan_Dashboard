'use client';

interface UpdateBakuganFieldsProps {
  price: string;
  setPrice: (price: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  referenceUri: string;
  setReferenceUri: (uri: string) => void;
  date: string;
  setDate: (date: string) => void;
  currentPrice?: number;
}

const UpdateBakuganFields = ({
  price,
  setPrice,
  notes,
  setNotes,
  referenceUri,
  setReferenceUri,
  date,
  setDate,
  currentPrice,
}: UpdateBakuganFieldsProps) => {
  return (
    <>
      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
          New Price (฿)
        </label>
        <div className="relative">
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter new price"
          />
          {currentPrice && parseFloat(price) !== currentPrice && (
            <div className="absolute right-3 top-2 text-xs">
              {parseFloat(price) > currentPrice ? (
                <span className="text-green-400">+฿{(parseFloat(price) - currentPrice).toLocaleString()}</span>
              ) : (
                <span className="text-red-400">-฿{(currentPrice - parseFloat(price)).toLocaleString()}</span>
              )}
            </div>
          )}
        </div>
        {currentPrice && (
          <p className="text-xs text-gray-400 mt-1">
            Previous price: ฿{currentPrice.toLocaleString()}
          </p>
        )}
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          placeholder="Enter notes about this price update"
          rows={2}
        />
      </div>
      
      {/* Reference URI */}
      <div>
        <label htmlFor="referenceUri" className="block text-sm font-medium text-gray-300 mb-1">
          Reference URI (optional)
        </label>
        <input
          type="text"
          id="referenceUri"
          value={referenceUri}
          onChange={(e) => setReferenceUri(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          placeholder="Enter reference URI for price"
        />
      </div>
    </>
  );
};

export default UpdateBakuganFields;
