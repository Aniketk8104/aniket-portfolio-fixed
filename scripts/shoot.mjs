/**
 * Dev screenshot helper.
 * Launches system Chrome via chrome-launcher, connects with puppeteer-core,
 * and captures full-page + section screenshots of the running dev server.
 *
 * Usage: node scripts/shoot.mjs [baseUrl] [outDir]
 */
import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:5173';
const OUT = process.argv[3] || 'shots';
mkdirSync(OUT, { recursive: true });

const routes = [
  ['home', '/'],
  ['projects', '/projects'],
  ['architecture', '/architecture'],
  ['case-studies', '/case-studies'],
  ['writing', '/writing'],
];

const chrome = await ChromeLauncher.launch({
  chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1440,900'],
});

const resp = await fetch(`http://127.0.0.1:${chrome.port}/json/version`);
const { webSocketDebuggerUrl } = await resp.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl, defaultViewport: null });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  for (const [name, path] of routes) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // settle animations
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: `${OUT}/${name}-top.png` });
    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
    console.log(`shot ${name}`);
  }

  // mobile home
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: true });
  console.log('shot home-mobile');
} finally {
  await browser.disconnect();
  await chrome.kill();
}
console.log('done');
