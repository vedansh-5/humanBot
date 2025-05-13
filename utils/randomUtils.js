module.exports.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.getRandomTime = (minSec, maxSec) => {
    return (Math.random() * (maxSec - minSec) + minSec) * 1000;
};

module.exports.getRandomBoolean = (probability = 0.5) => {
    return Math.random() < probability;
};

module.exports.getRandomViewport = async() => {
    return {
        width: Math.floor(Math.random() * (1920 - 1366) + 1366),
        height: Math.floor(Math.random() * (1080 - 768) + 768),
        isMobile: Math.random() > 0.8,
        hasTouch: Math.random() > 0.5, 
    };
}

module.exports.getVideoWatchTime = async (page) => {
    try {
        // Get video duration with retry mechanism
        const duration = await page.evaluate(() => {
            return new Promise((resolve) => {
                const checkDuration = () => {
                    const video = document.querySelector('video');
                    if (video && video.duration && video.duration > 0) {
                        resolve(video.duration);
                    } else {
                        setTimeout(checkDuration, 1000); // Check every second
                    }
                };
                checkDuration();
            });
        });

        // Log the actual duration for debugging
        console.log(`Video duration: ${duration} seconds`);

        // 70% chance to watch full video
        if (module.exports.getRandomBoolean(0.7)) {
            const fullWatchTime = duration;
            console.log(`Selected full watch time: ${fullWatchTime} seconds`);
            return fullWatchTime;
        }

        // For remaining 30%, watch between 30% to 90% of video
        const partialWatchTime = duration * (0.3 + Math.random() * 0.6);
        console.log(`Selected partial watch time: ${partialWatchTime} seconds`);
        return partialWatchTime;
    } catch (error) {
        console.error('Error in getVideoWatchTime:', error);
        // Fallback to a reasonable default if something goes wrong
        return 300; // 5 minutes default
    }
};