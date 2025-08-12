const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const seasonImageUpload = require("../utilities/cloudinary/cloudinary.utility");
const seasonController = require("../controllers/season.controller");

// Route to add season
router.post(
  "/add-season/:animeId",
  protect,
  seasonImageUpload.upload,
  seasonController.addSeason
);

// Route to get all seasons for anime
router.get("/get-all-seasons-by-anime/:animeId", seasonController.getSeasonsByAnime);

// Route to get season by id
router.get("/get-season-by-id/:seasonId", seasonController.getSeasonById);

// Route to update season
router.patch(
  "/update-season/:seasonId",
  protect,
  seasonImageUpload.upload,
  seasonController.updateSeason
);

// Route to delete season
router.delete("/delete-season/:seasonId", protect, seasonController.deleteSeason);

module.exports = router;
