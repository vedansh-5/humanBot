const { launchBrowser } = require('../core/browserManager');
const { simulateMouseActivity, jitterMouse, naturalScroll } = require('../core/humanSImulator');
const { log } = require('../core/logger');
const { getRandomTime, getVideoWatchTime } = require('../utils/randomUtils');
const { videoUrl, jitterInterval } = require('../config/config');
const UserAgent  = require('user-agents');

const videoControlsSelectors = {
    progressBar: '.ytp-progress-bar-container',
    playButton: '.ytp-play-button',
    volumeButton: '.ytp-mute-button',
    settingsButton: '.ytp-settings-button'
};

module.exports = async function runViewer() {
    log('launching browser');
    const browser = await launchBrowser();
    const page = await browser.newPage();

    try {
        // Set a random user agent for this page
        const userAgent = new UserAgent().toString();
        await page.setUserAgent(userAgent);
        log(`Set user Agent: ${userAgent}`);

        log(`Opening video ${videoUrl}`);
        await page.goto(videoUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    
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
    } catch (error) {
        log('Error during viewing: ', error);
        console.error(error); // Add full error logging
    } finally {
        log('Closing browser');
        await browser.close();
    }
};