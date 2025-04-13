'use client';

import { useState } from 'react';

interface BakuganEditFormProps {
  id: string;
  initialNames: string[];
  initialSize: string;
  initialElement: string;
  initialSpecialProperties: string;
  initialImageUrl: string;
  initialReferenceUri: string;
  onUpdateDetails: (
    id: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    referenceUri: string
  ) => void;
  onCancel: () => void;
}

const BakuganEditForm = ({
  id,
  initialNames,
  initialSize,
  initialElement,
  initialSpecialProperties,
  initialImageUrl,
  initialReferenceUri,
  onUpdateDetails,
  onCancel,
}: BakuganEditFormProps) => {
  const [editNames, setEditNames] = useState<string[]>([...initialNames]);
  const [editSize, setEditSize] = useState(initialSize);
  const [editElement, setEditElement] = useState(initialElement);
  const [editSpecialProperties, setEditSpecialProperties] = useState(initialSpecialProperties);
  const [editImageUrl, setEditImageUrl] = useState(initialImageUrl);
  const [editReferenceUri, setEditReferenceUri] = useState(initialReferenceUri);

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

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredNames = editNames.filter(name => name.trim() !== '');
    if (filteredNames.length > 0) {
      onUpdateDetails(
        id,
        filteredNames,
        editSize,
        editElement,
        editSpecialProperties,
        editImageUrl,
        editReferenceUri
      );
      onCancel();
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
          <input
            type="text"
            id="editElement"
            value={editElement}
            onChange={(e) => setEditElement(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Enter Bakugan element"
          />
        </div>

        {/* Special Properties */}
        <div>
          <label htmlFor="editSpecialProperties" className="block text-sm font-medium text-gray-300 mb-1">
            Special Properties (optional)
          </label>
          <input
            type="text"
            id="editSpecialProperties"
            value={editSpecialProperties}
            onChange={(e) => setEditSpecialProperties(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
            placeholder="Transparent, pearl color, prototype, etc."
          />
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
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default BakuganEditForm;
