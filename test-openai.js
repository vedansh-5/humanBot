require('dotenv').config();
const { OpenAI } = require('openai');

async function testOpenAI() {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        console.log('Testing OpenAI connection...');
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hello' }]
        });

        console.log('✓ OpenAI connection successful');
        console.log('Response:', response.choices[0].message.content);
    } catch (error) {
        console.error('❌ OpenAI test failed:', error.message);
    }
}

testOpenAI();