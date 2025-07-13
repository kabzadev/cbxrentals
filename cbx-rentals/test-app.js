import puppeteer from 'puppeteer';

async function testApp() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Navigating to http://localhost:5555...');
  await page.goto('http://localhost:5555', { waitUntil: 'networkidle0' });
  
  console.log('2. Checking page title...');
  const title = await page.title();
  console.log('   Title:', title);
  
  console.log('3. Checking for login form...');
  const hasUsername = await page.$('input[name="username"]') !== null;
  const hasPassword = await page.$('input[name="password"]') !== null;
  console.log('   Has username field:', hasUsername);
  console.log('   Has password field:', hasPassword);
  
  console.log('4. Checking for pre-filled values...');
  if (hasUsername) {
    const username = await page.$eval('input[name="username"]', el => el.value);
    console.log('   Username value:', username);
  }
  
  console.log('5. Taking screenshot...');
  await page.screenshot({ path: 'login-page.png' });
  console.log('   Screenshot saved as login-page.png');
  
  await browser.close();
}

testApp().catch(console.error);