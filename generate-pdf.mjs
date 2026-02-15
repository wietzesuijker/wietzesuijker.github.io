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

// Use a wider viewport - the PDF scale parameter will shrink it to A4,
// fitting more content vertically on one page
await page.setViewport({ width: 1100, height: 1560, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0' });

// A4 is 210x297mm. With scale < 1, puppeteer renders at (pageWidth / scale)
// then shrinks to fit, so more content fits per page.
await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,
  scale: 0.68,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`Saved ${out}`);
