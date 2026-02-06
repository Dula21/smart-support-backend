// Simple keyword-based classifier
function classifyTicket(description) {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('bug') || lowerDesc.includes('error')) return 'Technical Issue';
  if (lowerDesc.includes('account') || lowerDesc.includes('login')) return 'Account Issue';
  if (lowerDesc.includes('billing') || lowerDesc.includes('payment')) return 'Billing Issue';
  return 'General Inquiry';
}

module.exports = { classifyTicket };