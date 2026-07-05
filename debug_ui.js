const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    else console.log('BROWSER LOG:', msg.text());
  });
  
  // Capture page errors (unhandled exceptions)
  page.on('pageerror', err => {
    console.log('UNHANDLED EXCEPTION:', err.toString());
  });
  
  console.log('Navigating to local app...');
  await page.goto('http://localhost:5173/#/inventory', { waitUntil: 'networkidle0' });
  
  console.log('Waiting for items to load...');
  await page.waitForTimeout(2000);
  
  console.log('Looking for Edit buttons...');
  const editButtons = await page.$$('button.btn-secondary');
  console.log('Found ' + editButtons.length + ' secondary buttons');
  
  if (editButtons.length > 0) {
    console.log('Clicking the first Edit button...');
    await editButtons[1].click(); // index 1 is the first edit button usually, index 0 is Add Item? Wait, Add Item is btn-primary.
    await page.waitForTimeout(1000);
    console.log('Checking if modal opened...');
    const modal = await page.$('.glass-panel form');
    if (modal) {
      console.log('SUCCESS: Modal opened!');
    } else {
      console.log('FAIL: Modal did not open!');
    }
  }
  
  await browser.close();
})();
