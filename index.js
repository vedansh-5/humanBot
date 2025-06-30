const runViewer = require('./scripts/viewVideo');
const genPages = require('./page_gen/pageGen');
const deploy = require('./page_gen/deploy');
const cleanupPages = require('./page_gen/cleanup_pages');
const cleanupDeploy = require('./page_gen/cleanup_deploy');

const VIEWS_PER_CYCLE = 10000;
const VALID_MODES = ['view', 'watchtime'];

// Add shutdown flag
let isShuttingDown = false;

// Improved shutdown handler
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    isShuttingDown = true;
    // Give time for current operations to finish
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.exit(0);
});

async function generateAndDeploy() {
    try {
        // Generate all pages first
        console.log('Generating all pages...');
        await genPages();
        
        // Then deploy all pages at once
        console.log('Deploying all pages...');
        await deploy();
        
        console.log('✓ Generation and deployment complete');
        return true;
    } catch (error) {
        console.error('Error in generation/deployment:', error);
        return false;
    }
}

async function main() {
    const mode = process.argv[2]?.toLowerCase();
    
    // Validate mode
    if (!mode || !VALID_MODES.includes(mode)) {
        console.error('Invalid mode. Usage: node index.js [view|watchtime]');
        process.exit(1);
    }
    
    console.log(`Starting bot in ${mode.toUpperCase()} mode`);
    
    while (!isShuttingDown) {
        try {
            // Check shutdown flag before major operations
            if (isShuttingDown) break;

            // // Cleanup previous files
            // cleanupPages();
            // cleanupDeploy();
            // First generate and deploy everything
            const setupSuccess = await generateAndDeploy();
            if (!setupSuccess) {
                console.error('Setup failed, retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            // Check shutdown flag before view cycle
            if (isShuttingDown) break;

            // Then start the view cycle
            console.log(`Starting ${mode.toUpperCase()} cycle`);
            for (let i = 1; i <= VIEWS_PER_CYCLE && !isShuttingDown; i++) {
                console.log(`\nView ${i} of ${VIEWS_PER_CYCLE}`);
                await runViewer(mode);
                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000)));
            }

            if (!isShuttingDown) {
                console.log('\n✓ Completed one full cycle');
                console.log('Starting next cycle...\n');
            }
        } catch (error) {
            console.error('Error in main loop:', error);
            if (!isShuttingDown) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

// Start the main loop
main().catch(console.error);