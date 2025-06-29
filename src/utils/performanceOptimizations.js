// Performance optimizations utility
export const optimizePerformance = () => {
  // Debounce scroll events
  let scrollTimeout;
  const handleScroll = () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      // Handle scroll
    });
  };

  // Lazy load images with native loading
  const images = document.querySelectorAll("img[data-src]");
  const imageOptions = {
    threshold: 0.01,
    rootMargin: "0px 0px 50px 0px",
  };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  }, imageOptions);

  images.forEach((img) => imageObserver.observe(img));

  // Reduce paint areas
  const reducePaintAreas = () => {
    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => {
      el.style.willChange = "auto";
    });
  };

  // Clean up animations after they complete
  document.addEventListener("animationend", (e) => {
    e.target.style.willChange = "auto";
  });

  return {
    handleScroll,
    reducePaintAreas,
  };
};

// Memory management
export const memoryCleanup = () => {
  // Clear unused references
  if ("gc" in window) {
    window.gc();
  }

  // Remove detached DOM nodes
  const clearDetachedNodes = () => {
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      if (!document.body.contains(el)) {
        el.remove();
      }
    });
  };

  return clearDetachedNodes;
};
