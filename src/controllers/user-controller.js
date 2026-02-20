const { getDB } = require('../config/db');
const db = getDB();

exports.getAdmins = async (req, res) => {
  try {
    // Only allow admins to fetch admin list
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    
    const users = db.collection('users');
    const admins = await users.find({ role: 'admin' }, { projection: { _id: 1, name: 1 } }).toArray();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};