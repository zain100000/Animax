const Episode = require("../models/episode.model");
const Season = require("../models/season.model");
const Anime = require("../models/anime.model");
const cloudinaryUpload = require("../utilities/cloudinary/cloudinary.utility");

/**
 * @desc    Create a new episode for a season with optional video upload
 * @route   POST /api/season/:seasonId/episode
 * @access  Private/SuperAdmin
 */
exports.addEpisode = async (req, res) => {
  try {
    // ✅ Check permissions
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can add episodes.",
      });
    }

    const { episodeNumber, title, duration, subtitles } = req.body;
    const seasonId = req.params.seasonId;

    // ✅ Find season & anime
    const season = await Season.findById(seasonId).populate("anime");
    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    // ✅ Check if episode number already exists in this season
    const episodeExists = await Episode.findOne({
      _id: { $in: season.episodes },
      episodeNumber,
    });
    if (episodeExists) {
      return res.status(400).json({
        success: false,
        message: "Episode number already exists in this season",
      });
    }

    // ✅ Make sure video file is uploaded
    if (!req.files?.animeEpisode || !req.files.animeEpisode[0]) {
      console.error("❌ animeEpisode file missing in request:", req.files);
      return res.status(400).json({
        success: false,
        message: "Episode video file is required and must be uploaded",
      });
    }

    const file = req.files.animeEpisode[0];
    console.log("📂 Uploading episode file:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: file.path,
    });

    // ✅ Upload video to Cloudinary
    const videoUpload = await cloudinaryUpload.uploadToCloudinary(
      file,
      "animeEpisode",
      season.anime?.title || "UnknownAnime",
      season.seasonNumber,
      episodeNumber
    );

    if (!videoUpload?.url) {
      console.error("❌ Cloudinary upload failed, no URL returned.");
      return res.status(500).json({
        success: false,
        message: "Failed to upload episode video",
      });
    }

    // ✅ Create new episode
    const episode = await Episode.create({
      episodeNumber,
      title,
      animeEpisode: videoUpload.url, // Cloudinary video URL
      duration,
      subtitles: subtitles || [],
    });

    // ✅ Link episode to season
    season.episodes.push(episode._id);
    await season.save();

    // ✅ Link episode to anime
    if (season.anime?._id) {
      await Anime.findByIdAndUpdate(season.anime._id, {
        $push: { episodes: episode._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Episode added successfully",
      episode,
    });
  } catch (error) {
    console.error("❌ Error adding episode:", error);
    console.error("Request files:", req.files);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc   Get all episodes for a season
 * @route  GET /api/season/:seasonId/episodes
 * @access Private/SuperAdmin
 */
exports.getEpisodesBySeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.seasonId);
    if (!season) {
      return res
        .status(404)
        .json({ success: false, message: "Season not found" });
    }

    const episodes = await Episode.find({
      _id: { $in: season.episodes },
    }).sort({ episodeNumber: 1 });

    res.status(200).json({
      success: true,
      message: "Episodes fetched successfully by season",
      episodes,
    });
  } catch (error) {
    console.error("Error getting episodes by season:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Get a specific episode by ID
 * @route  GET /api/episode/:id
 * @access Private/SuperAdmin
 */
exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId);
    if (!episode) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }

    res.status(200).json({
      success: true,
      message: "Episode fetched successfully by id",
      episode,
    });
  } catch (error) {
    console.error("Error getting episode by id:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Update an episode including video
 * @route  PUT /api/episode/:id
 * @access Private/SuperAdmin
 */
exports.updateEpisode = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update episode.",
      });
    }

    const episode = await Episode.findById(req.params.episodeId);

    if (!episode) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }

    if (req.files?.videoUrl) {
      if (episode.videoUrl) {
        await cloudinaryUpload.deleteFromCloudinary(episode.videoUrl);
      }
      const videoUpload = await cloudinaryUpload.uploadToCloudinary(
        req.files.videoUrl[0],
        "episodeVideos",
        episode.season.anime.title,
        `Season_${episode.season.seasonNumber}`,
        `Episode_${episode.episodeNumber}`
      );
      episode.videoUrl = videoUpload.url;
    }

    episode.title = req.body.title || episode.title;
    episode.duration = req.body.duration || episode.duration;
    episode.subtitles = req.body.subtitles || episode.subtitles;

    const updatedEpisode = await episode.save();
    res.status(200).json({
      success: true,
      message: "Episode updated successfully",
      episode: updatedEpisode,
    });
  } catch (error) {
    console.error("Error updating episode:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc   Delete an episode
 * @route  DELETE /api/episode/:id
 * @access Private/SuperAdmin
 */
exports.deleteEpisode = async (req, res) => {
  try {
    // ✅ Only SUPERADMIN can delete episodes
    if (!req.user || req.user.role !== "SUPERADMIN") {
      console.warn("⚠ Unauthorized deletion attempt!");
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can delete episode.",
      });
    }

    // ✅ Find the episode
    const episode = await Episode.findById(req.params.episodeId);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: "Episode not found",
      });
    }

    // ✅ Remove episode from Season
    const seasonUpdate = await Season.updateMany(
      { episodes: episode._id },
      { $pull: { episodes: episode._id } }
    );

    // ✅ Remove episode from Anime
    const animeUpdate = await Anime.updateMany(
      { episodes: episode._id },
      { $pull: { episodes: episode._id } }
    );

    // ✅ Delete episode video from Cloudinary (only that file, not folder)
    if (episode.animeEpisode) {
      await cloudinaryUpload.deleteSingleFromCloudinary(episode.animeEpisode);
    } else {
      console.log(
        "ℹ No episode video URL found, skipping Cloudinary deletion."
      );
    }

    // ✅ Delete episode from DB
    await episode.deleteOne();

    res.status(200).json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting episode:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
