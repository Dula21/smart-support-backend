const { getDB } = require('../config/db');

exports.getAdmins = async (req, res) => {
  try {
    const db = getDB(); // Get the active DB connection
    const users = db.collection('users');
    
    // Find everyone with the role 'admin'
    const admins = await users.find({ role: 'admin' })
      .project({ password: 0, email: 0 }) // Hide sensitive info
      .toArray();
      
    res.json(admins);
  } catch (error) {
    console.error('getAdmins Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
