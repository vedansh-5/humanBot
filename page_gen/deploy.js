const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function deploy() {
    const srcDir = path.resolve(__dirname, 'generated_pages');
    const deployDir = path.resolve(__dirname, 'vercel_deploy');

    // Ensure source directory exists
    if (!fs.existsSync(srcDir)) {
        console.log('Creating source directory:', srcDir);
        fs.mkdirSync(srcDir, { recursive: true });
        return; // Exit if no files to deploy yet
    }

    // Clean and create deploy directory
    if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true });
    }
    fs.mkdirSync(deployDir, { recursive: true });

    // Copy files
    const files = fs.readdirSync(srcDir);
    console.log(`Found ${files.length} files to deploy`);
    
    for (const file of files) {
        const srcPath = path.join(srcDir, file);
        // Skip if directory
        if (fs.statSync(srcPath).isDirectory()) continue;
        
        const content = fs.readFileSync(srcPath, 'utf-8');
        fs.writeFileSync(path.join(deployDir, file), content);
    }

    // Write vercel config
    fs.writeFileSync(
        path.join(deployDir, 'vercel.json'),
        JSON.stringify({
            rewrites: [{ source: "/(.*)", destination: "/$1.html" }],
            cleanUrls: false
        }, null, 2)
    );

    // Deploy
    console.log('Deploying to Vercel...');
    let deploymentUrl;
    try {
        const output = execSync(`cd ${deployDir} && vercel --prod --confirm`, { 
            stdio: 'inherit'
        });
        console.log('Deployment complete!');
        
        // Extract deployment URL from Vercel output
        const urlMatch = output.toString().match(/https?:\/\/[^ ]+/);
        deploymentUrl = urlMatch ? urlMatch[0] : null;
    } catch (error) {
        console.error('Deployment failed:', error.message);
        return;
    }

    // After successful deployment, save the deployment info
    const deploymentInfo = {
        baseUrl: deploymentUrl,
        timestamp: new Date().toISOString(),
        pages: urlDatabase.map(page => ({
            ...page,
            fullUrl: `${deploymentUrl}/${page.url}`
        }))
    };

    fs.writeFileSync(
        path.join(__dirname, 'deployment_info.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('Deployment URLs saved to deployment_info.json');
}

module.exports = deploy;