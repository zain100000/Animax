const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const episodeVideoUpload = require("../utilities/cloudinary/cloudinary.utility");
const episodeController = require("../controllers/episode.controller");

// Route to add episode
router.post(
  "/add-episode/:seasonId",
  protect,
  episodeVideoUpload.upload,
  episodeController.addEpisode
);

// Route to get all episodes for season
router.get(
  "/get-episodes-by-season/:seasonId",
  episodeController.getEpisodesBySeason
);

// Route to get episode by id
router.get("/get-episode-by-id/:episodeId", episodeController.getEpisodeById);

// Route to update episode
router.patch(
  "/update-episode/:episodeId",
  protect,
  episodeVideoUpload.upload,
  episodeController.updateEpisode
);

// Route to delete episode
router.delete("/delete-episode/:episodeId", protect, episodeController.deleteEpisode);

module.exports = router;
