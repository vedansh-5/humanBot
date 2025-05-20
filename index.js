const runViewer = require('./scripts/viewVideo');
const genPages = require('./page_gen/pageGen');
const deploy = require('./page_gen/deploy');

const VIEWS_PER_CYCLE = 10000;

async function generateAndDeploy() {
    try {
        console.log('Generating new pages...');
        await genPages();
        
        console.log('Deploying pages...');
        await deploy();
        
        console.log('✓ Generation and deployment complete');
    } catch (error) {
        console.error('Error in generation/deployment:', error);
        process.exit(1); // Exit if initial setup fails
    }
}

async function runViewCycle() {
    try {
        for (let i = 1; i <= VIEWS_PER_CYCLE; i++) {
            console.log(`\nView ${i} of ${VIEWS_PER_CYCLE}`);
            await runViewer();
            // Add small delay between views
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error in view cycle:', error);
    }
}

async function main() {
    while (true) { // Infinite loop - will need manual interruption
        try {
            // Generate and deploy first
            await generateAndDeploy();
            
            // Then run viewer 10000 times
            await runViewCycle();
            
            console.log('\n✓ Completed one full cycle');
            console.log('Starting next cycle...\n');
            
        } catch (error) {
            console.error('Error in main loop:', error);
            // Wait 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    process.exit(0);
});

main();