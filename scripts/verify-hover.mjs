import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:5174';
mkdirSync('shots-hover', { recursive: true });

const chrome = await ChromeLauncher.launch({
  chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1440,900'],
});
const resp = await fetch(`http://127.0.0.1:${chrome.port}/json/version`);
const { webSocketDebuggerUrl } = await resp.json();
const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl, defaultViewport: null });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));

  const projectsLink = await page.evaluateHandle(() => {
    const links = [...document.querySelectorAll('.nav-links a')];
    return links.find((a) => a.textContent.trim().startsWith('Projects'));
  });
  await projectsLink.asElement().hover();
  await new Promise((r) => setTimeout(r, 700));

  const info = await page.evaluate(() => {
    const panel = document.querySelector('.nav-megapanel');
    const r = panel ? panel.getBoundingClientRect() : null;
    const lastCard = document.querySelector('.nav-megacard:last-child');
    const lr = lastCard ? lastCard.getBoundingClientRect() : null;
    return {
      viewport: window.innerWidth,
      panelRect: r ? { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) } : null,
      gapLeft: r ? Math.round(r.left) : null,
      gapRight: r ? Math.round(window.innerWidth - r.right) : null,
      lastCardRight: lr ? Math.round(lr.right) : null,
      lastCardVisible: lr ? lr.right <= window.innerWidth : null,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'shots-hover/projects-hover.png' });
} finally {
  await browser.disconnect();
  await chrome.kill();
}
