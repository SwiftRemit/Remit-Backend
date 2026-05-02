const { sendPayment } = require("../services/stellar.service");
const Transaction = require("../models/Transaction.model");

const initiatePayment = async (req, res, next) => {
  try {
    const {
      senderSecret,
      recipientPublicKey,
      amount,
      assetCode = "XLM",
      assetIssuer = null,
      memo = "",
    } = req.body;

    const { StellarSdk } = require("../config/stellar");
    const senderPublicKey = StellarSdk.Keypair.fromSecret(senderSecret).publicKey();

    // Create a pending transaction record
    const txRecord = await Transaction.create({
      userId: req.user._id,
      senderPublicKey,
      recipientPublicKey,
      amount,
      asset: assetCode,
      memo,
      status: "pending",
    });

    // Submit to Stellar
    const result = await sendPayment({
      senderSecret,
      recipientPublicKey,
      amount,
      assetCode,
      assetIssuer,
      memo,
    });

    // Update transaction record
    txRecord.stellarTxHash = result.hash;
    txRecord.status = "success";
    await txRecord.save();

    res.status(200).json({
      success: true,
      message: "Payment sent successfully",
      transaction: {
        id: txRecord._id,
        hash: result.hash,
        amount,
        asset: assetCode,
        recipient: recipientPublicKey,
        status: "success",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initiatePayment };
