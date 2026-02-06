// Using MongoDB native, so this defines the ticket collection structure
const ticketSchema = {
  title: String,
  description: String,
  status: String, // 'open', 'in-progress', 'closed'
  priority: String, // 'low', 'medium', 'high'
  category: String, // Classified by utils/ticketClassifier.js
  assignedTo: String, // User ID (admin only)
  createdBy: String, // User ID
  createdAt: Date,
  updatedAt: Date,
  comments: [{ userId: String, comment: String, createdAt: Date }], // Array of 
   attachment: String  // New
};

module.exports = { ticketSchema };