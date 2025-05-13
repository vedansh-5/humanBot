const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { proxy } = require('../config/config');

puppeteer.use(StealthPlugin());

module.exports.launchBrowser = async () => {
    const args = proxy ? [`''pproxy-server=${proxy}`] : [];
    return await puppeteer.launch({
        headless: false,
        args,
        defaultViewport: null,
    });
};