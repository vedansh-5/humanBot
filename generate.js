const genPages = require('./page_gen/pageGen');
const deploy = require('./page_gen/deploy');

async function generateOnly() {
    try {
        console.log('Generating pages...');
        await genPages();
        console.log('Deploying pages...');
        deploy();
    } catch (error) {
        console.error('Error:', error);
    }
}

generateOnly();