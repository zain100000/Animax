const User = require("../models/user.model");
const WatchProgress = require("../models/watch-progress.model");
const Anime = require("../models/anime.model");
const Season = require("../models/season.model");
const Episode = require("../models/episode.model");

/**
 * @description Save or update watch progress
 * @route    POST /api/watch-progress/save-progress
 * @access   Private/User
 */
exports.saveWatchProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { animeId, seasonId, episodeId, currentTime } = req.body;

    if (!animeId || !seasonId || !episodeId) {
      return res.status(400).json({
        success: false,
        message: "Anime ID, Season ID, and Episode ID are required",
      });
    }

    // Validate anime, season, and episode existence
    const anime = await Anime.findById(animeId);
    if (!anime)
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });

    const season = await Season.findById(seasonId);
    if (!season)
      return res
        .status(404)
        .json({ success: false, message: "Season not found" });

    const episode = await Episode.findById(episodeId);
    if (!episode)
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });

    // Update progress in User model
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const existingProgress = user.watchProgress.find(
      (p) =>
        p.anime.toString() === animeId &&
        p.season.toString() === seasonId &&
        p.episode.toString() === episodeId
    );

    if (existingProgress) {
      existingProgress.currentTime = currentTime;
      existingProgress.updatedAt = Date.now();
    } else {
      user.watchProgress.push({
        anime: animeId,
        season: seasonId,
        episode: episodeId,
        currentTime,
      });
    }

    await user.save();

    // Update or create in separate WatchProgress collection
    await WatchProgress.findOneAndUpdate(
      { user: userId, anime: animeId, season: seasonId, episode: episodeId },
      { currentTime, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Watch progress saved successfully",
      watchProgress: user.watchProgress,
    });
  } catch (error) {
    console.error("❌ Error saving watch progress:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Get watch progress for a specific episode
 * @route    GET /api/watch-progress/:animeId/:seasonId/:episodeId
 * @access   Private/User
 */
exports.getWatchProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { animeId, seasonId, episodeId } = req.params;

    const progress = await WatchProgress.findOne({
      user: userId,
      anime: animeId,
      season: seasonId,
      episode: episodeId,
    }).populate("anime season episode");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No watch progress found for this episode",
      });
    }

    res.status(200).json({
      success: true,
      message: "Watch progress retrieved successfully",
      watchProgress: progress,
    });
  } catch (error) {
    console.error("❌ Error fetching watch progress:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
