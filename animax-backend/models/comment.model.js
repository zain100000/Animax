const mongoose = require("mongoose");

/**
 * @description Comment model schema
 */

const commentSchema = new mongoose.Schema(
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

    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode",
      required: true,
    },

    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
