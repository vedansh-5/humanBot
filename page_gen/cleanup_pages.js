const fs = require('fs');
const path = require('path');

async function cleanup() {
    const baseDir = path.resolve(__dirname, '../page_gen/generated_pages');

    const files = fs.readdirSync(baseDir);
    for(const file of files) {
        const fullPath = path.join(baseDir, file);
        fs.unlinkSync(fullPath);
        console.log(`Removed ${file}`);
    }
    console.log('Cleanup of generated pages completed');
}

cleanup().catch(console.error);