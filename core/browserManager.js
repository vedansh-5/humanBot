const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const { log } = require('../core/logger');

puppeteer.use(StealthPlugin());

function getRandomViewport() {
    return {
        width: Math.floor(Math.random() * (1920 - 1366) + 1366),
        height: Math.floor(Math.random() * (1080 - 768) + 768),
        isMobile: Math.random() > 0.8,
        hasTouch: Math.random() > 0.5, 
    };
}

module.exports.launchBrowser = async () => {
    try {
        return await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sanbox',
                '--window-size=1920,1080'
            ],
            defaultViewport: null,
        });
    } catch (error) {
        log('Error launching browser: ', error.message);
        throw error; 
    }
};