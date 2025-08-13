const mongoose = require("mongoose");

/**
 * @description Watch Progress model schema
 */
const watchProgressSchema = new mongoose.Schema(
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

    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },

    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true,
    },

    currentTime: {
      type: Number,
      default: 0, // time in seconds
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchProgress", watchProgressSchema);
