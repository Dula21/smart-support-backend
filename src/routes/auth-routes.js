const express = require('express');
const { register, login,getUsers,forgotPassword, resetPassword } = require('../controllers/auth-controller');
const { authenticate } = require('../middleware/auth-middleware');  // Add this import


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticate, getUsers);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;