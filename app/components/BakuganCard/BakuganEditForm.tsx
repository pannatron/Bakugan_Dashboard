'use client';

import { useState } from 'react';
import { elements, seriesOptions } from '@/app/types/bakugan';

interface BakuganEditFormProps {
  id: string;
  initialNames: string[];
  initialSize: string;
  initialElement: string;
  initialSpecialProperties: string;
  initialSeries?: string;
  initialImageUrl: string;
  initialReferenceUri: string;
  onUpdateDetails: (
    id: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    series: string,
    imageUrl: string,
    referenceUri: string
  ) => Promise<boolean>;
  onCancel: () => void;
}

const BakuganEditForm = ({
  id,
  initialNames,
  initialSize,
  initialElement,
  initialSpecialProperties,
  initialSeries = '',
  initialImageUrl,
  initialReferenceUri,
  onUpdateDetails,
  onCancel,
}: BakuganEditFormProps) => {
  const [editNames, setEditNames] = useState<string[]>([...initialNames]);
  const [editSize, setEditSize] = useState(initialSize);
  const [editElement, setEditElement] = useState(initialElement);
  const [editSpecialProperties, setEditSpecialProperties] = useState(initialSpecialProperties);
  const [editSeries, setEditSeries] = useState(initialSeries);
  const [editImageUrl, setEditImageUrl] = useState(initialImageUrl);
  const [editReferenceUri, setEditReferenceUri] = useState(initialReferenceUri);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddName = () => {
    setEditNames([...editNames, '']);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...editNames];
    newNames[index] = value;
    setEditNames(newNames);
  };

  const handleRemoveName = (index: number) => {
    if (editNames.length > 1) {
      const newNames = [...editNames];
      newNames.splice(index, 1);
      setEditNames(newNames);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredNames = editNames.filter(name => name.trim() !== '');
    if (filteredNames.length > 0 && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const success = await onUpdateDetails(
          id,
          filteredNames,
          editSize,
          editElement,
          editSpecialProperties,
          editSeries,
          editImageUrl,
          editReferenceUri
        );
        
        if (success) {
          // Add a small delay before closing the modal to ensure smooth transition
          setTimeout(() => {
            onCancel();
          }, 300);
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error updating Bakugan details:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 animate-fade-in">
      <h3 className="text-lg font-semibold text-purple-300 mb-4">Edit Bakugan Details</h3>
      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        {/* Names */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-300">
              Names
            </label>
            <button
              type="button"
              onClick={handleAddName}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Add another name
            </button>
          </div>
          
          {editNames.map((name, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                required={index === 0}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder={index === 0 ? "Primary name (required)" : `Alternative name ${index + 1}`}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveName(index)}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Size */}
        <div>
          <label htmlFor="editSize" className="block text-sm font-medium text-gray-300 mb-1">
            Size
          </label>
          <select
            id="editSize"
            value={editSize}
            onChange={(e) => setEditSize(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
          </select>
        </div>

        {/* Element */}
        <div>
          <label htmlFor="editElement" className="block text-sm font-medium text-gray-300 mb-1">
            Element
          </label>
          <select
            id="editElement"
            value={editElement}
            onChange={(e) => setEditElement(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            {elements.map((elem) => (
              <option key={elem.value} value={elem.value}>{elem.value}</option>
            ))}
          </select>
          
          {/* Element Icons */}
          <div className="mt-2 flex flex-wrap gap-2">
            {elements.map((elem) => (
              <div 
                key={elem.value}
                onClick={() => setEditElement(elem.value)}
                className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
                  elem.value === editElement 
                    ? 'ring-2 ring-purple-500 scale-110' 
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img 
                  src={elem.image} 
                  alt={elem.value} 
                  className="w-8 h-8 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Special Properties */}
        <div>
          <label htmlFor="editSpecialProperties" className="block text-sm font-medium text-gray-300 mb-1">
            Special Properties (optional)
          </label>
          <select
            id="editSpecialProperties"
            value={editSpecialProperties}
            onChange={(e) => setEditSpecialProperties(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="">None</option>
            <option value="Normal">Normal</option>
            <option value="Clear">Clear</option>
            <option value="Pearl">Pearl</option>
            <option value="Prototype">Prototype</option>
            <option value="Painted">Painted</option>
            <option value="Translucent">Translucent</option>
          </select>
        </div>

        {/* Series */}
        <div>
          <label htmlFor="editSeries" className="block text-sm font-medium text-gray-300 mb-1">
            Series
          </label>
          <select
            id="editSeries"
            value={editSeries}
            onChange={(e) => setEditSeries(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="">Select Series</option>
            {seriesOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="editImageUrl" className="block text-sm font-medium text-gray-300 mb-1">
            Image URL (optional)
          </label>
          <input
            type="text"
            id="editImageUrl"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter image URL"
          />
        </div>

        {/* Reference URI */}
        <div>
          <label htmlFor="editReferenceUri" className="block text-sm font-medium text-gray-300 mb-1">
            Reference URI (optional)
          </label>
          <input
            type="text"
            id="editReferenceUri"
            value={editReferenceUri}
            onChange={(e) => setEditReferenceUri(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter reference URI"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default BakuganEditForm;
