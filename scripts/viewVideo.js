const { launchBrowser } = require('../core/browserManager');
const { simulateMouseActivity, jitterMouse, naturalScroll } = require('../core/humanSimulator');
const { log, botLog } = require('../core/logger');
const { getRandomTime, getVideoWatchTime } = require('../utils/randomUtils');
const { videoUrl, jitterInterval, userReferrer, referrerListPath } = require('../config/config');
const fs = require('fs');
const { timeout } = require('puppeteer');

const videoControlsSelectors = {
    progressBar: '.ytp-progress-bar-container',
    playButton: '.ytp-play-button',
    volumeButton: '.ytp-mute-button',
    settingsButton: '.ytp-settings-button'
};


async function getRandomReferrer(){
    try{
        const list = JSON.parse(fs.readFileSync(referrerListPath, 'utf-8'));
        if(!Array.isArray(list) || list.length === 0){
            throw new Error('No referrer URLs available');
        }
        const pick = list[Math.floor(Math.random() * list.length)];
        return pick.url;
    } catch(error) {
        log('Error getting referrer URL:', error.message);
        return null;
    }
}

module.exports = async function runViewer(mode = 'watchtime') {
    let browser, page;
    let entryUrl = videoUrl;
    if(userReferrer) {
       const referrerUrl = await getRandomReferrer();
       if(referrerUrl) {
        entryUrl = referrerUrl;
        log(`Using referrer URL: ${entryUrl}`);
       }
    }
    
    try {
        log('launching browser');
        botLog('Launching browser');
        ({ browser, page } = await launchBrowser());

        // Navigate to referrer page
        log(`Opening referrer page: ${entryUrl}`);
        await page.goto(entryUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        // Wait a bit and simulate natural behaviour
        await naturalScroll(page);
        await simulateMouseActivity(page);
        
        // Find and click the video link
        log('Looking for video link');
        const videoLinks = await page.$$(`a[href*="${videoUrl}]`);
        if(videoLinks.length > 0) {
            // Click a random video link if multiple exist
            const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];
            log('Found video link, clicking...');
            await randomLink.click();
            
            // Wait for navigation to video
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        } else {
            log('No video link found, going directly to video');
            await page.goto(videoUrl, { waitUntil: 'networkidle0', timeout: 60000 });
        }
        
        log(`Opening video ${videoUrl}`);
        botLog('Starting run for video: ', videoUrl);
        botLog('Referrer', entryUrl);
        await page.goto(entryUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    
        //wait for player to be ready
        log('waiting for player to be ready');
        await page.waitForSelector('#movie_player', { timeout: 30000 });
        
        // Add this section to ensure video is properly loaded
        log('waiting for video element to be ready');
        await page.waitForFunction(() => {
            const video = document.querySelector('video');
            const player = document.querySelector('#movie_player');
            return video && video.readyState >= 2 && player && !player.classList.contains('loading');
            return video && video.readyState >= 1;
        }, { timeout: 30000, polling: 500 });

        // ensure video is actually loaded
        await page.evaluate(() => {
            return new Promise((r) => {
                const video = document.querySelector('video');
                if(video && video.readyState >= 2){
                    r();
                } else {
                    video.addEventListener('loadeddata', resolve, { once: true });
                }
            });
        })

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

        switch(mode.toLowerCase()) {
            case 'view':
                // Quick view mode
                const quickViewTime = Math.floor(Math.random() * 2000); // 0-2000ms
                log(`Quick view mode: watching for ${quickViewTime}ms`);
                await page.waitForSelector('#movie_player');
                await page.click('#movie_player');
                await new Promise(r => setTimeout(r, quickViewTime));
                break;

            case 'watchtime':
                // Full watch mode
                log('Watch time mode: calculating duration...');
                let watchTime = await getVideoWatchTime(page);
                if (!watchTime || watchTime <= 0) {
                    watchTime = 300; // 5 min fallback
                }
                log(`Watching for ${Math.floor(watchTime)} seconds`);
                
                botLog('Watching for: ', watchTime);
                const watchTimeMs = watchTime * 1000;
                const jitterSteps = Math.floor(watchTimeMs / jitterInterval);

                log('Simulating natural viewing behavior');
                
                // Initial scroll with proper function call
                await naturalScroll(page);
                
                // Simulate mouse activity
                await simulateMouseActivity(page);
                
                // Add initial interaction with video player controls
                log('Interacting with video controls');
                try {
                    // Wait for controls to be visible
                    await page.waitForSelector(videoControlsSelectors.progressBar, { timeout: 5000 });
                    
                    // Random interactions with different controls
                    const controls = Object.values(videoControlsSelectors);
                    const randomControl = controls[Math.floor(Math.random() * controls.length)];
                    
                    await page.hover(randomControl);
                    await new Promise(r => setTimeout(r, getRandomInt(500, 1500)));
                    
                } catch (controlError) {
                    log('Could not interact with video controls, continuing...');
                }
                
                // Regular jitter and interactions during video playback
                for (let i = 0; i < jitterSteps; i++) {
                    const interactionChance = Math.random();
                    
                    if (interactionChance < 0.7) { // 70% chance to move
                        await jitterMouse(page);
                    } else if (interactionChance < 0.8) { // 10% chance to scroll
                        await naturalScroll(page);
                    } else if (interactionChance < 0.9) { // 10% chance to interact with controls
                        try {
                            const controls = Object.values(videoControlsSelectors);
                            const randomControl = controls[Math.floor(Math.random() * controls.length)];
                            await page.hover(randomControl);
                            await new Promise(r => setTimeout(r, getRandomInt(300, 800)));
                        } catch (controlError) {
                            // Ignore control interaction errors
                        }
                    }
                    
                    await new Promise(r => setTimeout(r, jitterInterval));
                    
                    // Check if video is still playing
                    const isPlaying = await page.evaluate(() => {
                        const video = document.querySelector('video');
                        return video && !video.paused;
                    });
                    
                    if (!isPlaying) {
                        log('Video paused, resuming playback');
                        try {
                            await page.click(videoControlsSelectors.playButton);
                        } catch {
                            await page.click('#movie_player');
                        }
                    }
                }

                await new Promise(r => setTimeout(r, watchTimeMs % jitterInterval));
                botLog('Successfully watched video');
                break;

            default:
                throw new Error(`Invalid mode: ${mode}`);
        }

    } catch (error) {
        log('Error during viewing:', error);
        console.error(error); // Add full error logging
    } finally {
        log('Closing browser');
        if(browser) {
            await browser.close();
        }
    }
};