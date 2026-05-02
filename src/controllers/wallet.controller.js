const {
  generateKeypair,
  fundTestnetAccount,
  getAccountBalance,
} = require("../services/stellar.service");
const User = require("../models/User.model");

// Generate a new Stellar keypair for the user
const createWallet = async (req, res, next) => {
  try {
    const keypair = generateKeypair();

    // Save public key to user profile
    await User.findByIdAndUpdate(req.user._id, {
      stellarPublicKey: keypair.publicKey,
    });

    res.status(201).json({
      success: true,
      message: "Wallet created. Store your secret key safely — it will not be shown again.",
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey, // shown once only
    });
  } catch (error) {
    next(error);
  }
};

// Fund testnet account via Friendbot
const fundWallet = async (req, res, next) => {
  try {
    const { publicKey } = req.body;
    const result = await fundTestnetAccount(publicKey);
    res.json({ success: true, message: "Testnet account funded", result });
  } catch (error) {
    next(error);
  }
};

// Get wallet balance
const getBalance = async (req, res, next) => {
  try {
    const { publicKey } = req.params;
    const balances = await getAccountBalance(publicKey);
    res.json({ success: true, publicKey, balances });
  } catch (error) {
    next(error);
  }
};

module.exports = { createWallet, fundWallet, getBalance };
