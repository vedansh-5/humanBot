import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { rewriteError } from 'puppeteer';

const srcDir = path.resolve('generated_pages');
const deployDir = path.resolve('vercel_deploy');

if (fs.existsSync(deployDir)) fs.rmSync(deployDir, {recursive: true});
fs.mkdirSync(deployDir);

const files = fs.readdirSync(srcDir);
for( const file of files) {
    const html = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    fs.writeFileSync(path.join(deployDir, file), html );
}

fs.writeFileSync(path.join(deployDir, 'vercel.json'), JSON.stringify({
    rewrites: [{ source: "/(.*)", destination: "/$1.html" }],
    cleanUrls: false
}, null, 2));

// deploy
execSync(`cd ${deployDir} && vercel --prod --confirm`, { stdio: 'inherit' });