'use client';

import Link from 'next/link';

interface EmptyStateProps {
  isAdmin?: boolean;
}

const EmptyState = ({ isAdmin }: EmptyStateProps) => {
  const baseClasses = `
    w-full z-30 mb-8
    bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 
    backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 
    shadow-[0_0_15px_rgba(59,130,246,0.15)] 
    hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] 
    hover:border-blue-400/50
    transition-all duration-300 ease-in-out
    relative
  `;

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended BakuTech</h2>
      <div className="text-center py-8">
        <p className="text-gray-400">No BakuTech recommendations available yet.</p>
        {isAdmin && (
          <Link 
            href="/admin"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
          >
            Add BakuTech Recommendations
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
