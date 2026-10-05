'use client';
import { useEffect, useState } from 'react';

export const DESKTOP_MIN_WIDTH = 768;

export function useIsDesktop(): boolean {
  // Default to false on the server / first paint, then upgrade on the client.
  // The brief flash of mobile on a desktop browser is acceptable for this app
  // and avoids any hydration mismatch.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
