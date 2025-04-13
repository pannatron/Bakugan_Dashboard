'use client';

interface FilterModeSelectorProps {
  filterMode: 'all' | 'bakugan' | 'bakutech';
  onFilterModeChange: (mode: 'all' | 'bakugan' | 'bakutech') => void;
}

export default function FilterModeSelector({
  filterMode,
  onFilterModeChange
}: FilterModeSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-center">
        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-full p-1 border border-gray-800/50 inline-flex">
          <button
            onClick={() => onFilterModeChange('all')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              filterMode === 'all' 
                ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => onFilterModeChange('bakugan')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              filterMode === 'bakugan' 
                ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Bakugan
          </button>
          <button
            onClick={() => onFilterModeChange('bakutech')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              filterMode === 'bakutech' 
                ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Bakutech
          </button>
        </div>
      </div>
    </div>
  );
}
