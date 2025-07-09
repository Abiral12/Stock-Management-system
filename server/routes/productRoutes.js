const express = require('express');
const router = express.Router();
const { 
  addProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  updateProduct,
  deleteProduct,
  getProductBySKU,
} = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');
const { protect, admin } = require('../middleware/authMiddleWare');

// POST /api/products - Add new product
router.post('/add-product', protect, admin,validateProduct, addProduct);
router.get('/', protect, admin, getProducts);
router.get('/search', protect, admin, searchProducts);
router.get('/filter',protect, admin, filterProducts);
router.get('/:id', protect, admin, getProductById);
router.get('/category/:category', protect, admin, getProductsByCategory);
router.put('/edit/:id', protect, admin, validateProduct, updateProduct);
router.delete('/delete/:id', protect, admin, deleteProduct);
router.get('/sku/:sku', protect, admin, getProductBySKU);


module.exports = router;