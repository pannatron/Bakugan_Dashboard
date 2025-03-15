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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-lg border-b border-gray-800/50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center" onClick={closeMenu}>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600">
                  Bakugan
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
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
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
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
    </nav>
  );
};

export default Navigation;
