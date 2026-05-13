const { buildPaymentXdr, submitSignedTransaction } = require("../services/stellar.service");
const Transaction = require("../models/Transaction.model");

/**
 * Step 1 — Build an unsigned transaction XDR.
 * Frontend sends this to Freighter for signing. No secret key involved.
 */
const buildTransaction = async (req, res, next) => {
  try {
    const {
      senderPublicKey,
      recipientPublicKey,
      amount,
      assetCode = "XLM",
      assetIssuer = null,
      memo = "",
    } = req.body;

    const xdr = await buildPaymentXdr({
      senderPublicKey,
      recipientPublicKey,
      amount,
      assetCode,
      assetIssuer,
      memo,
    });

    res.status(200).json({ success: true, xdr });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2 — Submit a signed transaction XDR to Stellar.
 * The XDR was signed by Freighter in the browser — secret key never sent to server.
 */
const submitTransaction = async (req, res, next) => {
  try {
    const {
      signedXdr,
      senderPublicKey,
      recipientPublicKey,
      amount,
      assetCode = "XLM",
      memo = "",
    } = req.body;

    // Create pending record
    const txRecord = await Transaction.create({
      userId: req.user._id,
      senderPublicKey,
      recipientPublicKey,
      amount,
      asset: assetCode,
      memo,
      status: "submitted",
    });

    // Submit pre-signed XDR — no secret key on server
    const result = await submitSignedTransaction(signedXdr);

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

module.exports = { buildTransaction, submitTransaction };
