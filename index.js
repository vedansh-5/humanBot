const runViewer = require('./scripts/viewVideo');
const genPages = require('./page_gen/pageGen');
const deploy = require('./page_gen/deploy');
const { getViewCount, incrementViewCount } = require('./utils/counter');

const GENERATION_INTERVAL = 10000; // generate and deploy pages every 10000 views

async function main() {
    try {
        // Increment view count first
        const newCount= incrementViewCount();
        console.log(`View Count: ${newCount}`);

        // Check if we need to generate and deploy new pages
        if( newCount % GENERATION_INTERVAL === 0) {
            console.log('Generating new pages');
            await genPages();

            console.log('Deploying pages');
            deploy();
        }

        // Run the viewer
        console.log("Running viewer");
        await runViewer();
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();