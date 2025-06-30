const Product = require('../models/Products');
const asyncHandler = require('express-async-handler');
const { generateSKU } = require('../utils/skuGenerator'); // You'll create this utility

// @desc    Add a new product
// @route   POST /api/products
// @access  Private/Admin
const addProduct = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    color,
    quantity,
    purchasePrice,
    sellingPrice,
  } = req.body;

  // Generate unique SKU
  const sku = generateSKU(category,size);

  // Create product
  const product = await Product.create({
    sku,
    category,
    size,
    color,
    quantity,
    purchasePrice,
    sellingPrice,
  });

  if (product) {
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: {
        id: product._id,
        sku: product.sku,
        category: product.category,
        size: product.size,
        color:product.color,
        quantity: product.quantity,
        price: product.sellingPrice,
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});



// @desc    Get all products
// @route   GET /api/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private/Admin
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    res.json({
      success: true,
      product
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Private/Admin
const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    category: req.params.category 
  }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Private/Admin
const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }
  
  const products = await Product.find({
    $or: [
      { sku: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { style: { $regex: query, $options: 'i' } },
      { color: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    color,
    quantity,
    purchasePrice,
    sellingPrice
  } = req.body;

  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update product fields
  product.category = category || product.category;
  product.size = size || product.size;
  product.color = color ?? product.color;
  product.quantity = quantity || product.quantity;
  product.purchasePrice = purchasePrice || product.purchasePrice;
  product.sellingPrice = sellingPrice || product.sellingPrice;
  
  const updatedProduct = await product.save();
  
  res.json({
    success: true,
    message: 'Product updated successfully',
    product: updatedProduct
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  await product.deleteOne();
  
  res.json({
    success: true,
    message: 'Product removed'
  });
});

// Export all functions
module.exports = {
  addProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  updateProduct,
  deleteProduct
};