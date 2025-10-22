'use client';

import { useEffect } from 'react';

// Lightweight replacement for the previous react-idle-timer implementation.
// Uses only browser APIs so it won't pull in ESM packages during SSR.
export function useDevServerHeartbeat() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastActivity = Date.now();
    const THROTTLE = 60_000 * 3; // 3 minutes

    const sendHeartbeat = () => {
      // fire-and-forget; keep dev server warm
      fetch('/', { method: 'GET' }).catch(() => {});
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivity > THROTTLE) {
        lastActivity = now;
        sendHeartbeat();
      }
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true });

    const interval = setInterval(() => {
      // periodic heartbeat in case no activity events fire but the page is open
      sendHeartbeat();
    }, THROTTLE);

    return () => {
      clearInterval(interval);
      for (const ev of events) window.removeEventListener(ev, onActivity);
    };
  }, []);
}
