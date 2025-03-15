'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const Navigation = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 border-b border-gray-800/50 shadow-md py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600">
              Bakugan
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6 sm:justify-center">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-300 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-blue-300 hover:bg-gray-800'
              }`}
            >
              Gallery
            </Link>
            <Link 
              href="/bakumania" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.includes('/bakumania') 
                  ? 'text-blue-300 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-blue-300 hover:bg-gray-800'
              }`}
            >
              Bakugan List
            </Link>
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.includes('/admin') 
                    ? 'text-purple-300 bg-purple-900/20' 
                    : 'text-gray-300 hover:text-purple-300 hover:bg-gray-800'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-expanded="false"
            aria-label="Toggle menu"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-2`}>
          <div className="flex flex-col space-y-2">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') 
                  ? 'text-blue-300 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-blue-300 hover:bg-gray-800'
              }`}
              onClick={closeMenu}
            >
              Gallery
            </Link>
            <Link 
              href="/bakumania" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.includes('/bakumania') 
                  ? 'text-blue-300 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-blue-300 hover:bg-gray-800'
              }`}
              onClick={closeMenu}
            >
              Bakugan List
            </Link>
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.includes('/admin') 
                    ? 'text-purple-300 bg-purple-900/20' 
                    : 'text-gray-300 hover:text-purple-300 hover:bg-gray-800'
                }`}
                onClick={closeMenu}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
