const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function cleanup() {
    const baseDir = path.resolve(__dirname, '../page_gen/deployed');
    
    // Remove old vercel deployment directories
    const dirs = fs.readdirSync(baseDir);
    for (const dir of dirs) {
        if (dir.startsWith('vercel_deploy_')) {
            const fullPath = path.join(baseDir, dir);
            execSync(`vercel remove ${dir} --yes`, { stdio: 'inherit' }); // Remove vercel deployement
            fs.rmSync(fullPath, { recursive: true, force: true }); // Remove local folder
            console.log(`Removed ${dir}`);
        }
    }

    // Remove old deployment url files
    const filesToRemove = [
        'deployement_url.json',
        'deployement_urls.json'
    ];

    for (const file of filesToRemove) {
        const filePath = path.join(baseDir, file);
        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Removed ${file}`);
        }
    }

    console.log('Deployment cleanup complete');
}

cleanup().catch(console.error);