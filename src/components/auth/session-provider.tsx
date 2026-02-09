'use client';

/**
 * Session Provider Wrapper
 *
 * Wraps the app with NextAuth.js SessionProvider for client-side auth state.
 * This enables useSession() hook in client components.
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
