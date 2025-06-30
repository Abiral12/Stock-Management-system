const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Static admin credentials
const STATIC_ADMIN = {
  email: process.env.EMAIL,
  passwordHash:  bcrypt.hashSync(process.env.PASSWORD, 10)
};

// @desc    Authenticate admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check against static admin credentials
  if (email !== STATIC_ADMIN.email) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, STATIC_ADMIN.passwordHash);
  
  if (passwordMatch) {
    res.json({
      success: true,
      email: STATIC_ADMIN.email,
      token: generateToken()
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});
// Generate JWT
const generateToken = () => {
  return jwt.sign({ 
    id: 'static-admin-id',
    email: STATIC_ADMIN.email
  }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  loginAdmin
};