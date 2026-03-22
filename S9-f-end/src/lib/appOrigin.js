/**
 * Origin used in Supabase auth URLs (email confirmation, OAuth return, password reset).
 * Set VITE_APP_URL on the production host (e.g. https://s9-f-end.vercel.app) so redirects
 * stay on the live site even if a production build is opened from an unexpected origin.
 * In dev, the browser origin is always used.
 */
export function resolveAuthRedirectOrigin() {
  const trim = (v) => String(v || '').replace(/\/$/, '');
  const envUrl = import.meta.env.VITE_APP_URL;
  if (import.meta.env.PROD && envUrl) {
    return trim(envUrl);
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return trim(envUrl) || '';
}
