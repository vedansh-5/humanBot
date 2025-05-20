const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

// List of valid OpenAI models
const VALID_MODELS = ['gpt-3.5-turbo', 'gpt-4'];
const DEFAULT_MODEL = 'gpt-3.5-turbo';

async function generatePages() {
    // Validate OpenAI configuration
    const model = VALID_MODELS.includes(process.env.OPENAI_MODEL) 
        ? process.env.OPENAI_MODEL 
        : DEFAULT_MODEL;
    
    console.log(`Using OpenAI model: ${model}`);
    
    const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY
    });

    // Read and validate video data
    const videoJsonPath = path.join(__dirname, 'video.json');
    if (!fs.existsSync(videoJsonPath)) {
        throw new Error('video.json not found in: ' + videoJsonPath);
    }

    try {
        const videoData = JSON.parse(fs.readFileSync(videoJsonPath, 'utf-8'));
        if (!Array.isArray(videoData) || !videoData.length) {
            throw new Error('video.json must contain an array with at least one video entry');
        }

        const { videoId, videoUrl, title } = videoData[0];
        const videoTitle = title || 'Featured Video';

        const outputDir = path.join(__dirname, 'generated_pages');
        if(!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf-8'));
        const urlDatabase = [];

        for (const prompt of prompts) {
            try {
                console.log(`Generating page from prompt...`);
                
                const finalPrompt = prompt.prompt.replace(/{{VIDEO_LINK}}/g, videoUrl)
                    .replace(/{{VIDEO_TITLE}}/g, videoTitle)
                    .replace(/{{VIDEO_ID}}/g, videoId);

                const response = await openai.chat.completions.create({
                    model: model, // Use validated model
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a web page generator. Create engaging, natural-looking pages that incorporate the video link organically. Include proper HTML structure and Tailwind CSS and no markdown or comments.'
                        },
                        { role: 'user', content: finalPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                });

                // Add tracking script
                const trackingScript = `
                <script>
                    window.addEventListener('load', () => {
                        fetch('/api/logVisit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                page: location.pathname,
                                video: new URLSearchParams(location.search).get('v'),
                                ts: new Date().toISOString()
                            })
                        }).catch(console.error);
                    });
                </script>`;

                let html = response.choices[0].message.content;
                html = html.replace('</body>', `${trackingScript}\n</body>`);

                // Generate filename from prompt index
                const fileName = `page-${urlDatabase.length + 1}.html`;
                fs.writeFileSync(path.join(outputDir, fileName), html);

                urlDatabase.push({
                    name: `Generated Page ${urlDatabase.length + 1}`,
                    url: `${fileName}?v=${videoId}`
                });

                console.log(`✓ Generated: ${fileName}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit delay
            } catch (error) {
                console.error('Error generating page:', error.message);
            }
        }

        // Save URL database
        fs.writeFileSync(
            path.join(outputDir, 'referrer_urls.json'),
            JSON.stringify(urlDatabase, null, 2)
        );

        console.log(`\n✓ Generated ${urlDatabase.length} pages`);
        return urlDatabase;
    } catch (error) {
        console.error('Failed to generate pages:', error);
        throw error;
    }
}

// Fix the export to not immediately execute
module.exports = generatePages;