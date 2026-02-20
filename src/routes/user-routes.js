const express = require('express');
const { getAdmins } = require('../controllers/user-controller');
const { authenticate, authorize } = require('../middleware/auth-middleware');
const router = express.Router();

router.get('/admins', authenticate, authorize(['admin']), getAdmins);  // Only admins can fetch admins

module.exports = router;