import puppeteer from 'puppeteer-core';
import fs from 'fs';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Collect console errors
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

// Step 1: Navigate and wait 4 seconds
console.log('=== Step 1: Navigate to works.html ===');
await page.goto('http://localhost:3000/works.html', { waitUntil: 'networkidle0' });
await new Promise(resolve => setTimeout(resolve, 4000));
console.log('Page loaded, 4s wait complete.');

// Step 2: Lock the browser (no-op in headless, but conceptually we proceed)

// Step 3: Trigger Wave 1 (Leadership)
console.log('\n=== Step 3: Trigger Wave 1 (Leadership) ===');
await page.evaluate(() => {
  if (typeof waves !== 'undefined') {
    if (typeof activeWaveIdx !== 'undefined') activeWaveIdx = -1;
    waves[1].checkClick(waves[1].centerX, waves[1].currentY);
  }
});

// Wait 5 seconds for scatter animation to complete
await new Promise(resolve => setTimeout(resolve, 5000));

// Take screenshot
await page.screenshot({ path: '/workspace/pixel_leadership.png', fullPage: false });
console.log('Screenshot saved: pixel_leadership.png');

// Step 4: Check item structure
console.log('\n=== Step 4: Check item structure ===');
const itemStructure = await page.evaluate(() => {
  const items = document.querySelectorAll('.gallery-item.visual-display');
  return Array.from(items).map(i => ({
    hasLeadershipCard: !!i.querySelector('.leadership-card'),
    hasDirectImg: !!i.querySelector(':scope > img'),
    hasPin: !!i.querySelector('.pin'),
    pinSize: i.querySelector('.pin')?.offsetWidth
  }));
});
console.log('Item structure:', JSON.stringify(itemStructure, null, 2));

// Step 5: Check image sizes
console.log('\n=== Step 5: Check image sizes ===');
const imageSizes = await page.evaluate(() => {
  const imgs = document.querySelectorAll('.gallery-item.visual-display > img');
  return Array.from(imgs).map(i => ({
    w: i.offsetWidth,
    h: i.offsetHeight,
    maxW: getComputedStyle(i).maxWidth,
    shadow: getComputedStyle(i).boxShadow
  }));
});
console.log('Image sizes:', JSON.stringify(imageSizes, null, 2));

// Step 6: Check scatter count and rotation
console.log('\n=== Step 6: Check scatter count and rotation ===');
const scatterInfo = await page.evaluate(() => {
  const items = document.querySelectorAll('.gallery-item.visual-display');
  return {
    count: items.length,
    rotations: Array.from(items).map(i => i.style.getPropertyValue('--rotation'))
  };
});
console.log('Scatter info:', JSON.stringify(scatterInfo, null, 2));

// Step 7: Test click animation on Spark Society item
console.log('\n=== Step 7: Test click animation on Spark Society ===');
// Find the item with the real image (not SVG placeholder)
const sparkItemInfo = await page.evaluate(() => {
  const items = document.querySelectorAll('.gallery-item.visual-display');
  for (let i = 0; i < items.length; i++) {
    const img = items[i].querySelector(':scope > img');
    if (img && img.src && !img.src.includes('data:image/svg')) {
      const r = items[i].getBoundingClientRect();
      return { index: i, src: img.src, x: r.x, y: r.y, width: r.width, height: r.height };
    }
  }
  return null;
});
console.log('Spark Society item info:', JSON.stringify(sparkItemInfo, null, 2));

if (sparkItemInfo && sparkItemInfo.width > 0) {
  // Click the item
  const clickX = sparkItemInfo.x + sparkItemInfo.width / 2;
  const clickY = sparkItemInfo.y + sparkItemInfo.height / 2;
  console.log(`Clicking at (${clickX}, ${clickY})`);
  await page.mouse.click(clickX, clickY);
  
  // Wait 1.5 seconds for animation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Take screenshot
  await page.screenshot({ path: '/workspace/pixel_leadership_click.png', fullPage: false });
  console.log('Click screenshot saved: pixel_leadership_click.png');
  
  // Check if modal appeared
  const modalState = await page.evaluate(() => {
    const modal = document.getElementById('imageModal');
    return {
      isVisible: modal ? modal.classList.contains('show') : false,
      display: modal ? getComputedStyle(modal).display : 'N/A'
    };
  });
  console.log('Modal state after click:', JSON.stringify(modalState, null, 2));

  // Close modal by pressing Escape
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 500));
} else if (sparkItemInfo) {
  // Item found but has zero dimensions — use JS click instead
  console.log('Spark Society item has zero dimensions, using JS click');
  await page.evaluate((idx) => {
    const items = document.querySelectorAll('.gallery-item.visual-display');
    if (items[idx]) items[idx].click();
  }, sparkItemInfo.index);
  await new Promise(resolve => setTimeout(resolve, 1500));
  await page.screenshot({ path: '/workspace/pixel_leadership_click.png', fullPage: false });
  console.log('Click screenshot saved: pixel_leadership_click.png');
  
  const modalState = await page.evaluate(() => {
    const modal = document.getElementById('imageModal');
    return {
      isVisible: modal ? modal.classList.contains('show') : false,
      display: modal ? getComputedStyle(modal).display : 'N/A'
    };
  });
  console.log('Modal state after click:', JSON.stringify(modalState, null, 2));
  await page.keyboard.press('Escape');
  await new Promise(resolve => setTimeout(resolve, 500));
} else {
  console.log('WARNING: Could not find Spark Society item with real image!');
}

// Step 8: Check for console errors
console.log('\n=== Step 8: Console errors ===');
if (consoleErrors.length === 0) {
  console.log('No console errors detected.');
} else {
  console.log('Console errors found:');
  consoleErrors.forEach((err, i) => console.log(`  [${i}] ${err}`));
}

// Final summary
console.log('\n=== SUMMARY ===');
console.log('Item count:', scatterInfo.count);
console.log('Items with leadership-card:', itemStructure.filter(i => i.hasLeadershipCard).length);
console.log('Items with direct img:', itemStructure.filter(i => i.hasDirectImg).length);
console.log('Items with pin:', itemStructure.filter(i => i.hasPin).length);
console.log('Console errors:', consoleErrors.length);

await browser.close();
