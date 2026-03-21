/**
 * Shared API base URL for browser builds.
 * - Prefer VITE_API_URL (set in Vercel / .env) for flexibility.
 * - Production fallback points at Render so the app works if env is missing.
 */
export const PRODUCTION_API_FALLBACK = 'https://nexus-d2dx.onrender.com';

export function resolveApiBaseUrl() {
  const envBase = import.meta.env.VITE_API_URL;
  if (envBase) return String(envBase).replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location?.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_FALLBACK;
  }

  return '/api';
}
