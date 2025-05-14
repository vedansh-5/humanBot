const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const { log } = require('./logger');

puppeteer.use(StealthPlugin());

function getRandomViewport() {
    return {
        width: Math.floor(Math.random() * (1920 - 1366) + 1366),
        height: Math.floor(Math.random() * (1080 - 768) + 768),
        // isMobile: Math.random() > 0.8,
        // hasTouch: Math.random() > 0.5, 
        isMobile: false,
        hasTouch: false,
    };
}

function getRandomUserAgent() {
    // Create a new UserAgent with desktop-only filter
    return new UserAgent({ 
        deviceCategory: 'desktop',
        platform: 'Win32'
    }).toString();
}

module.exports.launchBrowser = async () => {
    try {
        const viewport = getRandomViewport();
        const userAgent = getRandomUserAgent();
        log(`Using viewport: ${viewport.width},${viewport.height}`);
        log(`Using user agent: ${userAgent}`);

        const browser =  await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                `--window-size=${viewport.width},${viewport.height}`,
                `--user-agent=${userAgent}`,
            ],
            defaultViewport: {
                width: viewport.width,
                height: viewport.height
            }
        });

        // create page here
        const page = await browser.newPage();
        await page.setUserAgent(userAgent);

        return { browser, page };
    } catch (error) {
        log('Error launching browser: ', error.message);
        throw error; 
    }
};