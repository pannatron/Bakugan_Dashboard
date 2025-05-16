'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function NextAuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
