const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.json({
    success: true,
    username: admin.username,
    token: generateToken(admin._id, admin.username),
  });
});

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { loginAdmin };