'use client';

import Link from 'next/link';
import { baseClasses } from './utils';

interface EmptyStateProps {
  isAdmin?: boolean;
}

const EmptyState = ({ isAdmin }: EmptyStateProps) => {
  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended Bakugan</h2>
      <div className="text-center py-8">
        <p className="text-gray-400">No recommendations available yet.</p>
        {isAdmin && (
          <Link 
            href="/admin"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
          >
            Add Recommendations
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
