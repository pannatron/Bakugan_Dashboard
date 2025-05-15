'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <Link 
              href="/pricing" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.includes('/pricing') 
                  ? 'text-green-300 bg-green-900/20' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-gray-800'
              }`}
            >
              Pricing
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
            
            {/* Auth buttons */}
            <div className="ml-4">
              {user ? (
                <div className="flex items-center gap-4" ref={dropdownRef}>
                  <div 
                    className="text-sm text-gray-300 cursor-pointer flex items-center relative"
                    onClick={toggleUserDropdown}
                  >
                    <span className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      {user.name}
                    </span>
                    <svg 
                      className={`ml-1 h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    {user.isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        Admin
                      </span>
                    )}
                    
                    {/* User dropdown menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 top-full w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <a 
                            href="/settings" 
                            className={`block px-4 py-2 text-sm ${
                              pathname.includes('/settings') 
                                ? 'text-blue-300 bg-blue-900/20' 
                                : 'text-gray-300 hover:text-blue-300 hover:bg-gray-700'
                            }`}
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Settings
                          </a>
                          <Link 
                            href="/portfolio" 
                            className={`block px-4 py-2 text-sm ${
                              pathname.includes('/portfolio') 
                                ? 'text-green-300 bg-green-900/20' 
                                : 'text-gray-300 hover:text-green-300 hover:bg-gray-700'
                            }`}
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Portfolio
                          </Link>
                          <Link 
                            href="/favorites" 
                            className={`block px-4 py-2 text-sm ${
                              pathname.includes('/favorites') 
                                ? 'text-red-300 bg-red-900/20' 
                                : 'text-gray-300 hover:text-red-300 hover:bg-gray-700'
                            }`}
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Favorites
                          </Link>
                          <div className="border-t border-gray-700 my-1"></div>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-red-300 hover:bg-gray-700"
                            role="menuitem"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Sign In
                </Link>
              )}
            </div>
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
            <Link 
              href="/pricing" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.includes('/pricing') 
                  ? 'text-green-300 bg-green-900/20' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-gray-800'
              }`}
              onClick={closeMenu}
            >
              Pricing
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
            
            {/* Mobile auth buttons */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-300">
                    <span className="font-medium text-blue-400">{user.name}</span>
                    {user.isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <a 
                    href="/settings" 
                    className={`block px-3 py-2 text-base font-medium ${
                      pathname.includes('/settings') 
                        ? 'text-blue-300 bg-blue-900/20' 
                        : 'text-gray-300 hover:text-blue-300 hover:bg-gray-800'
                    }`}
                    onClick={closeMenu}
                  >
                    Settings
                  </a>
                  
                  <Link 
                    href="/portfolio" 
                    className={`block px-3 py-2 text-base font-medium ${
                      pathname.includes('/portfolio') 
                        ? 'text-green-300 bg-green-900/20' 
                        : 'text-gray-300 hover:text-green-300 hover:bg-gray-800'
                    }`}
                    onClick={closeMenu}
                  >
                    Portfolio
                  </Link>
                  
                  <Link 
                    href="/favorites" 
                    className={`block px-3 py-2 text-base font-medium ${
                      pathname.includes('/favorites') 
                        ? 'text-red-300 bg-red-900/20' 
                        : 'text-gray-300 hover:text-red-300 hover:bg-gray-800'
                    }`}
                    onClick={closeMenu}
                  >
                    Favorites
                  </Link>
                  
                  <div className="border-t border-gray-700 my-1"></div>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-red-300 hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-blue-300 hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
