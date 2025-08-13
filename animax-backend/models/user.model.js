const mongoose = require("mongoose");

/**
 * @description User model schema
 */
const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    userName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      maxlength: 200,
    },

    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime", // Anime the user plans to watch
      },
    ],

    comments: [
      {
        episode: { type: mongoose.Schema.Types.ObjectId, ref: "Episode" },
        anime: { type: mongoose.Schema.Types.ObjectId, ref: "Anime" },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    watchProgress: [
      {
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
        currentTime: { type: Number, default: 0 }, // in seconds
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
