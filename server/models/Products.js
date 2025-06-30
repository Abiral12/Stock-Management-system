const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sku:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    category:{
        type:String,
        required:true,
        enum:['t-shirt','trousers','shirts','formal-pants','jeans-pants','Accessory']
    },
     size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Universal']
  },
   color: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
   lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('products',productSchema)