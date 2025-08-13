const mongoose = require("mongoose");

/**
 * @description Episode model schema
 */
const EpisodeSchema = new mongoose.Schema(
  {
    episodeNumber: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      default: null,
    },

    animeEpisode: {
      type: String,
      required: true,
    },

    duration: {
      type: String, // in seconds
      required: true,
    },

    releasedAt: {
      type: Date,
      default: Date.now,
    },

    subtitles: [
      {
        language: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Episode", EpisodeSchema);
