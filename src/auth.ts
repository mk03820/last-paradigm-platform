/**
 * NextAuth.js v5 Configuration
 *
 * Magic link (passwordless) authentication using email.
 * Covers: FR2-1 (account creation), FR2-2 (sign in via magic link)
 *
 * Token behavior:
 * - NFR2-1: Email sent within 30 seconds
 * - AC3: Link expires after 15 minutes
 * - AC4: Link is single-use (enforced by NextAuth)
 */

import '@/types/auth.types';
import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Resend from 'next-auth/providers/resend';
import { db } from '@/lib/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from '@/lib/db/schema';
import { generateMagicLinkEmail } from '@/lib/auth/magic-link-email';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM || 'The Last Paradigm <noreply@lastparadigm.com>',
      // 15-minute token expiry (AC3)
      maxAge: 15 * 60,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url);
        const { subject, text, html } = generateMagicLinkEmail({ url, host });

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: provider.from,
            to: email,
            subject,
            text,
            html,
          }),
        });

        if (!res.ok) {
          throw new Error(`Resend error: ${await res.text()}`);
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in (AC5)
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },

  // 15-minute token expiry (AC3)
  // This is configured in the provider, but also set here for clarity
  // Note: Resend provider uses default maxAge of 24h, we customize via theme
});

// Export types for use in components
export type { Session } from 'next-auth';
