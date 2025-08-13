const User = require("../models/user.model");
const Anime = require("../models/anime.model");
const Watchlist = require("../models/watchlist.model");

/**
 * @description Add an anime to user's watchlist
 * @route    POST /api/watchlist/add-to-watchlist
 * @access   Private/User
 */
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { animeId } = req.body;

    if (!animeId) {
      return res
        .status(400)
        .json({ success: false, message: "Anime ID is required" });
    }

    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.watchlist.includes(animeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Anime already in watchlist" });
    }

    user.watchlist.push(animeId);
    await user.save();

    await Watchlist.create({ user: userId, anime: animeId });

    // Populate with all anime fields
    const populatedUser = await User.findById(userId)
      .populate({
        path: "watchlist",
        model: "Anime",
      })
      .lean();

    res.status(200).json({
      success: true,
      message: "Anime added to watchlist",
      userWatchList: populatedUser,
    });
  } catch (error) {
    console.error("❌ Error adding to watchlist:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Remove an anime from user's watchlist
 * @route    DELETE /api/watchlist/remove-to-watchlist/:animeId
 * @access   Private/User
 */
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { animeId } = req.body;

    if (!animeId) {
      return res
        .status(400)
        .json({ success: false, message: "Anime ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.watchlist.includes(animeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Anime not in watchlist" });
    }

    user.watchlist = user.watchlist.filter((id) => id.toString() !== animeId);
    await user.save();

    await Watchlist.findOneAndDelete({ user: userId, anime: animeId });

    res.status(200).json({
      success: true,
      message: "Anime removed from watchlist",
    });
  } catch (error) {
    console.error("❌ Error removing from watchlist:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @description Get all watchlist items for a user
 * @route    GET /api/watchlist/get-all-watchlist
 * @access   Private/User
 */
exports.getAllWatchlist = async (req, res) => {
  try {
    const userId = req.userId;

    const watchlist = await Watchlist.find({ user: userId })
      .populate({
        path: "anime",
      })
      .populate({
        path: "user",
        populate: {
          path: "watchlist",
        },
      })
      .lean();

    res.status(200).json({
      success: true,
      message: "Fetched all watchlist items successfully",
      count: watchlist.length,
      watchlist,
    });
  } catch (error) {
    console.error("❌ Error fetching watchlist:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
