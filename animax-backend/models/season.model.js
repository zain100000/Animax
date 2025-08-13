const mongoose = require("mongoose");

/**
 * @description Season model schema
 */
const SeasonSchema = new mongoose.Schema(
  {
    seasonNumber: {
      type: Number,
      required: true,
    },

    seasonTitle: {
      type: String,
      required: true,
    },

    seasonCover: {
      type: String,
      required: true,
    },

    episodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Episode",
      },
    ],

    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Season", SeasonSchema);
