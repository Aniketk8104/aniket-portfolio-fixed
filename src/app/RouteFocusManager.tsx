import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteFocusManager
 *
 * Moves focus to the route's primary heading (`main h1`) or the `<main>`
 * landmark on every pathname change. This ensures screen-reader and keyboard
 * users are oriented to the new content after client-side navigation.
 *
 * Validates: Requirements 16.2
 */
export const RouteFocusManager: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      const target =
        document.querySelector<HTMLElement>('main h1') ??
        document.querySelector<HTMLElement>('main');
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: false });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};
