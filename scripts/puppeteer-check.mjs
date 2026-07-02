import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

await page.goto('http://localhost:3000/works.html', { waitUntil: 'networkidle0' });

// Wait 4 seconds for animations to settle
await new Promise(resolve => setTimeout(resolve, 4000));

const result = await page.evaluate(() => {
  const gd = document.getElementById('graphicDesignGallery');
  const vd = document.getElementById('visualDisplayGallery');
  const sm = document.getElementById('socialMediaGallery');
  const canvas = document.querySelector('.canvas-container canvas');
  const title = document.querySelector('.page-title');

  const result = {
    title: title ? { top: title.getBoundingClientRect().top, bottom: title.getBoundingClientRect().bottom } : null,
    graphicDesign: {
      top: gd.getBoundingClientRect().top,
      bottom: gd.getBoundingClientRect().bottom,
      height: gd.getBoundingClientRect().height,
      styleTop: gd.style.top,
      styleHeight: gd.style.height
    },
    visualDisplay: {
      top: vd.getBoundingClientRect().top,
      bottom: vd.getBoundingClientRect().bottom,
      styleTop: vd.style.top,
      display: vd.style.display
    },
    socialMedia: {
      top: sm.getBoundingClientRect().top,
      bottom: sm.getBoundingClientRect().bottom,
      height: sm.getBoundingClientRect().height,
      styleTop: sm.style.top,
      styleHeight: sm.style.height
    },
    canvas: canvas ? { top: canvas.getBoundingClientRect().top, height: canvas.getBoundingClientRect().height } : null
  };

  // Get wave positions
  if (typeof waves !== 'undefined') {
    result.waves = waves.map(w => ({
      id: w.id,
      currentY: w.currentY,
      homeY: w.homeY,
      canvasTop: canvas ? canvas.getBoundingClientRect().top : 0,
      absoluteY: canvas ? canvas.getBoundingClientRect().top + w.currentY : w.currentY
    }));
  }

  return result;
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
