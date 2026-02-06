const express = require('express');
const { getTickets, createTicket, updateTicket, deleteTicket,addComment } = require('../controllers/ticket-controller');
const { authenticate } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', authenticate, getTickets);
router.post('/', authenticate, createTicket);
router.put('/:id', authenticate, updateTicket);
router.delete('/:id', authenticate, deleteTicket);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;