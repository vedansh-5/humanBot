const { getRandomInt } = require('../utils/randomUtils');


// Helper function to create bexier curve points for mouse movements
function createBezierPath(startPoint, endPoint){
    const midPoint1 = {
        x: startPoint.x + (endPoint.x - startPoint.x) * (0.2 + Math.random() * 0.2),
        y: startPoint.y + (endPoint.y - startPoint.y) * (0.2 + Math.random() * 0.2)
    };
    const midPoint2 = {
        x: startPoint.x + (endPoint.x - startPoint.x) * (0.6 + Math.random() * 0.2),
        y: startPoint.y + (endPoint.y - startPoint.y) * (0.6 + Math.random() * 0.2)
    };
    return [startPoint, midPoint1, midPoint2, endPoint];
};

// calculate point on the bezier curve 
function getBezierXY(t, points) {
    const [p0, p1, p2, p3] = points;
    const cX = 3 * (p1.x - p0.x);
    const bX = 3 * (p2.x - p1.x) - cX;
    const aX = p3.x - p0.x - cX - bX;
    const cY = 3 * (p1.y - p0.y);
    const bY = 3 * (p2.y - p1.y) - cY;
    const aY = p3.y - p0.y - cY - bY;

    const x = (aX * Math.pow(t,3)) + (bX * Math.pow(t,2)) + (cX * t) + p0.x;
    const y = (aY * Math.pow(t,3)) + (bY * Math.pow(t,2)) + (cY * t) + p0.y;
    return { x: Math.floor(x), y: Math.floor(y) };
}

async function humanizedMouseMove(page, start, end) {
    const bezierPoints = createBezierPath(start, end);
    const steps = getRandomInt(25,35); 

    for(let i=0; i<=steps; i++){
        const t = i / steps;
        const point = getBezierXY(t, bezierPoints);

        // Add slight random deviation to simulate human imperfection
        point.x += Math.random() * 2 -1 ;
        point.y += Math.random() * 2 - 1;

        await page.mouse.move(point.x, point.y);

        // variable speed movement
        const delay = Math.random() * 5 + (i === steps ? 10 : 5);
        await new Promise(r => setTimeout(r, delay));
    }
}


module.exports.simulateMouseActivity = async (page) => {
    const boxes = await page.$$('ytd-thumbnail');
    for(let i=0; i< Math.min(3, boxes.length); i++) {
        const box = boxes[i];
        const boxBounding = await box.boundingBox();
        if(!boxBounding) continue;

        // Get current mouse position
        const currentPosition = await page.evaluate(() => ({
            x: window.mouseX || 0,
            y: window.mouseY || 0
        }));

        // Target position within the thumbnail
        const targetX = boxBounding.x + getRandomInt(10, boxBounding.width - 10);
        const targetY = boxBounding.y + getRandomInt(10, boxBounding.height - 10);

        // Perform humanized mouse movement
        await humanizedMouseMove(page, currentPosition, { x: targetX, y: targetY});

        // hover effect with slight movement
        const hoverTime = getRandomInt(1000, 2500);
        const startTime = Date.now();

        while(Date.now() - startTime < hoverTime) {
            // slight jitter while hovering
            await page.mouse.move(
                targetX + (Math.random() * 6 - 3 ),
                targetY + (Math.random() * 6 - 3 ),
                { steps: 1 }
            );
            await new Promise(r => setTimeout(r,100));
        }
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

    // Get current mouse position
    const currentPosition = await page.evaluate(() => ({
        x: window.mouseX || 0,
        y: window.mouseY || 0
    }));

    // Generate random target within viewport
    const targetPosition = {
        x: getRandomInt(0,viewport.width),
        y: getRandomInt(0, viewport.height)
    };

    // use humanized movement
    await humanizedMouseMove(page, currentPosition, targetPosition);
};

// Add more natural scrolling behaviour
module.exports.naturalScroll = async (page) => {
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    let currentScroll = 0;

    while (currentScroll < scrollHeight - viewportHeight) {
        const scrollAmount = getRandomInt(100, 300);
        currentScroll += scrollAmount;
        
        await page.evaluate((amount) => {
            window.scrollBy({
                top: amount,
                behavior: 'smooth'
            });
        }, scrollAmount);

        // Random pause between scrolls
        await new Promise(r => setTimeout(r, getRandomInt(500, 1500)));
    }
};