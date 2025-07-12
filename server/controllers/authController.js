const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Define generateToken at the top so it is available to all controllers
const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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

const updateAdminProfile = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const { currentPassword, newUsername, newPassword } = req.body;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  // Verify current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  // Update username if provided and different
  if (newUsername && newUsername !== admin.username) {
    admin.username = newUsername;
  }

  // Update password if provided
  if (newPassword) {
    admin.password = newPassword;
  }

  await admin.save();
  const newToken = generateToken(admin._id, admin.username);
  res.json({ 
    success: true, 
    message: 'Profile updated successfully', 
    username: admin.username,
    token: newToken
  });
});

const updateAdminUsername = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const { currentPassword, newUsername } = req.body;

  if (!newUsername) {
    return res.status(400).json({ success: false, message: 'New username is required' });
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  // Verify current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  if (newUsername === admin.username) {
    return res.status(400).json({ success: false, message: 'New username must be different' });
  }

  admin.username = newUsername;
  await admin.save();
  const newToken = generateToken(admin._id, admin.username);
  res.json({
    success: true,
    message: 'Username updated successfully',
    username: admin.username,
    token: newToken
  });
});

const updateAdminPassword = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    });
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  // Verify current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      message: 'Current password is incorrect' 
    });
  }

  // Check if new password is same as current
  const isSamePassword = await admin.comparePassword(newPassword);
  if (isSamePassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'New password must be different from current password' 
    });
  }

  admin.password = newPassword;
  await admin.save();
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});


module.exports = { loginAdmin, updateAdminProfile, updateAdminUsername, updateAdminPassword };