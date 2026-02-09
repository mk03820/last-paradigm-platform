/**
 * Authentication Type Definitions
 *
 * Extends NextAuth.js types with custom session properties.
 * Covers: Story 8.1 (Magic Link Authentication Infrastructure)
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
