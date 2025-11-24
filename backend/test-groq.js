require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    console.log('API Key exists:', !!process.env.GROQ_API_KEY);
    console.log('Testing Groq connection...');
    
    const message = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in one sentence' }],
      model: 'llama-3.3-70b-versatile' // This one works!
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', message.choices[0].message.content);
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Error:', error.message);
  }
}

test();
