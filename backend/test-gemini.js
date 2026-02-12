const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Say hello in one sentence.";
        console.log('Sending prompt:', prompt);

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log('Response received:', response);
        console.log('\n✅ Gemini API is working!');
    } catch (error) {
        console.error('❌ Gemini API Error:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
}

testGemini();
