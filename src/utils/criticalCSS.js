// Extract critical CSS for above-the-fold content
export const extractCriticalCSS = () => {
  const critical = `
      /* Critical CSS for immediate render */
      :root {
        --primary-bg: #0a0a0f;
        --secondary-bg: #1a1a2e;
        --text-primary: #ffffff;
        --text-secondary: #b3b3cc;
        --accent-color: #667eea;
      }
  
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
  
      body {
        background: var(--primary-bg);
        color: var(--text-primary);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
      }
  
      .hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        padding: 0 2rem;
      }
  
      .hero-container {
        max-width: 1400px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
      }
  
      .hero-title {
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 900;
        line-height: 1.1;
        margin-bottom: 1.5rem;
      }
  
      /* Prevent layout shift */
      .hero-title,
      .hero-subtitle,
      .btn {
        contain: layout;
      }
  
      @media (max-width: 1024px) {
        .hero-container {
          grid-template-columns: 1fr;
        }
      }
    `;

  // Inject critical CSS inline
  const style = document.createElement("style");
  style.textContent = critical;
  document.head.insertBefore(style, document.head.firstChild);
};
