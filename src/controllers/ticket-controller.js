const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const { classifyTicket } = require('../utils/ticketClassifier');
const { getDB } = require('../config/db');
const db = getDB();
const nodemailer = require('nodemailer');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.getTickets = async (req, res) => {
  const { status, priority, search } = req.query;

  try {
    const tickets = db.collection('tickets');
    const users = db.collection('users');
    const currentUserId = new ObjectId(req.user.id);

    let query = {};

    if (req.user.role === 'admin') {
      // ADMIN RULE: See tickets I created OR tickets assigned to me
      query.$or = [
        { createdBy: currentUserId },
        { assignedTo: currentUserId }
      ];
    } else {
      // USER RULE: Only see tickets I created
      query.createdBy = currentUserId;
    }

    // Apply Additional Filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      // If query already has keys (like $or or status), wrap in $and
      query = { $and: [query, searchFilter] };
    }

    const userTickets = await tickets.find(query).toArray();

    for (let ticket of userTickets) {
      // Get Client/Creator Info
      if (ticket.createdBy) {
        const creator = await users.findOne({ _id: new ObjectId(ticket.createdBy) });
        ticket.creatorInfo = creator ? { name: creator.name, email: creator.email } : { name: 'Deleted User' };
      }
      
      // Get Assigned Specialist Info
      if (ticket.assignedTo) {
        const admin = await users.findOne({ _id: new ObjectId(ticket.assignedTo) });
        ticket.assignedAdminName = admin ? admin.name : 'Unknown Admin';
      }
    }

    res.json(userTickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const tickets = db.collection('tickets');
    const users = db.collection('users');
    
    const ticket = await tickets.findOne({ _id: new ObjectId(id) });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.createdBy) {
      const creator = await users.findOne({ _id: new ObjectId(ticket.createdBy) });
      ticket.creatorInfo = creator ? { name: creator.name, email: creator.email } : null;
    }

    if (ticket.assignedTo) {
      const admin = await users.findOne({ _id: new ObjectId(ticket.assignedTo) });
      ticket.assignedAdminName = admin ? admin.name : 'Unassigned';
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTicket = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, description, priority = 'medium', assignedTo } = req.body;
      if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
      
      const tickets = db.collection('tickets');
      const category = await classifyTicket(description);
      const attachment = req.file ? req.file.filename : null;

      const newTicket = {
        title,
        description,
        status: 'open',
        priority,
        category,
        comments: [],
        assignedTo: assignedTo ? new ObjectId(assignedTo) : null,
        createdBy: new ObjectId(req.user.id),
        createdAt: new Date(),
        updatedAt: new Date(),
        attachment: attachment
      };
      
      const result = await tickets.insertOne(newTicket);
      res.status(201).json({ message: 'Ticket created', ticketId: result.insertedId });
    } catch (error) {
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

    if (updates.assignedTo || updates.status) {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    }

    if (updates.assignedTo) {
      updates.assignedTo = new ObjectId(updates.assignedTo);
    }

    updates.updatedAt = new Date();
    await tickets.updateOne({ _id: new ObjectId(id) }, { $set: updates });

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const tickets = db.collection('tickets');
    const query = req.user.role === 'admin' 
      ? { _id: new ObjectId(id) } 
      : { _id: new ObjectId(id), createdBy: new ObjectId(req.user.id) };
      
    const result = await tickets.deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Ticket not found or not authorized' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await tickets.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: { userId: new ObjectId(req.user.id), comment, createdAt: new Date() } } }
    );
    res.json({ message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const tickets = db.collection('tickets');
    const ticket = await tickets.findOne({ _id: new ObjectId(id) });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket.comments || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
