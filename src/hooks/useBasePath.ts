import { useLocation } from 'react-router-dom';

/**
 * Returns the base path prefix for the current route context.
 * Used by shared kiosk/mobile components to navigate correctly.
 * Returns '/kiosk' or '/m' depending on the current URL.
 */
export function useBasePath(): string {
  const { pathname } = useLocation();
  if (pathname.startsWith('/m')) return '/m';
  return '/kiosk';
}
