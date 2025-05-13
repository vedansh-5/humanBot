const { launchBrower, launchBrowser } = require('../core/browserManager');
const { simulateMouseActivity, jitterMouse } = require('../core/humanSImulator');
const { log } = require('../core/logger');
const { getRandomTime } = require('../utils/randomUtils');
const { videoUrl, minWatchTime, maxWatchTime,jitterInterval } = require('../config/config');

module.exports = async function runViewer() {
    log('launching browser');
    const browser = await launchBrowser();
    const page = await browser.newPage();

    log(`Opening video ${videoUrl}`);
    await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 60000});

    //wait for player to be ready
    await page.waitForSelector('#movie_player', { timeout: 15000});

    //get viewport dimensions after page load
    const viewport = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    }));
    await page.setViewport(viewport);

    
    await page.evaluate(() => {
        const player = document.querySelector('#movie_player');
        if(player) {
            player.click();
        }
    })
    await simulateMouseActivity(page);

    const watchTime = getRandomTime(minWatchTime, maxWatchTime);
    log(`Watching video for ${(watchTime / 1000).toFixed(1)} seconds`);

    const jitterSteps = Math.floor(watchTime/jitterInterval);
    for(let i=0; i<jitterSteps; i++){
        await jitterMouse(page);
    }
    await new Promise(r => setTimeout(r, watchTime % jitterInterval));

    log('Closing browser');
    await browser.close();
}