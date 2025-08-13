const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const seasonImageUpload = require("../utilities/cloudinary/cloudinary.utility");
const seasonController = require("../controllers/season.controller");

/**
 * @desc    Route to add season
 * @access  Private/SuperAdmin
 */
router.post(
  "/add-season/:animeId",
  protect,
  seasonImageUpload.upload,
  seasonController.addSeason
);

/**
 * @desc    Route to get all seasons by anime ID
 * @access  Public
 */
router.get(
  "/get-all-seasons-by-anime/:animeId",
  seasonController.getSeasonsByAnime
);

/**
 * @desc    Route to get season by ID
 * @access  Public
 */
router.get("/get-season-by-id/:seasonId", seasonController.getSeasonById);

/**
 * @desc    Route to update season
 * @access  Private/SuperAdmin
 */
router.patch(
  "/update-season/:seasonId",
  protect,
  seasonImageUpload.upload,
  seasonController.updateSeason
);

/**
 * @desc    Route to delete season
 * @access  Private/SuperAdmin
 */
router.delete(
  "/delete-season/:seasonId",
  protect,
  seasonController.deleteSeason
);

module.exports = router;
