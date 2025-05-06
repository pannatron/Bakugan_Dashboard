'use client';

interface ShowMoreButtonProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const ShowMoreButton = ({ isExpanded, toggleExpanded }: ShowMoreButtonProps) => {
  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={toggleExpanded}
        className="px-4 py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors"
      >
        <span className="relative z-10">{isExpanded ? 'Show Less' : 'Show More'}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-lg filter blur-[1px]"></div>
      </button>
    </div>
  );
};

export default ShowMoreButton;
