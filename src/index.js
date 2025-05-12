const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');
require('dotenv').config();

// Apply stealth plugin
puppeteer.use(StealthPlugin());

async function runBot() {
    const browser = await puppeteer.launch({
        headless: process.env.HEADLESS === 'true',
        args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    console.log('[+] Launching YouTube');

    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('[+] Closing browser');
    await browser.close();
}

runBot();
