'use client';

import { baseClasses } from './utils';

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse"></div>
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Recommended Bakugan</h2>
      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
        <p className="font-semibold">Error: {error}</p>
      </div>
    </div>
  );
};

export default ErrorState;
