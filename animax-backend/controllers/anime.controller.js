const Anime = require("../models/anime.model");
const Episode = require("../models/episode.model");
const Season = require("../models/season.model");
const cloudinaryUpload = require("../utilities/cloudinary/cloudinary.utility");

/**
 * @desc    Add a new anime with required cover upload
 * @route   POST /api/anime/add-anime
 * @access  Private/SuperAdmin
 */
exports.addAnime = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can add anime",
      });
    }

    const { title, description, genres, status, releaseDate, rating, studio } =
      req.body;

    // Check if anime exists
    const animeExists = await Anime.findOne({ title });
    if (animeExists) {
      return res.status(400).json({
        success: false,
        message: "Anime already exists",
      });
    }

    // Cover image is required for anime
    if (!req.files?.animeCover) {
      return res.status(400).json({
        success: false,
        message: "Anime cover image is required",
      });
    }

    // Upload cover to Cloudinary
    const coverUpload = await cloudinaryUpload.uploadToCloudinary(
      req.files.animeCover[0],
      "animeCover",
      title
    );

    const anime = await Anime.create({
      title,
      description,
      genres,
      status,
      releaseDate,
      rating,
      studio,
      animeCover: coverUpload.url,
    });

    res.status(200).json({
      success: true,
      message: "Anime added successfully",
      anime,
    });
  } catch (error) {
    console.error("Error adding anime:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

/**
 * @desc   Get all anime with optional status filter
 * @route  GET /api/anime/get-all-anime
 * @access Public
 *
 */

exports.getAllAnime = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const anime = await Anime.find(query)
      .populate({
        path: "seasons",
        options: { sort: { seasonNumber: 1 } },
        populate: {
          path: "episodes",
          options: { sort: { episodeNumber: 1 } },
        },
      })
      .sort({ title: 1 })

      .populate({
        path: "episodes",
        options: { sort: { episodeNumber: 1 } },
      })
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      message: "Anime fetched successfully",
      animes: anime,
    });
  } catch (error) {
    console.error("Error getting anime:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get anime by ID with populated seasons and episodes
 * @route   GET /api/anime/get-anime-by-id/:animeId
 * @access  Public
 */

exports.getAnimeById = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.animeId)
      .populate({
        path: "seasons",
        options: { sort: { seasonNumber: 1 } },
        populate: {
          path: "episodes",
          options: { sort: { episodeNumber: 1 } },
        },
      })
      .sort({ title: 1 })

      .populate({
        path: "episodes",
        options: { sort: { episodeNumber: 1 } },
      })
      .sort({ title: 1 });

    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    res.status(200).json({
      success: true,
      message: "Anime fetched successfully by id",
      anime,
    });
  } catch (error) {
    console.error("Error getting anime by id:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update anime including cover image
 * @route   PUT /api/anime/update-anime/:animeId
 * @access  Private/SuperAdmin
 */
exports.updateAnime = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update anime.",
      });
    }

    const anime = await Anime.findById(req.params.animeId);
    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    // Handle cover update
    if (req.files?.animeCover) {
      if (anime.animeCover) {
        await cloudinaryUpload.deleteFromCloudinary(anime.animeCover);
      }
      const coverUpload = await cloudinaryUpload.uploadToCloudinary(
        req.files.animeCover[0],
        "animeCover",
        anime.title
      );
      anime.animeCover = coverUpload.url;
    }

    // Update fields
    anime.title = req.body.title || anime.title;
    anime.description = req.body.description || anime.description;
    anime.genres = req.body.genres || anime.genres;
    anime.status = req.body.status || anime.status;
    anime.releaseDate = req.body.releaseDate || anime.releaseDate;
    anime.rating = req.body.rating || anime.rating;
    anime.studio = req.body.studio || anime.studio;

    const updatedAnime = await anime.save();
    res.status(200).json({
      success: true,
      message: "Anime updated successfully",
      anime: updatedAnime,
    });
  } catch (error) {
    console.error("Error updating anime:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Delete anime and all related seasons and episodes
 * @route   DELETE /api/anime/delete-anime/:animeId
 * @access  Private/SuperAdmin
 */
exports.deleteAnime = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can delete anime.",
      });
    }

    // Populate seasons and episodes arrays from Anime document
    const anime = await Anime.findById(req.params.animeId)
      .populate("seasons")
      .populate("episodes");

    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    // Delete anime cover
    if (anime.animeCover) {
      await cloudinaryUpload.deleteSingleFromCloudinary(
        anime.animeCover,
        "image"
      );
    }

    // Delete season covers
    for (const season of anime.seasons) {
      if (season.seasonCover) {
        await cloudinaryUpload.deleteSingleFromCloudinary(
          season.seasonCover,
          "image"
        );
      }
    }

    // Delete episode videos
    for (const episode of anime.episodes) {
      if (episode.animeEpisode) {
        await cloudinaryUpload.deleteSingleFromCloudinary(
          episode.animeEpisode,
          "video"
        );
      }
    }

    // Delete entire anime folder from Cloudinary
    try {
      await cloudinaryUpload.deleteFromCloudinary(anime.title);
    } catch (cloudErr) {
      console.error("❌ Failed to delete Cloudinary folder:", cloudErr);
    }

    // Delete episodes from MongoDB
    if (anime.episodes.length > 0) {
      const episodeIds = anime.episodes.map((e) => e._id);
      await Episode.deleteMany({ _id: { $in: episodeIds } });
    } else {
      console.log(`ℹ️ No episodes to delete from DB`);
    }

    // Delete seasons from MongoDB
    if (anime.seasons.length > 0) {
      const seasonIds = anime.seasons.map((s) => s._id);
      await Season.deleteMany({ _id: { $in: seasonIds } });
    } else {
      console.log(`ℹ️ No seasons to delete from DB`);
    }

    // Delete anime document itself
    await anime.deleteOne();

    res.status(200).json({
      success: true,
      message: "Anime deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting anime:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
