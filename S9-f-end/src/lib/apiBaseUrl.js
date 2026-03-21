/**
 * Shared API base URL for browser builds.
 * - Prefer VITE_API_URL (set in Vercel / .env) for flexibility.
 * - Production fallback points at Render so the app works if env is missing.
 */
export const PRODUCTION_API_FALLBACK = 'https://nexus-d2dx.onrender.com';

export function resolveApiBaseUrl() {
  const isLocalhost = (value = '') => /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(value));
  const extractHost = (urlLike = '') => {
    try {
      return new URL(String(urlLike)).host;
    } catch {
      return '';
    }
  };
  const browserHost = typeof window !== 'undefined' ? (window.location?.host || '') : '';
  const browserIsLocal = isLocalhost(browserHost);

  const envBase = import.meta.env.VITE_API_URL;
  if (envBase) {
    const normalizedEnv = String(envBase).replace(/\/$/, '');
    const envHost = extractHost(normalizedEnv);
    const envTargetsLocal = (envHost && isLocalhost(envHost)) || isLocalhost(normalizedEnv) || /localhost|127\.0\.0\.1/i.test(normalizedEnv);
    // Guard against accidental production config pointing to localhost.
    if (envTargetsLocal && !browserIsLocal) {
      return PRODUCTION_API_FALLBACK;
    }
    return normalizedEnv;
  }

  if (browserIsLocal) {
    return 'http://localhost:3001';
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_FALLBACK;
  }

  return '/api';
}
