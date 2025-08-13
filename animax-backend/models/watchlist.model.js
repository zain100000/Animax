const mongoose = require("mongoose");

/**
 * @description Watchlist model schema
 */
const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Watchlist", watchlistSchema);
