const Product = require('../models/Products');
const asyncHandler = require('express-async-handler');
const { generateSKU } = require('../utils/skuGenerator'); 
const generateQR = require('../utils/qrGenerator');

// @desc    Add a new product
// @route   POST /api/products
// @access  Private/Admin
const addProduct = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      subcategory,
      size,
      color,
      quantity,
      purchasePrice,
      sellingPrice,
    } = req.body;

    // Validate required fields
    if (!category || !subcategory || quantity === undefined || 
        purchasePrice === undefined || sellingPrice === undefined) {
      res.status(400);
      throw new Error('Missing required fields');
    }

    // Handle size for accessories
    let skuSize = size;
    if (category === 'accessories') {
      skuSize = 'UNI';
    }

    // Generate unique SKU
    const sku = generateSKU(category, skuSize);

    // Generate QR code (add this)
    const qrCodePath = await generateQR(sku); 

    // Create product (add qrCode field)
    const product = await Product.create({
      sku,
      category,
      subcategory,
      ...(category === 'clothing' && { size }),
      color,
      quantity,
      purchasePrice,
      sellingPrice,
      qrCode: qrCodePath // Add QR code path
    });
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: {
        id: product._id,
        sku: product.sku,
        qrCode: product.qrCode,
        category: product.category,
        subcategory: product.subcategory,
        ...(product.size && { size: product.size }), 
        color: product.color,
        quantity: product.quantity,
        price: product.sellingPrice,
        qrCode: product.qrCode
      }
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add product',
      error: error.toString()
    });
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

// @desc    Text search across product fields
// @route   GET /api/products/search
// @access  Private/Admin
const searchProducts = asyncHandler(async (req, res) => {
  try {
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
        { subcategory: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }); // Default sorting by newest
    
    res.json({
      success: true,
      count: products.length,
      products
    });
    
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search products',
      error: error.toString()
    });
  }
});

// @desc    Filter products by specific criteria
// @route   GET /api/products/filter
// @access  Private/Admin
const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { category, subcategory, size, color, sortBy } = req.query;
    
    // Build filter criteria
    const filterCriteria = {};
    
    // Add filters if provided
    if (category) filterCriteria.category = category;
    if (subcategory) filterCriteria.subcategory = subcategory;
    if (size) filterCriteria.size = size;
    if (color) filterCriteria.color = color;

    // Define sort options
    let sortOptions = { createdAt: -1 }; // Default sort
    
    if (sortBy) {
      switch (sortBy) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'price-high-low':
          sortOptions = { sellingPrice: -1 };
          break;
        case 'price-low-high':
          sortOptions = { sellingPrice: 1 };
          break;
        case 'stock-low-high':
          sortOptions = { quantity: 1 };
          break;
        case 'stock-high-low':
          sortOptions = { quantity: -1 };
          break;
      }
    }

    const products = await Product.find(filterCriteria).sort(sortOptions);
    
    res.json({
      success: true,
      count: products.length,
      products
    });
    
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to filter products',
      error: error.toString()
    });
  }
});
// @desc    Get product by SKU
// @route   GET /api/products/sku/:sku
// @access  Private/Admin
const getProductBySKU = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ sku: req.params.sku });
  
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    size,
    color,
    quantity,
    purchasePrice,
    sellingPrice,
    soldCount // Add soldCount from request body
  } = req.body;

  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Update product fields
  product.category = category || product.category;
  product.subcategory = subcategory || product.subcategory;
  product.size = size || product.size;
  product.color = color ?? product.color;
  product.quantity = quantity || product.quantity;
  product.purchasePrice = purchasePrice || product.purchasePrice;
  product.sellingPrice = sellingPrice || product.sellingPrice;

  // Update soldCount if provided, or increment if quantity is reduced
  if (typeof soldCount === 'number') {
    product.soldCount = soldCount;
  } else if (typeof quantity === 'number' && quantity < product.quantity) {
    // If quantity is reduced, increment soldCount by the amount sold
    product.soldCount += (product.quantity - quantity);
  }
  
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
  filterProducts,
  getProductBySKU,
  updateProduct,
  deleteProduct
};