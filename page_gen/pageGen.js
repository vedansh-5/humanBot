import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Load openAI API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load prompts JSON
const prompts = JSON.parse(fs.readFileSync('prompts.json', 'utf-8'));

// Load single video link from a file
const videoData = JSON.parse(fs.readFileSync('video.json', 'utf-8'));
const videoLink = videoData.link;

// Track generated URLs
const urlDatabase = [];

async function generatePages() {
    const outputDir = path.resolve('./page_gen/generated_pages/');
    if(!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for(let i=0; i<prompts.length; i++){
        const { type, prompt } = prompts[i];

        // Inject video link
        const finalPrompt = prompt.replace(/{{VIDEO_LINK}}/g, videoLink);

        try{
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                   { role: 'system', content: 'Return only high-quality HTML. No explanation or markdown.' },
                   { role: 'user', content: finalPrompt }
                ],
                max_tokens: 2000,
                temperature: 0.9,
            });

            const html = response.choices[0].message.content;

            // save HTML file
            const cleanedType = type
            .toLowerCase()
            .replace(/[\s_]+/g, '-')     // spaces/underscores to dashes
            .replace(/[^a-z0-9\-]/g, '') // remove junk
            .replace(/-+/g, '-')         // collapse dashes
            .replace(/^-|-$/g, '');      // trim dashes

            const fileName = `${cleanedType}.html`;
            fs.writeFileSync(path.join(outputDir, fileName), html, 'utf-8');

            // add the deployed url to database
            const deployedURL = `https://your-vercel-site.vercel.app/${fileName}`;
            urlDatabase.push({ name: prompt.type, url: deployedURL });
            console.log(`Generated: ${fileName}`);

        } catch(e){
            console.error(`Error generating ${type}: `, e.message);
        }
    }

    // Save referrer URL list
    fs.writeFileSync(urlFile, JSON.stringify(urlDatabase, null, 2), 'utf-8');
    console.log(`🔗 Saved referrer URLs to ${urlFile}`);
}

generatePages();