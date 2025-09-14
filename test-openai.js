// Test OpenAI API connection
require('dotenv').config();

const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🔍 Testing OpenAI API connection...');
  
  // Check if API key exists
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('📝 Please create a .env file with:');
    console.log('OPENAI_API_KEY=your_actual_api_key_here');
    return;
  }

  if (apiKey === 'your_openai_api_key_here') {
    console.error('❌ Please replace the placeholder API key with your actual OpenAI API key');
    return;
  }

  console.log('✅ API key found:', apiKey.substring(0, 10) + '...');

  try {
    const openai = new OpenAI({ apiKey });
    
    console.log('🚀 Testing API call...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'API connection successful'"
        }
      ],
      max_tokens: 50
    });

    console.log('✅ OpenAI API connection successful!');
    console.log('📝 Response:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    if (error.code === 'invalid_api_key') {
      console.log('💡 Please check your API key is correct');
    } else if (error.code === 'insufficient_quota') {
      console.log('💡 Please check your OpenAI account has sufficient credits');
    } else {
      console.log('💡 Please check your internet connection and try again');
    }
  }
}

testOpenAI();
