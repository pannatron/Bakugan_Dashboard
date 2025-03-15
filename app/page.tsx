'use client';

import RecommendedBakugan from './components/RecommendedBakugan';
import { useAuth } from './components/AuthProvider';
import Link from 'next/link';

function HomeContent() {
  const { user } = useAuth();

  return (
    <main className="relative max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Section */}
      <div className="flex flex-col justify-center items-center mb-4 w-full">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x glow-text-premium relative text-center">
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x blur-sm opacity-50"></span>
            <span className="inline-block py-4">Bakugan Price Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-2 text-center">
            Track Bakugan prices and sales history with real-time charts and updates.
          </p>
        </div>
      </div>

      {/* Recommended Bakugan Gallery Section */}
      <RecommendedBakugan />
      
      {/* Link to Bakugan List */}
      <div className="flex justify-center mt-4">
        <Link 
          href="/bakumania"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            View All Bakugan
          </span>
        </Link>
      </div>
    </main>
  );
}

// Export the component
export default function Home() {
  return <HomeContent />;
}
