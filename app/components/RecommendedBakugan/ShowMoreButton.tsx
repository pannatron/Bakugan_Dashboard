'use client';

import Image from 'next/image';

interface ShowMoreButtonProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
  recommendationsCount: number;
}

const ShowMoreButton = ({ 
  isExpanded, 
  toggleExpanded, 
  recommendationsCount 
}: ShowMoreButtonProps) => {
  if (recommendationsCount <= 5) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={toggleExpanded}
        className="transition-all duration-300 hover:scale-105 active:scale-[0.98]"
      >
        <div className="relative w-32 h-32">
          <Image 
            src="/element/switch_2_baku_tech1.webp" 
            alt="BakuTech" 
            fill
            sizes="128px"
            priority
            className="object-contain"
          />
        </div>
      </button>
    </div>
  );
};

export default ShowMoreButton;
