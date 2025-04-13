'use client';

export default function BakumaniaHeader() {
  return (
    <div className="flex flex-col justify-center items-center mb-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x glow-text-premium relative text-center">
          <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x blur-sm opacity-50"></span>
          <span className="inline-block py-4">Bakugan List</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-4 text-center">
          Browse, filter, and track all Bakugan in our database.
        </p>
      </div>
    </div>
  );
}
