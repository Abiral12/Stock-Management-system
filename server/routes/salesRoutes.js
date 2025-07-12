const express = require('express');
const router = express.Router();
const { getSalesTrends, getSalesComparison, createSale, getSalesHistory } = require('../controllers/salesController');
const { protect, admin } = require('../middleware/authMiddleWare');


router.get('/trends', protect, admin, getSalesTrends);
router.get('/compare', protect, admin, getSalesComparison);
router.post('/create', protect, admin, createSale);
router.get('/history', protect, admin, getSalesHistory);

module.exports = router;
