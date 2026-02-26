const Bytez = require('bytez.js');
require('dotenv').config();

const key = process.env.BYTEZ_API_KEY;

if (!key) {
  console.warn("⚠️  BYTEZ_API_KEY missing in .env. Keyword fallback active.");
}

const sdk = new Bytez(key);
const model = sdk.model('BAAI/bge-reranker-v2-m3');

const categories = [
  'Technical Issue',
  'Account Issue',
  'Billing Issue',
  'General Inquiry'
];

function classifyWithKeywords(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('bug') || lowerDesc.includes('error') || lowerDesc.includes('broken')) return 'Technical Issue';
  if (lowerDesc.includes('account') || lowerDesc.includes('login') || lowerDesc.includes('password')) return 'Account Issue';
  if (lowerDesc.includes('billing') || lowerDesc.includes('payment') || lowerDesc.includes('invoice')) return 'Billing Issue';
  return 'General Inquiry';
}

async function classifyWithReranker(description) {
  if (!key) return null;

  try {
    const scores = [];

    // FIX: Use for...of to send requests ONE BY ONE to avoid Rate Limits
    for (const category of categories) {
      const res = await model.run({
        text: description,
        text_pair: category
      });

      if (res.error) {
        // If a single request fails, log it and move to the next category
        console.log(`Bytez Status for [${category}]:`, res.error);
        scores.push(-Infinity);
      } else {
        // Correctly parse the score from the [Bytez API Response](https://bytez.com)
        const score = res.output?.[0]?.score ?? res.output?.score ?? res.output ?? 0;
        scores.push(score);
      }
      
      // Optional: Tiny delay to ensure the [Bytez Server](https://bytez.com) is ready for the next call
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const maxScore = Math.max(...scores);
    
    // Fallback if all AI requests were blocked or failed
    if (maxScore === -Infinity) return null;

    const maxScoreIndex = scores.indexOf(maxScore);
    const predictedCategory = categories[maxScoreIndex];
    
    console.log(`✨ AI Classified: [${predictedCategory}] (Top Score: ${maxScore.toFixed(4)})`);
    return predictedCategory;

  } catch (err) {
    console.error('Bytez AI API Error:', err.message);
    return null;
  }
}

async function classifyTicket(description) {
  const rerankerResult = await classifyWithReranker(description);
  
  if (rerankerResult) {
    return rerankerResult;
  }

  console.log('🔄 AI Processing unavailable, using Keyword Fallback...');
  return classifyWithKeywords(description);
}

module.exports = { classifyTicket };
