const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getOxylabsProxy } = require('./proxyManager');
const { log } = require('./logger');

puppeteer.use(StealthPlugin());

module.exports.launchBrowser = async () => {
    try {
        const proxyConfig = getOxylabsProxy();
        log(`Launching browser with proxy: ${proxyConfig.proxyUrl}`);

        const browser = await puppeteer.launch({
            headless: process.env.HEADLESS === 'true',
             args: [
                `--proxy-server=https://${proxyConfig.proxyUrl}`,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--enable-features=NetworkService,NetworkServiceInProcess'
            ]
        });

        const page = await browser.newPage();
        
        // Authenticate proxy with HTTPS
        await page.authenticate({
            username: proxyConfig.username,
            password: proxyConfig.password
        });

        // Test proxy connection with longer timeout
        try {
            log('Testing proxy connection');
            await page.goto('https://api.ipify.org?format=json', {
                waitUntil: 'networkidle0',
                timeout: 60000  // timeout 60 sec
            });
            
            const ipData = await page.evaluate(() => JSON.parse(document.body.textContent));
            log(`Connected through IP: ${ipData.ip}`);

            const security = await page.evaluate(() => ({
                protocol: window.location.protocol,
                secure: window.location.protocol === 'https:'
            }));
            
            log(`Connection security: ${JSON.stringify(security)}`);
            
            await page.close();
            return browser;
        } catch (error) {
            log('Proxy connection test failed:', error.message);
            throw new Error(`Proxy connection failed: ${error.message}`);
        }
    } catch (error) {
        log('Error launching browser:', error.message);
        throw error;
    }
};