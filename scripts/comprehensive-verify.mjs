import puppeteer from 'puppeteer-core';
import fs from 'fs';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Collect console messages
const consoleMessages = [];
page.on('console', msg => {
  consoleMessages.push({ type: msg.type(), text: msg.text() });
});
page.on('pageerror', error => {
  consoleMessages.push({ type: 'error', text: error.message });
});

// Step 1: Navigate and wait 4 seconds
console.log('=== Step 1: Navigate to works.html ===');
await page.goto('http://localhost:3000/works.html', { waitUntil: 'networkidle0' });
await new Promise(resolve => setTimeout(resolve, 4000));

// Step 2: Lock browser (disable scrolling - simulate)
console.log('=== Step 2: Lock browser ===');
// Already loaded, no special lock needed for headless

// Step 3: Test Project (Wave 0)
console.log('\n=== Step 3: Test Project (Wave 0) ===');
const wave0Clicked = await page.evaluate(() => {
  if (typeof waves !== 'undefined') {
    activeWaveIdx = -1;
    waves[0].checkClick(waves[0].centerX, waves[0].currentY);
    return true;
  }
  return false;
});
console.log('Wave 0 clicked:', wave0Clicked);

// Wait 4 seconds for animation
await new Promise(resolve => setTimeout(resolve, 4000));

// Take screenshot
await page.screenshot({ path: '/workspace/final_project.png', fullPage: false });
console.log('Screenshot saved: final_project.png');

// Get Wave 0 state
const wave0State = await page.evaluate(() => {
  const gd = document.getElementById('graphicDesignGallery');
  const items = document.querySelectorAll('.gallery-item.graphic-design');
  const projectItems = [];
  const emptyItems = [];
  items.forEach(item => {
    const wrapper = item.querySelector('.card-wrapper');
    const emptyWrapper = item.querySelector('.empty-wrapper');
    if (wrapper) {
      const title = item.querySelector('.card-project-title');
      projectItems.push({
        title: title ? title.textContent : 'N/A',
        visible: item.style.opacity !== '0',
        hasPin: !!item.querySelector('.pin')
      });
    } else if (emptyWrapper) {
      emptyItems.push({ visible: true });
    }
  });
  return {
    galleryDisplay: gd.style.display,
    galleryOpacity: gd.style.opacity,
    hasShowClass: gd.classList.contains('show'),
    totalItems: items.length,
    projectItems: projectItems,
    emptyItemsCount: emptyItems.length,
    waveState: waves[0] ? {
      currentY: waves[0].currentY,
      homeY: waves[0].homeY,
      state: waves[0].state,
      txt: waves[0].txt
    } : null
  };
});
console.log('Wave 0 state:', JSON.stringify(wave0State, null, 2));

// Click on first project card
console.log('\n--- Clicking first project card ---');
const clickResult = await page.evaluate(() => {
  const firstCard = document.querySelector('.gallery-item.graphic-design .card-wrapper');
  if (firstCard) {
    const parent = firstCard.closest('.gallery-item.graphic-design');
    if (parent) {
      parent.click();
      return { clicked: true };
    }
  }
  return { clicked: false };
});
console.log('Click result:', JSON.stringify(clickResult));

// Wait 1 second (bounce animation is 0.5s + modal opens)
await new Promise(resolve => setTimeout(resolve, 1500));

// Take screenshot of modal
await page.screenshot({ path: '/workspace/final_project_modal.png', fullPage: false });
console.log('Screenshot saved: final_project_modal.png');

// Check modal state
const modalState = await page.evaluate(() => {
  const modal = document.getElementById('imageModal');
  const detailTitle = document.getElementById('detailTitle');
  const detailMeta = document.getElementById('detailMeta');
  const detailDesc = document.getElementById('detailDesc');
  return {
    modalVisible: modal ? modal.classList.contains('show') : false,
    detailTitle: detailTitle ? detailTitle.textContent : null,
    detailMeta: detailMeta ? detailMeta.textContent : null,
    detailDescText: detailDesc ? detailDesc.textContent.substring(0, 60) + '...' : null,
    currentModalMode: typeof currentModalMode !== 'undefined' ? currentModalMode : 'unknown'
  };
});
console.log('Modal state:', JSON.stringify(modalState, null, 2));

// Close the modal
await page.evaluate(() => closeDetailModal());
await new Promise(resolve => setTimeout(resolve, 500));

