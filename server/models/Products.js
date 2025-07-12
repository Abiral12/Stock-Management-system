const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["clothing", "accessories"], 
  },
  subcategory: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Clothing subcategories
        if (this.category === "clothing") {
          return [
            "t-shirt",
            "trousers",
            "shirts",
            "formal-pants",
            "jeans-pants",
          ].includes(v);
        }
        // Accessories subcategories
        else if (this.category === "accessories") {
          return ["belt", "purse", "wallet", "watch", "hat"].includes(v);
        }
        return false;
      },
      message: (props) =>
        `Invalid subcategory '${props.value}' for category '${this.category}'`,
    },
  },
  size: {
    type: String,
    required: function () {
      return this.category === "clothing";
    },
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  color: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  qrCode: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

module.exports = mongoose.model("Products", productSchema);
