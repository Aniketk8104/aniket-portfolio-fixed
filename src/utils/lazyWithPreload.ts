/**
 * lazyWithPreload — wraps React.lazy with a .preload() method for
 * speculative loading before user interaction.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LazyComponentWithPreload<T extends ComponentType<any>> =
  LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> };

/**
 * Creates a lazy component that also exposes `.preload()`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyComponentWithPreload<T> {
  const Component = lazy(factory) as LazyComponentWithPreload<T>;
  Component.preload = factory;
  return Component;
}

/**
 * Sets up an IntersectionObserver to preload components when their
 * placeholder elements enter the viewport.
 */
export function setupPreloadObserver(
  components: Record<string, { preload?: () => void }>,
): IntersectionObserver | undefined {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const componentName = (entry.target as HTMLElement).dataset.preload;
        const component = componentName ? components[componentName] : undefined;
        if (component?.preload) {
          component.preload();
        }
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '200px 0px' },
  );

  document.querySelectorAll('[data-preload]').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}
