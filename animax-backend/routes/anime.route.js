const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const animeImageUpload = require("../utilities/cloudinary/cloudinary.utility");
const animeController = require("../controllers/anime.controller");

/**
 * @desc    Route to add anime
 * @access  Private
 */
router.post(
  "/add-anime",
  protect,
  animeImageUpload.upload,
  animeController.addAnime
);

/**
 * @desc    Route to get all anime
 * @access  Public
 */
router.get("/get-all-anime", protect, animeController.getAllAnime);

/**
 * @desc    Route to get anime by ID
 * @access  Public
 */
router.get("/get-anime-by-id/:animeId", protect, animeController.getAnimeById);

/**
 * @desc    Route to update anime
 * @access  Private/SuperAdmin
 */
router.patch(
  "/update-anime/:animeId",
  protect,
  animeImageUpload.upload,
  animeController.updateAnime
);

/**
 * @desc    Route to delete anime
 * @access  Private/SuperAdmin
 */
router.delete("/delete-anime/:animeId", protect, animeController.deleteAnime);

module.exports = router;
