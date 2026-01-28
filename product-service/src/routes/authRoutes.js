const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { body } = require('express-validator');

// Validation
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
