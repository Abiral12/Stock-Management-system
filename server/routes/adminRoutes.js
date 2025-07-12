const express = require('express');
const router = express.Router();
const { loginAdmin, updateAdminProfile, updateAdminUsername, updateAdminPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleWare');

router.post('/login',loginAdmin);
router.put('/profile', protect, updateAdminProfile);
router.put('/update-username', protect, updateAdminUsername);
router.put('/update-password', protect, updateAdminPassword);

module.exports = router;