const express = require("express");
const { body } = require("express-validator");
const { initiatePayment } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

router.post(
  "/send",
  protect,
  [
    body("senderSecret").notEmpty().withMessage("Sender secret key is required"),
    body("recipientPublicKey").notEmpty().withMessage("Recipient public key is required"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
  ],
  validate,
  initiatePayment
);

module.exports = router;
