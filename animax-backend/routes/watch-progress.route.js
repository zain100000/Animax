const express = require("express");
const router = express.Router();
const watchProgressController = require("../controllers/watch-progress.controller");
const protect = require("../middlewares/auth.middleware");

/**
 * @description Save or update watch progress
 */
router.post(
  "/save-progress",
  protect,
  watchProgressController.saveWatchProgress
);

/**
 * @description Get watch progress for a specific anime, season, and episode
 */
router.get(
  "/get-watch-progress/:animeId/:seasonId/:episodeId",
  protect,
  watchProgressController.getWatchProgress
);

module.exports = router;
