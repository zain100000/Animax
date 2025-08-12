const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const animeImageUpload = require("../utilities/cloudinary/cloudinary.utility");
const animeController = require("../controllers/anime.controller");

// Route to add anime
router.post(
  "/add-anime",
  protect,
  animeImageUpload.upload,
  animeController.addAnime
);

// Route to get all anime
router.get("/get-all-anime", protect, animeController.getAllAnime);

// Route to get anime by id
router.get("/get-anime-by-id/:id", protect, animeController.getAnimeById);

// Route to update anime
router.patch(
  "/update-anime/:id",
  protect,
  animeImageUpload.upload,
  animeController.updateAnime
);

// Route to delete anime
router.delete("/delete-anime/:id", protect, animeController.deleteAnime);

module.exports = router;
