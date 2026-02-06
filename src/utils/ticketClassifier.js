const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// Simple keyword-based classifier (your original logic)
function classifyTicket(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('bug') || lowerDesc.includes('error')) return 'Technical Issue';
  if (lowerDesc.includes('account') || lowerDesc.includes('login')) return 'Account Issue';
  if (lowerDesc.includes('billing') || lowerDesc.includes('payment')) return 'Billing Issue';
  
  // If no keyword match, use AI for classification
  return classifyWithAI(description);
}

// AI-based classification function
async function classifyWithAI(description) {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',  // Use 'gpt-3.5-turbo' for chat-based if preferred
      prompt: `Classify this support ticket into one of: Technical Issue, Account Issue, Billing Issue, General Inquiry. Provide only the category name. Ticket: "${description}"`,
      max_tokens: 20,  // Keep it short
      temperature: 0.3  // Lower for more consistent results
    });
    const aiCategory = response.data.choices[0].text.trim();
    // Validate AI response against allowed categories
    const validCategories = ['Technical Issue', 'Account Issue', 'Billing Issue', 'General Inquiry'];
    return validCategories.includes(aiCategory) ? aiCategory : 'General Inquiry';
  } catch (error) {
    console.error('AI classification failed:', error.message);
    return 'General Inquiry';  // Safe fallback
  }
}

module.exports = { classifyTicket };