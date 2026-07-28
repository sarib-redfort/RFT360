import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { API_URL } from './api';
import type { LoginResponse } from '@rft360/shared';

/**
 * Auth.js (NextAuth v5) configured to authenticate against the NestJS API.
 *
 * Flow: the Credentials provider posts email/password to `POST /auth/login`;
 * the API verifies with argon2 and returns access + refresh JWTs. Those tokens
 * live inside the Auth.js encrypted session cookie. The `jwt` callback
 * transparently refreshes the access token via `POST /auth/refresh` shortly
 * before it expires, so admin sessions stay alive without re-login.
 */

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

// Access token lifetime (matches JWT_EXPIRES_IN=15m); refresh 60s early.
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_MARGIN_MS = 60 * 1000;

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('refresh failed');
  return (await res.json()) as { accessToken: string; refreshToken: string; expiresIn: number };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as LoginResponse;
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: persist tokens + profile onto the JWT.
      if (user) {
        const u = user as unknown as {
          id: string;
          role: string;
          accessToken: string;
          refreshToken: string;
        };
        return {
          ...token,
          id: u.id,
          role: u.role,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
        };
      }

      // Still valid — reuse as-is.
      if (Date.now() < (token.accessTokenExpires as number) - REFRESH_MARGIN_MS) {
        return token;
      }

      // Expired — rotate via the API's refresh endpoint.
      try {
        const refreshed = await refreshAccessToken(token.refreshToken as string);
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: Date.now() + refreshed.expiresIn * 1000,
        };
      } catch {
        return { ...token, error: 'RefreshTokenError' };
      }
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});
