const Bytez = require('bytez.js');
require('dotenv').config();

// Initialize Bytez SDK
const key = process.env.BYTEZ_API_KEY;  // Use env var for security
const sdk = new Bytez(key);
const model = sdk.model('BAAI/bge-reranker-v2-m3');

// Predefined categories as passages for reranking
const categories = [
  'Technical Issue',  // E.g., bugs, errors
  'Account Issue',    // E.g., login, password
  'Billing Issue',    // E.g., payments, invoices
  'General Inquiry'   // Default/fallback
];

// Simple keyword-based classifier (fallback)
function classifyWithKeywords(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('bug') || lowerDesc.includes('error')) return 'Technical Issue';
  if (lowerDesc.includes('account') || lowerDesc.includes('login')) return 'Account Issue';
  if (lowerDesc.includes('billing') || lowerDesc.includes('payment')) return 'Billing Issue';
  return 'General Inquiry';
}

// Reranker-based classification
async function classifyWithReranker(description) {
  try {
    // Run the model: description as query, categories as passages
    const { error, output } = await model.run({
      query: description,
      passages: categories
    });

    if (error) throw new Error(error);

    // Output is an array of scores (one per category)
    // Find the index of the highest score
    const maxScoreIndex = output.scores.indexOf(Math.max(...output.scores));
    const predictedCategory = categories[maxScoreIndex];

    // Optional: Log scores for debugging
    console.log('Reranker scores:', output.scores, 'Predicted:', predictedCategory);

    return predictedCategory;
  } catch (err) {
    console.error('Reranker classification failed:', err.message);
    return null;  // Fall back to keywords
  }
}

// Main classification function
async function classifyTicket(description) {
  // First, try reranker
  const rerankerResult = await classifyWithReranker(description);
  if (rerankerResult) return rerankerResult;

  // Fallback to keywords if reranker fails
  return classifyWithKeywords(description);
}

module.exports = { classifyTicket };