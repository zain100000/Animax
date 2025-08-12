const Season = require("../models/season.model");
const Anime = require("../models/anime.model");
const Episode = require("../models/episode.model");
const cloudinaryUpload = require("../utilities/cloudinary/cloudinary.utility");

/**
 * @desc    Add a new season for an anime with required cover image
 * @route   POST /api/anime/:animeId/season
 * @access  Private/SuperAdmin
 */
exports.addSeason = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can add season.",
      });
    }

    const { seasonNumber, seasonTitle } = req.body;
    const animeId = req.params.animeId;

    // Check if anime exists
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    // Check if season number already exists for this anime
    const seasonExists = await Season.findOne({
      anime: animeId,
      seasonNumber,
    });
    if (seasonExists) {
      return res
        .status(400)
        .json({ success: false, message: "Season number already exists" });
    }

    // Handle season cover upload
    if (
      !req.files ||
      !req.files.seasonCover ||
      req.files.seasonCover.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Season cover image is required",
      });
    }

    const result = await cloudinaryUpload.uploadToCloudinary(
      req.files.seasonCover[0], // instead of req.file
      "seasonCover",
      anime.title,
      seasonNumber
    );

    const season = await Season.create({
      seasonNumber,
      seasonTitle,
      seasonCover: result.url,
      anime: animeId,
    });

    // Link season to anime
    anime.seasons.push(season._id);
    await anime.save();

    res.status(200).json({
      success: true,
      message: "Season added successfully",
      season,
    });
  } catch (error) {
    console.error("Error adding season:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Get all seasons for a specific anime
 * @route  GET /api/anime/:animeId/seasons
 * @access Private/SuperAdmin
 */
exports.getSeasonsByAnime = async (req, res) => {
  try {
    const seasons = await Season.find({ anime: req.params.animeId })
      .populate({
        path: "episodes", // populate all episode fields
        options: { sort: { episodeNumber: 1 } },
      })
      .populate({
        path: "anime",
        populate: {
          path: "seasons", // deep populate seasons inside anime
          populate: {
            path: "episodes", // optional: also populate episodes in those seasons
          },
        },
      })
      .sort({ seasonNumber: 1 });

    res.status(200).json({
      success: true,
      message: "Seasons fetched successfully",
      seasons,
    });
  } catch (error) {
    console.error("Error getting season by anime:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Get a specific season by ID
 * @route  GET /api/seasons/:id
 * @access Private/SuperAdmin
 */
exports.getSeasonById = async (req, res) => {
  try {
    const season = await Season.findById(req.params.seasonId)
      .populate({
        path: "episodes", // populate all episode fields
        options: { sort: { episodeNumber: 1 } },
      })
      .populate({
        path: "anime",
        populate: {
          path: "seasons", // deep populate seasons inside anime
          populate: {
            path: "episodes", // optional: also populate episodes in those seasons
          },
        },
      })
      .sort({ seasonNumber: 1 });

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    res.status(200).json({
      success: true,
      message: "Season fetched successfully by id",
      season,
    });
  } catch (error) {
    console.error("Error getting season by id:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Update a season by ID with optional cover image
 * @route  PUT /api/seasons/:id
 * @access Private/SuperAdmin
 */
exports.updateSeason = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update season.",
      });
    }

    const season = await Season.findById(req.params.seasonId).populate("anime");
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    if (req.files?.seasonCover) {
      if (season.seasonCover) {
        await cloudinaryUpload.deleteFromCloudinary(season.seasonCover);
      }
      const coverUpload = await cloudinaryUpload.uploadToCloudinary(
        req.files.seasonCover[0],
        "seasonCover",
        season.anime.title,
        season.seasonNumber
      );
      season.seasonCover = coverUpload.url;
    }

    // Update fields
    season.seasonTitle = req.body.seasonTitle || season.seasonTitle;
    season.seasonNumber = req.body.seasonNumber || season.seasonNumber;

    const updatedSeason = await season.save();
    res.status(200).json({
      success: true,
      message: "Season updated successfully",
      season: updatedSeason,
    });
  } catch (error) {
    console.error("Error updating season:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Delete a season and all its episodes
 * @route   DELETE /api/seasons/:id
 * @access  Private/SuperAdmin
 */
exports.deleteSeason = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can delete season.",
      });
    }

    const season = await Season.findById(req.params.seasonId).populate("anime");
    if (!season) {
      console.log("❌ Season not found with ID:", req.params.id);
      return res.status(404).json({ message: "Season not found" });
    }

    console.log(
      `✅ Found season: ${season.seasonTitle} (S${season.seasonNumber}) for anime: ${season.anime.title}`
    );
    console.log("🖼 Season cover URL from DB:", season.seasonCover);

    // Remove season reference from anime
    await Anime.findByIdAndUpdate(season.anime._id, {
      $pull: { seasons: season._id },
    });
    console.log(`🔗 Removed season from anime: ${season.anime.title}`);

    // Delete episodes
    const deletedEpisodes = await Episode.deleteMany({
      _id: { $in: season.episodes },
    });
    console.log(
      `🗑 Deleted ${deletedEpisodes.deletedCount} episodes for season.`
    );

    // Delete only the season folder from Cloudinary
    console.log("📤 Attempting to delete Cloudinary folder for this season...");
    try {
      const seasonFolderPath = `Animax/anime/${season.anime.title}/Season ${season.seasonNumber}`;
      await cloudinaryUpload.deleteFromCloudinary(seasonFolderPath); // this should delete all files in just this season folder
      console.log(`✅ Successfully deleted folder: ${seasonFolderPath}`);
    } catch (cloudErr) {
      console.error(
        "❌ Failed to delete season folder from Cloudinary:",
        cloudErr
      );
    }

    // Delete season document
    await season.deleteOne();
    console.log("✅ Season document deleted from MongoDB.");

    res.status(200).json({
      success: true,
      message: "Season and all episodes deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting season:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
