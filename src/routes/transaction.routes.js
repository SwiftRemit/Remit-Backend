const express = require("express");
const {
  getUserTransactions,
  getTransactionById,
  getStellarHistory,
} = require("../controllers/transaction.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getUserTransactions);
router.get("/:id", protect, getTransactionById);
router.get("/stellar/:publicKey", protect, getStellarHistory);

module.exports = router;