// Step 4: Test Leadership (Wave 1)
console.log('\n=== Step 4: Test Leadership (Wave 1) ===');
const wave1Clicked = await page.evaluate(() => {
  if (typeof waves !== 'undefined') {
    activeWaveIdx = -1;
    waves[1].checkClick(waves[1].centerX, waves[1].currentY);
    return true;
  }
  return false;
});
console.log('Wave 1 clicked:', wave1Clicked);

// Wait 4 seconds for animation
await new Promise(resolve => setTimeout(resolve, 4000));

// Take screenshot
await page.screenshot({ path: '/workspace/final_leadership.png', fullPage: false });
console.log('Screenshot saved: final_leadership.png');

// Count coming soon cards and get leadership state
const leadershipState = await page.evaluate(() => {
  const vd = document.getElementById('visualDisplayGallery');
  const leadershipCards = document.querySelectorAll('.gallery-item.visual-display .leadership-card:not(.coming-soon)');
  const comingSoonCards = document.querySelectorAll('.leadership-card.coming-soon');
  const allVisualItems = document.querySelectorAll('.gallery-item.visual-display');
  
  const leadershipDetails = [];
  leadershipCards.forEach(card => {
    const title = card.querySelector('.ld-title');
    leadershipDetails.push({
      title: title ? title.textContent : 'N/A',
      hasImage: !!card.querySelector('.ld-image'),
      hasPin: !!card.closest('.gallery-item').querySelector('.pin')
    });
  });

  return {
    galleryDisplay: vd.style.display,
    hasShowClass: vd.classList.contains('show'),
    totalVisualItems: allVisualItems.length,
    leadershipCardsCount: leadershipCards.length,
    comingSoonCardsCount: comingSoonCards.length,
    leadershipDetails: leadershipDetails,
    waveState: waves[1] ? {
      currentY: waves[1].currentY,
      homeY: waves[1].homeY,
      state: waves[1].state,
      txt: waves[1].txt
    } : null
  };
});
console.log('Leadership state:', JSON.stringify(leadershipState, null, 2));

// Step 5: Test Content Showcase (Wave 2)
console.log('\n=== Step 5: Test Content Showcase (Wave 2) ===');
const wave2Clicked = await page.evaluate(() => {
  if (typeof waves !== 'undefined') {
    activeWaveIdx = -1;
    waves[2].checkClick(waves[2].centerX, waves[2].currentY);
    return true;
  }
  return false;
});
console.log('Wave 2 clicked:', wave2Clicked);

// Wait 4 seconds for animation
await new Promise(resolve => setTimeout(resolve, 4000));

// Take screenshot
await page.screenshot({ path: '/workspace/final_content.png', fullPage: false });
console.log('Screenshot saved: final_content.png');

// Count folder pages and shell pins
const contentState = await page.evaluate(() => {
  const sm = document.getElementById('socialMediaGallery');
  const folderPages = document.querySelectorAll('.folder-page');
  const shellPins = document.querySelectorAll('.gallery-shell-pin');
  const sortBtns = document.querySelectorAll('.sort-btn');
  const activeSortBtn = document.querySelector('.sort-btn.active');
  
  const pageDetails = [];
  folderPages.forEach((page, i) => {
    const hasContent = !!page.querySelector('.page-content-wrapper img, .page-content-wrapper div[style*="font-size: 12px"]');
    pageDetails.push({
      index: i,
      hasContent: hasContent,
      transform: page.style.transform ? page.style.transform.substring(0, 60) + '...' : 'none'
    });
  });

  return {
    galleryDisplay: sm.style.display,
    hasShowClass: sm.classList.contains('show'),
    folderPagesCount: folderPages.length,
    shellPinsCount: shellPins.length,
    sortBtnsCount: sortBtns.length,
    activeSort: activeSortBtn ? activeSortBtn.textContent : null,
    pageDetails: pageDetails,
    waveState: waves[2] ? {
      currentY: waves[2].currentY,
      homeY: waves[2].homeY,
      state: waves[2].state,
      txt: waves[2].txt
    } : null
  };
});
console.log('Content Showcase state:', JSON.stringify(contentState, null, 2));

// Step 6: Check console for errors
console.log('\n=== Step 6: Console Errors ===');
const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'warning');
const allMessages = consoleMessages.map(m => `[${m.type}] ${m.text}`);
console.log('All console messages:', JSON.stringify(allMessages, null, 2));
console.log('Errors/Warnings count:', errors.length);
if (errors.length > 0) {
  console.log('Errors:', JSON.stringify(errors, null, 2));
}

