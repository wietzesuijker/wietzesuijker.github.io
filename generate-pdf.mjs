#!/usr/bin/env node
/**
 * Generate a pixel-perfect one-page PDF of the CV from the /print page.
 *
 * Usage:
 *   npx puppeteer browsers install chrome   # one-time
 *   node generate-pdf.mjs                   # -> cv.pdf
 *   node generate-pdf.mjs http://localhost:4000/print  # local dev
 */
import puppeteer from 'puppeteer';

const url = process.argv[2] || 'https://wietzesuijker.github.io/print';
const out = process.argv[3] || 'cv.pdf';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Render as screen (not print) so CSS grid + colors are preserved
await page.emulateMediaType('screen');

await page.setViewport({ width: 1100, height: 1560, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0' });

// Remove background around the wrapper and make it full-width for PDF
await page.evaluate(() => {
  document.body.style.background = '#fff';
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  const wrapper = document.querySelector('.wrapper');
  if (wrapper) {
    wrapper.style.maxWidth = 'unset';
    wrapper.style.margin = '0';
    wrapper.style.boxShadow = 'none';
  }
  // Hide hero and footer
  document.querySelectorAll('.hero, footer').forEach(el => el.style.display = 'none');
});

await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,
  scale: 0.68,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`Saved ${out}`);
