const express = require("express");
const { body } = require("express-validator");
const { createWallet, fundWallet, getBalance } = require("../controllers/wallet.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();

router.post("/create", protect, createWallet);

router.post(
  "/fund",
  protect,
  [body("publicKey").notEmpty().withMessage("Public key is required")],
  validate,
  fundWallet
);

router.get("/balance/:publicKey", protect, getBalance);

module.exports = router;
