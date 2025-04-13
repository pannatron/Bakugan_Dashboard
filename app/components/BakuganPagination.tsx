'use client';

import { PaginationInfo } from '../types/bakugan';

interface BakuganPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function BakuganPagination({
  pagination,
  onPageChange,
  onLimitChange
}: BakuganPaginationProps) {
  if (pagination.total === 0) {
    return null;
  }

  return (
    <div className="mt-12 flex flex-col items-center space-y-4">
      {/* Results count and page size selector */}
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="text-sm text-gray-400">
          <span className="font-medium text-blue-400">{pagination.total}</span> items found
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Items per page:</span>
          <select 
            value={pagination.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="bg-gray-800/70 border border-gray-700 rounded-lg text-sm text-gray-300 px-2 py-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-xl p-2 border border-gray-800/50 inline-flex items-center">
        {/* Previous Page Button */}
        <button
          onClick={() => {
            if (pagination.page > 1) {
              onPageChange(pagination.page - 1);
            }
          }}
          disabled={pagination.page <= 1}
          className={`px-3 py-2 rounded-lg mr-2 ${
            pagination.page <= 1
              ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800/70 text-gray-300 hover:bg-blue-600/30 hover:text-blue-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Page Numbers */}
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            // Calculate which page numbers to show
            let pageNum;
            if (pagination.pages <= 5) {
              // If 5 or fewer pages, show all
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              // If current page is near the start
              pageNum = i + 1;
            } else if (pagination.page >= pagination.pages - 2) {
              // If current page is near the end
              pageNum = pagination.pages - 4 + i;
            } else {
              // If current page is in the middle
              pageNum = pagination.page - 2 + i;
            }
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (pageNum !== pagination.page) {
                    onPageChange(pageNum);
                  }
                }}
                className={`w-10 h-10 rounded-lg ${
                  pageNum === pagination.page
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-gray-800/70 text-gray-300 hover:bg-blue-600/30 hover:text-blue-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        {/* Next Page Button */}
        <button
          onClick={() => {
            if (pagination.page < pagination.pages) {
              onPageChange(pagination.page + 1);
            }
          }}
          disabled={pagination.page >= pagination.pages}
          className={`px-3 py-2 rounded-lg ml-2 ${
            pagination.page >= pagination.pages
              ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800/70 text-gray-300 hover:bg-blue-600/30 hover:text-blue-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
