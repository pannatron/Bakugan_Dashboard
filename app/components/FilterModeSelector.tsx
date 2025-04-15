'use client';

// Define the possible filter modes
type FilterMode = 'all' | 'bakugan' | 'bakutech' | 'battle-brawlers' | 'new-vestroia' | 'gundalian-invaders' | 'mechtanium-surge';

interface FilterModeSelectorProps {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
}

export default function FilterModeSelector({
  filterMode,
  onFilterModeChange
}: FilterModeSelectorProps) {
  // Button style function to maintain consistent styling
  const getButtonStyle = (mode: FilterMode) => {
    const isActive = filterMode === mode;
    return `px-4 py-2 rounded-full transition-all duration-300 ${
      isActive 
        ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
        : 'text-gray-400 hover:text-gray-300'
    }`;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center">
        {/* Main filter row */}
        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-full p-1 border border-gray-800/50 inline-flex">
          <button
            onClick={() => onFilterModeChange('all')}
            className={getButtonStyle('all')}
          >
            ALL
          </button>
          
          <button
            onClick={() => onFilterModeChange('bakugan')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              filterMode === 'bakugan' || 
              filterMode === 'battle-brawlers' || 
              filterMode === 'new-vestroia' || 
              filterMode === 'gundalian-invaders' || 
              filterMode === 'mechtanium-surge'
                ? 'bg-blue-600/50 text-white font-semibold shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {filterMode === 'all' || filterMode === 'bakutech' 
              ? 'Bakugan'
              : filterMode === 'bakugan' 
                ? 'Bakugan'
                : filterMode === 'battle-brawlers' 
                  ? 'Battle Brawlers (Vol.1)'
                  : filterMode === 'new-vestroia' 
                    ? 'New Vestroia (Vol.2)'
                    : filterMode === 'gundalian-invaders' 
                      ? 'Gundalian Invaders (Vol.3)'
                      : 'Mechtanium Surge (Vol.4)'
            }
          </button>
          
          <button
            onClick={() => onFilterModeChange('bakutech')}
            className={getButtonStyle('bakutech')}
          >
            Bakutech
          </button>
        </div>
        
        {/* Bakugan series filter row - only show when main Bakugan is selected */}
        {filterMode === 'bakugan' && (
          <div className="mt-4 bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-full p-1 border border-gray-800/50 inline-flex">
            <button
              onClick={() => onFilterModeChange('bakugan')}
              className={getButtonStyle('bakugan')}
            >
              All Bakugan
            </button>
            <button
              onClick={() => onFilterModeChange('battle-brawlers')}
              className={getButtonStyle('battle-brawlers')}
            >
              Vol.1
            </button>
            <button
              onClick={() => onFilterModeChange('new-vestroia')}
              className={getButtonStyle('new-vestroia')}
            >
              Vol.2
            </button>
            <button
              onClick={() => onFilterModeChange('gundalian-invaders')}
              className={getButtonStyle('gundalian-invaders')}
            >
              Vol.3
            </button>
            <button
              onClick={() => onFilterModeChange('mechtanium-surge')}
              className={getButtonStyle('mechtanium-surge')}
            >
              Vol.4
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