// Step 7: Verify gallery positions are above wave lines
console.log('\n=== Step 7: Verify Gallery Positions ===');
const positionCheck = await page.evaluate(() => {
  const sm = document.getElementById('socialMediaGallery');
  const canvas = document.querySelector('.canvas-container canvas');
  
  if (!sm || !canvas || typeof waves === 'undefined') {
    return { error: 'Required elements not found', smExists: !!sm, canvasExists: !!canvas, wavesExists: typeof waves !== 'undefined' };
  }
  
  const wave2Y = canvas.getBoundingClientRect().top + waves[2].currentY;
  const smBottom = sm.getBoundingClientRect().bottom;
  const smTop = sm.getBoundingClientRect().top;
  
  // Also check graphicDesign and visualDisplay relative to their waves
  const gd = document.getElementById('graphicDesignGallery');
  const vd = document.getElementById('visualDisplayGallery');
  
  const wave0Y = canvas.getBoundingClientRect().top + waves[0].currentY;
  const wave1Y = canvas.getBoundingClientRect().top + waves[1].currentY;
  
  const gdBottom = gd ? gd.getBoundingClientRect().bottom : 0;
  const vdBottom = vd ? vd.getBoundingClientRect().bottom : 0;
  
  return {
    galleryAboveWave2: smBottom < wave2Y,
    smBottom: smBottom,
    wave2Y: wave2Y,
    smTop: smTop,
    wave0Y: wave0Y,
    gdBottom: gdBottom,
    galleryAboveWave0: gdBottom < wave0Y,
    wave1Y: wave1Y,
    vdBottom: vdBottom,
    galleryAboveWave1: vdBottom < wave1Y,
    canvasTop: canvas.getBoundingClientRect().top,
    canvasHeight: canvas.getBoundingClientRect().height,
    wavePositions: waves.map(w => ({
      id: w.id,
      txt: w.txt,
      currentY: w.currentY,
      homeY: w.homeY,
      state: w.state
    }))
  };
});
console.log('Position check:', JSON.stringify(positionCheck, null, 2));

// Step 8: Unlock browser (already no lock in headless)
console.log('\n=== Step 8: Unlock browser ===');
console.log('Browser unlock not needed in headless mode.');

// Final summary
console.log('\n========================================');
console.log('       COMPREHENSIVE VERIFICATION SUMMARY');
console.log('========================================');
console.log('\n--- Wave 0 (Project) ---');
console.log('Wave clicked:', wave0Clicked);
console.log('Gallery visible:', wave0State.hasShowClass);
console.log('Total project items:', wave0State.totalItems);
console.log('Project cards with content:', wave0State.projectItems.length);
console.log('Empty placeholder cards:', wave0State.emptyItemsCount);
console.log('Modal opened successfully:', modalState.modalVisible);
console.log('Modal title:', modalState.detailTitle);

console.log('\n--- Wave 1 (Leadership) ---');
console.log('Wave clicked:', wave1Clicked);
console.log('Gallery visible:', leadershipState.hasShowClass);
console.log('Leadership cards count:', leadershipState.leadershipCardsCount);
console.log('Coming soon cards count:', leadershipState.comingSoonCardsCount);
console.log('Total visual items:', leadershipState.totalVisualItems);

console.log('\n--- Wave 2 (Content Showcase) ---');
console.log('Wave clicked:', wave2Clicked);
console.log('Gallery visible:', contentState.hasShowClass);
console.log('Folder pages count:', contentState.folderPagesCount);
console.log('Shell pins count:', contentState.shellPinsCount);
console.log('Sort buttons count:', contentState.sortBtnsCount);
console.log('Active sort:', contentState.activeSort);

console.log('\n--- Console Errors ---');
console.log('Total console messages:', consoleMessages.length);
console.log('Error/Warning count:', errors.length);

console.log('\n--- Position Verification ---');
console.log('Gallery above Wave 2:', positionCheck.galleryAboveWave2);
if (positionCheck.galleryAboveWave0 !== undefined) {
  console.log('Gallery above Wave 0:', positionCheck.galleryAboveWave0);
}
if (positionCheck.galleryAboveWave1 !== undefined) {
  console.log('Gallery above Wave 1:', positionCheck.galleryAboveWave1);
}

console.log('\n========================================');

await browser.close();
console.log('Browser closed. Verification complete.');
