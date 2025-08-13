const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const watchlistController = require("../controllers/watchlist.controller");

/**
 * @desc    Add an anime to watchlist
 * @access  Private/User
 */
router.post("/add-to-watchlist", protect, watchlistController.addToWatchlist);

/**
 * @desc    Remove an anime from watchlist
 * @access  Private/User
 */
router.post(
  "/remove-from-watchlist",
  protect,
  watchlistController.removeFromWatchlist
);

/**
 * @desc    Get all watchlist items for a user
 * @access  Private/User
 */
router.get("/get-all-watchlist", protect, watchlistController.getAllWatchlist);

module.exports = router;
