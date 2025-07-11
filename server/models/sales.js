const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // selling price per unit
  purchasePrice: { type: Number, required: true } // cost per unit at time of sale
});

module.exports = mongoose.model('Sales', salesSchema);
