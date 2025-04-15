'use client';

import { Bakugan, PricePoint } from '../types/bakugan';
import Image from 'next/image';
import Link from 'next/link';

interface AdminBakuganTableProps {
  filteredItems: Bakugan[];
  loading: boolean;
  error: string | null;
  onEdit: (bakuganId: string) => void;
  onDelete: (bakuganId: string) => void;
  onUpdatePrice: (bakuganId: string) => void;
  onRefresh: () => void;
}

export default function AdminBakuganTable({
  filteredItems,
  loading,
  error,
  onEdit,
  onDelete,
  onUpdatePrice,
  onRefresh
}: AdminBakuganTableProps) {
  return (
    <div className="relative">
      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl">
        <h3 className="text-lg font-semibold text-purple-300 mb-2">Bakugan Management</h3>
        <p className="text-gray-300 mb-2">
          Use the buttons below to manage your Bakugan collection:
        </p>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold">
              Edit Details
            </div>
            <span className="text-gray-300">- Modify Bakugan information</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">
              Delete
            </div>
            <span className="text-gray-300">- Remove a Bakugan from the database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
              Update Price
            </div>
            <span className="text-gray-300">- Update the current price</span>
          </div>
        </div>
      </div>

      {/* Bakugan Table */}
      {!loading && (
        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold hover:from-green-500 hover:to-green-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No Bakugan items found. Add new Bakugan in the "Add New Bakugan" tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Element</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Series</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((bakugan) => (
                    <tr key={bakugan._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-800">
                          {bakugan.imageUrl && (
                            <img 
                              src={bakugan.imageUrl} 
                              alt={bakugan.names[0]}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{bakugan.names[0]}</td>
                      <td className="px-4 py-3 text-gray-300">{bakugan.size}</td>
                      <td className="px-4 py-3 text-gray-300">{bakugan.element}</td>
                      <td className="px-4 py-3 text-gray-300">{bakugan.series || '-'}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {bakugan.currentPrice.toLocaleString()} THB
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => onEdit(bakugan._id)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => onUpdatePrice(bakugan._id)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            Update Price
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${bakugan.names[0]}? This action cannot be undone.`)) {
                                onDelete(bakugan._id);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-semibold hover:from-red-500 hover:to-red-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
