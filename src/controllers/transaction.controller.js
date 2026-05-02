const Transaction = require("../models/Transaction.model");
const { getTransactionHistory } = require("../services/stellar.service");

// Get all transactions for the logged-in user (from DB)
const getUserTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single transaction by ID
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// Get on-chain transaction history from Stellar for a public key
const getStellarHistory = async (req, res, next) => {
  try {
    const { publicKey } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const history = await getTransactionHistory(publicKey, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserTransactions, getTransactionById, getStellarHistory };
