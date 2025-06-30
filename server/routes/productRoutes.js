const express = require('express');
const router = express.Router();
const { 
  addProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
   updateProduct,
  deleteProduct
} = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');
const { protect, admin } = require('../middleware/authMiddleWare');

// POST /api/products - Add new product
router.post('/add-product', protect, admin, validateProduct, addProduct);
router.get('/', protect, admin, getProducts);
router.get('/:id', protect, admin, getProductById);
router.get('/category/:category', protect, admin, getProductsByCategory);
router.get('/search', protect, admin, searchProducts);
router.put('/edit/:id', protect, admin, validateProduct, updateProduct);
router.delete('/delete/:id', protect, admin, deleteProduct);


module.exports = router;