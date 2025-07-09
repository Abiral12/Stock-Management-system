require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // or '*'
  credentials: true,
}));


app.use(express.json());
app.use(express.static('public'));
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});