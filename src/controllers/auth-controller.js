const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const db = getDB();
const crypto = require('crypto');

const nodemailer = require('nodemailer');
// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const users = db.collection('users');
  const user = await users.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  await users.updateOne({ _id: user._id }, { $set: { resetToken, resetTokenExpiry: Date.now() + 3600000 } });

  // Send email (comment out if email is disabled)
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `Reset token: ${resetToken}`
  });
  res.json({ message: 'Reset email sent' });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const users = db.collection('users');
  const user = await users.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await users.updateOne({ _id: user._id }, { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });
  res.json({ message: 'Password reset' });
};

exports.register = async (req, res) => {
  console.log('req.body:', req.body);
  const { name, email, password, role = 'user' } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  try {
    const db = getDB();
    const users = db.collection('users');
    const existingUser = await users.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, role, createdAt: new Date() };
    const result = await users.insertOne(newUser);
    res.status(201).json({ message: 'User registered', userId: result.insertedId });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }

  

};

exports.getUsers = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const users = db.collection('users');
    const allUsers = await users.find({}).project({ password: 0 }).toArray();  // Exclude passwords for security
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
