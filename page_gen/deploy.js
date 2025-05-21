const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deploy() {
    const srcDir = path.resolve(__dirname, 'generated_pages');
    const deployementUrlsFile = path.resolve(__dirname, 'deployement_urls.json');
    const deployementUrls = [];

    // Read all HTML files
    const files = fs.readdirSync(srcDir)
    .filter(file => file.endsWith('.html'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
    });

    for (const file of files) {
        const pageName = path.basename(file, '.html');
        const deployDir = path.resolve(__dirname, `deployed/vercel_deploy_${pageName}`);

        console.log(`Deploying ${file}..`);

        // Create deploy directory
        fs.mkdirSync(deployDir, { recursive: true });

        // Copy the HTML file
        fs.copyFileSync(
            path.join(srcDir, file),
            path.join(deployDir, 'index.html')
        );

        // Create vercel.json
        const vercelConfig = {
            "version": 2,
            "builds": [
                { "src": "*.html", "use": "@vercel/static" }
            ],
            "routes": [
                { "src": "/(.*)", "dest": "/index.html" }
            ]
        };

        fs.writeFileSync(
            path.join(deployDir, 'vercel.json'),
            JSON.stringify(vercelConfig, null, 2)
        );

        try{
            // Deploy this page
            console.log(`Deploying ${pageName}`);
            const output = execSync(`cd "${deployDir}" && vercel deploy --prod --yes`, {
                stdio: 'pipe',
                encoding: 'utf-8'
            });

            // Extract deployement URL
            const deployUrl = output.match(/(?:Production|Deployment).*?(https:\/\/[^\s]+\.vercel\.app)/i)?.[1];
            if(deployUrl) {
                deployementUrls.push({
                    page: pageName,
                    url: deployUrl
                });
                console.log(`Deployed ${pageName} to ${deployUrl}`);
            }

            // Wait a bit between deployements
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch(error) {
            console.error(`Failed to deploy ${pageName}: `, error.message);
        }
    }

    // Save all deployement URLs

    fs.writeFileSync(deployementUrlsFile, JSON.stringify(deployementUrls, null, 2));
    console.log(`\n Saved ${deployementUrls.length} deployement URLs to deployement_urls.json`);

    // Update referrer URLs file
    fs.writeFileSync(
        path.join(srcDir, 'referrer_urls.json'),
        JSON.stringify(deployementUrls, null, 2)
    );
    console.log('Updated referrer_urls.json');
}

module.exports = deploy;
deploy();