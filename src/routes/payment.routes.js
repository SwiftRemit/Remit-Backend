const express = require("express");
const { body } = require("express-validator");
const { buildTransaction, submitTransaction } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

// Step 1: Build unsigned XDR — frontend sends to Freighter for signing
router.post(
  "/build",
  protect,
  [
    body("senderPublicKey").notEmpty().withMessage("Sender public key is required"),
    body("recipientPublicKey").notEmpty().withMessage("Recipient public key is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  ],
  validate,
  buildTransaction
);

// Step 2: Submit signed XDR — Freighter signed it, secret key never on server
router.post(
  "/submit",
  protect,
  [
    body("signedXdr").notEmpty().withMessage("Signed transaction XDR is required"),
    body("senderPublicKey").notEmpty().withMessage("Sender public key is required"),
    body("recipientPublicKey").notEmpty().withMessage("Recipient public key is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  ],
  validate,
  submitTransaction
);

module.exports = router;
