const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/authController');
// const { protect, admin } = require('../middleware/authMiddleWare');

router.post('/login',loginAdmin);

module.exports = router;