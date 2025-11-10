import { lazy } from "react";

// Enhanced lazy loading with preload capability
export const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

// Intersection Observer for preloading
export const setupPreloadObserver = components => {
  if (!('IntersectionObserver' in window)) {
    return undefined;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        const componentName = entry.target.dataset.preload;
        const component = components[componentName];

        if (component?.preload) {
          component.preload();
        }

        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '200px 0px' }
  );

  document.querySelectorAll('[data-preload]').forEach(element => {
    observer.observe(element);
  });

  return observer;
};
