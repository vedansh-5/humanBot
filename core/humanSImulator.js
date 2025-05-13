const { getRandomInt } = require('../utils/randomUtils');

module.exports.simulateMouseActivity = async (page) => {
    const boxes = await page.$$('ytd-thumbnail');
    for(let i=0; i< Math.min(3, boxes.length); i++) {
        const box = boxes[i];
        const boxBounding = await box.boundingBox();
        if(!boxBounding) continue;
        await page.mouse.move(
            boxBounding.x + getRandomInt(0, boxBounding.width),
            boxBounding.y + getRandomInt(0, boxBounding.height),
            { steps: 15 }
        );
        await new Promise(r => setTimeout(r, getRandomInt(1000, 2500)));
    }
};

module.exports.jitterMouse = async (page) => {
    const viewport = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    }));
    
    if(!viewport){
        console.error("Viewport not available");
        return;
    }

    const { width, height } = viewport;
    await page.mouse.move(
        getRandomInt(0, width),
        getRandomInt(0, height),
        { steps: 20 }
    );
};