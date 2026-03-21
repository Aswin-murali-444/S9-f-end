import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const CHUNK_RELOAD_KEY = 'nexus_chunk_reload_attempt_count';
const MAX_CHUNK_RECOVERY_ATTEMPTS = 3;

function setupChunkLoadRecovery() {
  const shouldRecover = (message = '') =>
    /Failed to fetch dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(message);

  const recover = async () => {
    const currentAttempts = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0');
    if (currentAttempts >= MAX_CHUNK_RECOVERY_ATTEMPTS) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(currentAttempts + 1));

    // Remove stale service workers/caches before forcing a versioned reload.
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (err) {
      console.warn('Chunk recovery cleanup skipped:', err);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now().toString());
    window.location.replace(url.toString());
  };

  window.addEventListener('error', (event) => {
    if (shouldRecover(event?.message || '')) recover();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event?.reason?.message || event?.reason || '');
    if (shouldRecover(msg)) recover();
  });
}

async function clearOldServiceWorkersAndCaches() {
  if (sessionStorage.getItem('nexus_sw_cleanup_done') === '1') return;
  sessionStorage.setItem('nexus_sw_cleanup_done', '1');

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (err) {
    console.warn('Cache/SW cleanup skipped:', err);
  }
}

// Reset recovery attempts once app is successfully mounted in this tab.
sessionStorage.setItem(CHUNK_RELOAD_KEY, '0');

setupChunkLoadRecovery();
clearOldServiceWorkersAndCaches();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
