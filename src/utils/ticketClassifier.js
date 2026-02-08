const OpenAI = require('openai');  // Updated import: No more Configuration
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });  // Direct initialization

// Simple keyword-based classifier (your original logic)
function classifyTicket(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('bug') || lowerDesc.includes('error')) return 'Technical Issue';
  if (lowerDesc.includes('account') || lowerDesc.includes('login')) return 'Account Issue';
  if (lowerDesc.includes('billing') || lowerDesc.includes('payment')) return 'Billing Issue';
  
  // If no keyword match, use AI for classification
  return classifyWithAI(description);
}

// AI-based classification function using chat completions
async function classifyWithAI(description) {
  try {
    const response = await openai.chat.completions.create({  // Updated API call
      model: 'gpt-3.5-turbo',  // Use chat model for better results
      messages: [
        { role: 'system', content: 'You are a helpful assistant that classifies support tickets.' },
        { role: 'user', content: `Classify this support ticket into one of: Technical Issue, Account Issue, Billing Issue, General Inquiry. Provide only the category name. Ticket: "${description}"` }
      ],
      max_tokens: 20,
      temperature: 0.3
    });
    const aiCategory = response.choices[0].message.content.trim();
    // Validate AI response against allowed categories
    const validCategories = ['Technical Issue', 'Account Issue', 'Billing Issue', 'General Inquiry'];
    return validCategories.includes(aiCategory) ? aiCategory : 'General Inquiry';
  } catch (error) {
    console.error('AI classification failed:', error.message);
    return 'General Inquiry';  // Safe fallback
  }
}

module.exports = { classifyTicket };