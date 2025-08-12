const mongoose = require("mongoose");

const AnimeSchema = new mongoose.Schema(
  {
    animeCover: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    genres: [
      {
        type: String,
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["ONGOING", "COMPLETED", "UPCOMING"],
      default: "ONGOING",
    },

    releaseDate: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 10,
    },

    seasons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Season",
      },
    ],

    episodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Episode",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Anime", AnimeSchema);
