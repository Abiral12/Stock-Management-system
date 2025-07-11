const Sales = require('../models/sales');
const Product = require('../models/Products');

exports.getSalesTrends = async (req, res) => {
  try {
    const { period = 'daily', start, end } = req.query;
    let groupFormat;
    if (period === 'daily') groupFormat = "%Y-%m-%d";
    else if (period === 'monthly') groupFormat = "%Y-%m";
    else if (period === 'yearly') groupFormat = "%Y";
    else groupFormat = "%Y-%m-%d";

    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const trends = await Sales.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$date" } },
          totalSold: { $sum: "$quantity" },
          totalSales: { $sum: { $multiply: ["$quantity", "$price"] } },
          totalCost: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const results = trends.map(trend => {
      const grossProfit = trend.totalSales - trend.totalCost;
      const profitMargin = trend.totalSales > 0 ? (grossProfit / trend.totalSales) * 100 : 0;
      return {
        ...trend,
        grossProfit,
        profitMargin
      };
    });

    res.json({ success: true, trends: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesComparison = async (req, res) => {
  try {
    const { period1Start, period1End, period2Start, period2End } = req.query;

    const getStats = async (start, end) => {
      const result = await Sales.aggregate([
        { $match: { date: { $gte: new Date(start), $lte: new Date(end) } } },
        {
          $group: {
            _id: null,
            totalSold: { $sum: "$quantity" },
            totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
            totalCost: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } }
          }
        }
      ]);
      return result[0] || { totalSold: 0, totalRevenue: 0, totalCost: 0 };
    };

    const period1 = await getStats(period1Start, period1End);
    const period2 = await getStats(period2Start, period2End);

    res.json({ success: true, period1, period2 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    // Deduct quantity
    product.quantity -= quantity;
    product.soldCount = (product.soldCount || 0) + quantity;
    await product.save();

    // Log the sale
    const sale = await Sales.create({
      productId: product._id,
      quantity,
      price: product.sellingPrice,
      purchasePrice: product.purchasePrice
    });

    res.json({ success: true, sale, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
