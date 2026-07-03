/**
 * Programmatic visual audit of the running dev server.
 * Reports: section backgrounds, card contrast, horizontal overflow,
 * invisible/low-contrast text, element geometry. Grounds design decisions
 * in real computed values instead of guesswork.
 */
import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:5173';
const PATH = process.argv[3] || '/';

const chrome = await ChromeLauncher.launch({
  chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1440,900'],
});
const resp = await fetch(`http://127.0.0.1:${chrome.port}/json/version`);
const { webSocketDebuggerUrl } = await resp.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl, defaultViewport: null });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}${PATH}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const report = await page.evaluate(() => {
    const vw = window.innerWidth;
    const out = { viewport: vw, overflow: [], sections: [], lowContrast: [], cards: [] };

    function parseRGB(s) {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
    }
    function lum({ r, g, b }) {
      const f = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function contrast(a, b) {
      const L1 = lum(a), L2 = lum(b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    }

    // horizontal overflow
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 2 && r.right > vw + 2) {
        out.overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40), w: Math.round(r.width) });
      }
    });
    out.overflow = out.overflow.slice(0, 12);

    // top-level sections
    document.querySelectorAll('main > *, main section, body > section').forEach((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.sections.push({
        tag: el.tagName,
        id: el.id || (el.className || '').toString().slice(0, 30),
        bg: cs.backgroundColor,
        h: Math.round(r.height),
        padTop: cs.paddingTop,
        padBottom: cs.paddingBottom,
      });
    });

    // card-like elements: contrast of bg vs page bg + border visibility
    const pageBg = parseRGB(getComputedStyle(document.body).backgroundColor) || { r: 8, g: 9, b: 12 };
    const seen = new Set();
    document.querySelectorAll('[class*="card"], main div').forEach((el) => {
      const cs = getComputedStyle(el);
      const bg = parseRGB(cs.backgroundColor);
      if (!bg || bg.a < 0.2) return;
      const key = cs.backgroundColor + cs.borderColor;
      if (seen.has(key)) return;
      seen.add(key);
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 60) return;
      out.cards.push({
        bg: cs.backgroundColor,
        border: cs.borderTopColor,
        borderW: cs.borderTopWidth,
        radius: cs.borderTopLeftRadius,
        shadow: cs.boxShadow.slice(0, 40),
        contrastVsPage: +contrast(bg, pageBg).toFixed(2),
      });
    });
    out.cards = out.cards.slice(0, 10);

    // low-contrast text
    function walk(el) {
      const cs = getComputedStyle(el);
      if (el.children.length === 0 && el.textContent.trim()) {
        const fg = parseRGB(cs.color);
        let bgEl = el, bg = null;
        while (bgEl) {
          const c = parseRGB(getComputedStyle(bgEl).backgroundColor);
          if (c && c.a > 0.5) { bg = c; break; }
          bgEl = bgEl.parentElement;
        }
        if (fg && bg) {
          const cr = contrast(fg, bg);
          if (cr < 4.5) out.lowContrast.push({ txt: el.textContent.trim().slice(0, 30), color: cs.color, cr: +cr.toFixed(2), size: cs.fontSize });
        }
      }
      for (const c of el.children) walk(c);
    }
    walk(document.body);
    out.lowContrast = out.lowContrast.slice(0, 15);

    return out;
  });

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.disconnect();
  try { await chrome.kill(); } catch {}
}
