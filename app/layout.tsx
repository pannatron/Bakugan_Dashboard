import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './components/NextAuthProvider';
import { AuthProvider } from './components/AuthProvider';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bakugan Price Dashboard',
  description: 'Track Bakugan prices and sales history',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f1318] to-[#0a0a0a] relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-float opacity-70 mix-blend-screen"></div>
              <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-800/30 rounded-full blur-[100px] animate-float-delayed opacity-70 mix-blend-screen"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-[80px] animate-pulse-slow"></div>
              <div className="absolute inset-0 noise-texture opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            </div>
            
            <Navigation />
            
            <div className="relative z-10">
              {children}
            </div>
            </div>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
