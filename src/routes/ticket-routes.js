const express = require('express');
const { getTickets, createTicket, updateTicket, deleteTicket, addComment } = require('../controllers/ticket-controller');
const { authenticate, authorize } = require('../middleware/auth-middleware');
const router = express.Router();

// Get all tickets (admins) or user's tickets (users) - using controller
router.get('/', authenticate, getTickets);

// Submit ticket (users only) - using controller (integrate classification there)
router.post('/', authenticate, authorize(['user']), createTicket);

// Update ticket (e.g., status or details) - using controller
router.put('/:id', authenticate, updateTicket);

// Manual classify ticket (admins only) - using controller
router.put('/:id/classify', authenticate, authorize(['admin']), updateTicket);  // Or create a separate classify function in controller

// Delete ticket (admins only?) - using controller
router.delete('/:id', authenticate, authorize(['admin']), deleteTicket);

// Add comment to ticket - using controller
router.post('/:id/comments', authenticate, addComment);

module.exports = router;