const { launchBrowser } = require('../core/browserManager');
const { simulateMouseActivity, jitterMouse } = require('../core/humanSimulator');
const { log } = require('../core/logger');
const { getRandomTime, getVideoWatchTime } = require('../utils/randomUtils');
const { videoUrl, jitterInterval } = require('../config/config');

module.exports = async function runViewer() {
    log('launching browser');
    const browser = await launchBrowser();
    const page = await browser.newPage();

    try {
        log(`Opening video ${videoUrl}`);
        await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    
        //wait for player to be ready
        log('waiting for player to be ready');
        await page.waitForSelector('#movie_player', { timeout: 15000 });
        
        // Add this section to ensure video is properly loaded
        log('waiting for video element to be ready');
        await page.waitForFunction(() => {
            const video = document.querySelector('video');
            return video && video.readyState >= 1;
        }, { timeout: 30000 });

        //get viewport dimensions after page load
        log('getting viewport dimensions');
        const viewport = await page.evaluate(() => ({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        }));
        await page.setViewport(viewport);
        
        log('clicking the movie player');
        await page.evaluate(() => {
            const player = document.querySelector('#movie_player');
            if (player) {
                player.click();
            }
        });
        await simulateMouseActivity(page);

        log("determining the watchtime");
        let watchTime;
        try {
            watchTime = await getVideoWatchTime(page);
            if (!watchTime || watchTime <= 0) {
                throw new Error('Invalid watch time calculated');
            }
            log(`Watch time calculated: ${Math.floor(watchTime)} seconds`);
        } catch (watchTimeError) {
            log('Error calculating watch time, using fallback:', watchTimeError);
            watchTime = 300; // 5 minutes fallback
        }

        const watchTimeMs = watchTime * 1000;
        log('watch time in ms/jitterInterval');
        const jitterSteps = Math.floor(watchTimeMs / jitterInterval);

        for (let i = 0; i < jitterSteps; i++) {
            await jitterMouse(page);
            await new Promise(r => setTimeout(r, jitterInterval));

            // check if video is still playing
            log('check video still playing');
            const isPlaying = await page.evaluate(() => {
                const video = document.querySelector('video');
                return video && !video.paused;
            });

            if (!isPlaying) {
                log('not playing, playing the video');
                await page.evaluate(() => {
                    const player = document.querySelector('#movie_player');
                    if (player) {
                        player.click();
                    }
                });
            }
        }
        await new Promise(r => setTimeout(r, watchTimeMs % jitterInterval));
    } catch (error) {
        log('Error during viewing: ', error);
    } finally {
        log('Closing browser');
        await browser.close();
    }
};