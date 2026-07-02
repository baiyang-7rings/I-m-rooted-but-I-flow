import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Capture ALL console messages and network errors
const allMessages = [];
page.on('console', msg => {
  allMessages.push({ type: msg.type(), text: msg.text() });
});

const failedRequests = [];
page.on('requestfailed', request => {
  failedRequests.push({ url: request.url(), failure: request.failure()?.errorText });
});

page.on('response', response => {
  if (response.status() >= 400) {
    failedRequests.push({ url: response.url(), status: response.status() });
  }
});

await page.goto('http://localhost:3000/works.html', { waitUntil: 'networkidle0' });
await new Promise(resolve => setTimeout(resolve, 4000));

// Trigger Leadership wave
await page.evaluate(() => {
  if (typeof waves !== 'undefined') {
    if (typeof activeWaveIdx !== 'undefined') activeWaveIdx = -1;
    waves[1].checkClick(waves[1].centerX, waves[1].currentY);
  }
});
await new Promise(resolve => setTimeout(resolve, 5000));

console.log('=== All Console Messages ===');
allMessages.forEach((m, i) => console.log(`  [${i}] (${m.type}) ${m.text}`));

console.log('\n=== Failed Network Requests ===');
failedRequests.forEach((r, i) => console.log(`  [${i}] ${r.status ? 'Status: ' + r.status : 'Error: ' + r.failure} URL: ${r.url}`));

await browser.close();
