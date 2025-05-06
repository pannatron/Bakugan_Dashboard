'use client';

import Link from 'next/link';

interface HeaderProps {
  onToggle: () => void;
  isAdmin?: boolean;
  isButtonHovered: boolean;
  setIsButtonHovered: (value: boolean) => void;
  isButtonClicked: boolean;
  setIsButtonClicked: (value: boolean) => void;
  isBakugan: boolean;
  setIsBakugan: (value: boolean) => void;
}

const Header = ({
  onToggle,
  isAdmin,
  isButtonHovered,
  setIsButtonHovered,
  isButtonClicked,
  setIsButtonClicked,
  isBakugan,
  setIsBakugan
}: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <span className="text-blue-400 mr-2">🏆</span>
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Recommended Bakugan
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        {isAdmin && (
          <Link 
            href="/admin"
            className="px-2 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-600/30 hover:bg-blue-600/50 transition-colors text-xs"
          >
            Manage
          </Link>
        )}
      </div>
      
      {/* Compact icon button with independent state */}
      <button
        onClick={() => {
          onToggle();
          setIsButtonClicked(!isButtonClicked);
          setIsBakugan(!isBakugan);
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        className="ml-2 px-2 py-1 bg-transparent text-blue-400 hover:text-indigo-400 transition-all duration-300 hover:scale-110 relative z-50"
        aria-label="Switch between Bakugan and BakuTech"
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">
            Switch to BakuTech
          </span>
        </div>
      </button>
    </div>
  );
};

export default Header;
