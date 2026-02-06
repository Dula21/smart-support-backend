const { ObjectId } = require('mongodb');  // Fixed: "onst" -> "const"
const multer = require('multer');
const { classifyTicket } = require('../utils/ticketClassifier');  // Ensure this file exists and exports the async function
const { getDB } = require('../config/db');
const db = getDB();
const nodemailer = require('nodemailer');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

// Email transporter setup
const transporter = nodemailer.createTransport({  // Fixed: createTransport
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.getTickets = async (req, res) => {
  const { status, priority, search } = req.query;
  try {
    const tickets = db.collection('tickets');
    let query = { createdBy: req.user.id };
    if (req.user.role === 'admin') query = {};  // Admins see all
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.$or = [  // Search in title or description
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const userTickets = await tickets.find(query).toArray();
    res.json(userTickets);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.createTicket = [
  upload.single('file'),
  async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    try {
      const { title, description, priority = 'medium' } = req.body;
      if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
      const tickets = db.collection('tickets');
      const category = await classifyTicket(description);  // Now async with AI fallback
      const newTicket = {
        title,
        description,
        status: 'open',
        priority,
        category,
        assignedTo: null,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachment: req.file ? req.file.path : null
      };
      const result = await tickets.insertOne(newTicket);
      console.log('Ticket created:', result.insertedId);
      res.status(201).json({ message: 'Ticket created', ticketId: result.insertedId });
    } catch (error) {
      console.error('Error in createTicket:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const tickets = db.collection('tickets');
    const ticket = await tickets.findOne({ _id: new ObjectId(id) });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Only admins can assign or change status
    if (updates.assignedTo || updates.status) {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    }

    updates.updatedAt = new Date();
    await tickets.updateOne({ _id: new ObjectId(id) }, { $set: updates });

    // Send email notification
    const users = db.collection('users');
    const creator = await users.findOne({ _id: new ObjectId(ticket.createdBy) });
    if (creator) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: creator.email,
        subject: 'Ticket Updated',
        text: `Your ticket "${ticket.title}" has been updated. New status: ${updates.status || ticket.status}.`
      });
    }

    res.json({ message: 'Ticket updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
  // Moved logging inside try for better practice (or remove for security)
  console.log('EMAIL_USER:', process.env.EMAIL_USER);  // Avoid logging pass
};

exports.deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const tickets = db.collection('tickets');
    const query = req.user.role === 'admin' ? { _id: new ObjectId(id) } : { _id: new ObjectId(id), createdBy: req.user.id };
    const result = await tickets.deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Ticket not found or not authorized' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment required' });
  try {
    const tickets = db.collection('tickets');
    const ticket = await tickets.findOne({ _id: new ObjectId(id) });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    await tickets.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: { userId: req.user.id, comment, createdAt: new Date() } } }
    );
    res.json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};