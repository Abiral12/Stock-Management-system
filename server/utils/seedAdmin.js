// server/utils/seedAdmin.js
const Admin = require('../models/Admin');

async function seedAdmin() {
  const existing = await Admin.findOne();
  if (!existing) {
    await Admin.create({
      username: 'admin', // or any username you want
      password: 'admin123', // will be hashed
    });
    console.log('Admin user created');
  }
}

module.exports = seedAdmin;
