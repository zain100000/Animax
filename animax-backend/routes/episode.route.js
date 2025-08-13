const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const episodeVideoUpload = require("../utilities/cloudinary/cloudinary.utility");
const episodeController = require("../controllers/episode.controller");

/**
 * @desc    Route to add episode
 * @access  Private/SuperAdmin
 */
router.post(
  "/add-episode/:seasonId",
  protect,
  episodeVideoUpload.upload,
  episodeController.addEpisode
);

/**
 * @desc    Route to get all episodes
 * @access  Public
 */
router.get(
  "/get-episodes-by-season/:seasonId",
  episodeController.getEpisodesBySeason
);

/**
 * @desc    Route to get episode by ID
 * @access  Public
 */
router.get("/get-episode-by-id/:episodeId", episodeController.getEpisodeById);

/**
 * @desc    Route to update episode
 * @access  Private/SuperAdmin
 */
router.patch(
  "/update-episode/:episodeId",
  protect,
  episodeVideoUpload.upload,
  episodeController.updateEpisode
);

/**
 * @desc    Route to delete episode
 * @access  Private/SuperAdmin
 */
router.delete(
  "/delete-episode/:episodeId",
  protect,
  episodeController.deleteEpisode
);

module.exports = router;
