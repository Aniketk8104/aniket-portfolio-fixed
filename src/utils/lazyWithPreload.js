import { lazy } from "react";

// Enhanced lazy loading with preload capability
export const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

// Intersection Observer for preloading
export const setupPreloadObserver = (components) => {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const componentName = entry.target.dataset.preload;
            const component = components[componentName];
            if (component && component.preload) {
              component.preload();
            }
          }
        });
      },
      { rootMargin: "50px" }
    );

    // Observe all elements with data-preload attribute
    document.querySelectorAll("[data-preload]").forEach((el) => {
      observer.observe(el);
    });

    return observer;
  }
};
