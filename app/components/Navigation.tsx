'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
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
            {user && (
              <Link 
                href="/portfolio" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.includes('/portfolio') 
                    ? 'text-green-300 bg-green-900/20' 
                    : 'text-gray-300 hover:text-green-300 hover:bg-gray-800'
                }`}
              >
                My Portfolio
              </Link>
            )}
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
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-blue-400">{user.name}</span>
                    {user.isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Logout
                  </button>
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
            {user && (
              <Link 
                href="/portfolio" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.includes('/portfolio') 
                    ? 'text-green-300 bg-green-900/20' 
                    : 'text-gray-300 hover:text-green-300 hover:bg-gray-800'
                }`}
                onClick={closeMenu}
              >
                My Portfolio
              </Link>
            )}
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
