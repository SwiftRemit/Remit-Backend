const express = require("express");
const {
  getUserTransactions,
  getTransactionById,
  getStellarHistory,
} = require("../controllers/transaction.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getUserTransactions);
// specific routes must come before param routes to avoid /:id swallowing them
router.get("/stellar/:publicKey", protect, getStellarHistory);
router.get("/:id", protect, getTransactionById);

module.exports = router;
