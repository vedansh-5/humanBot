const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const { log } = require('./logger');
const fs = require('fs');
const path = require('path');
// const { useProxy } = require('../config/config');
const { botLog } = require('../core/logger');

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

function getRandomProxy(){
    const proxies = fs.readFileSync(path.resolve(__dirname, '../config/proxies.txt'), 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    return proxies[Math.floor(Math.random() * proxies.length)];
}

module.exports.launchBrowser = async () => {
    try {
        const viewport = getRandomViewport();
        const userAgent = getRandomUserAgent();
        const proxy = getRandomProxy();
        botLog(`Using proxy`, proxy);
        console.log('Using proxy', proxy);
        log(`Using viewport: ${viewport.width},${viewport.height}`);
        log(`Using user agent: ${userAgent}`);

        // Extract proxy parts
        const [ip, port, username, password] = proxy.split(':');
        let proxyAuth = { username, password };

        const browser =  await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=site-per-process',
                `--window-size=${viewport.width},${viewport.height}`,
                `--user-agent=${userAgent}`,
                `--proxy-server=http://${ip}:${port}`,
            ],
           defaultViewport: null,  // Let the browser handle viewport
           executablePath: process.platform === 'win32' ? undefined : '/usr/bin/google-chrome'
        });
        
        const page = await browser.newPage();
        // Set user agent but let viewport be dynamic
        await page.setUserAgent(userAgent);
        // Apply HTTP basic auth if needed
        if (proxyAuth) {
            await page.authenticate(proxyAuth);
            botLog('Proxy auth applied for', proxyAuth.username);
        }
        return { browser, page };
    } catch (error) {
        log('Error launching browser: ', error.message);
        throw error; 
    }
};