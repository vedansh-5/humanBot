const fs = require('fs');
const path = require('path');

async function cleanupPages() {
    const baseDir = path.resolve(__dirname, '../page_gen/generated_pages');

    const files = fs.readdirSync(baseDir);
    for(const file of files) {
        const fullPath = path.join(baseDir, file);
        fs.unlinkSync(fullPath);
        console.log(`Removed ${file}`);
    }
    console.log('Cleanup of generated pages completed');
}

cleanupPages().catch(console.error);