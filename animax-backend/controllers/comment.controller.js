const User = require("../models/user.model");
const Anime = require("../models/anime.model");
const Episode = require("../models/episode.model");
const Comment = require("../models/comment.model");

/**
 * @desc Add comment to an episode
 * @route POST /api/comment/add-comment
 * @access Private
 */
exports.addComment = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { animeId, episodeId, comment } = req.body;

    if (!animeId || !episodeId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Anime ID, Episode ID, and comment are required",
      });
    }

    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res
        .status(404)
        .json({ success: false, message: "Anime not found" });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Save comment in Comment collection
    const newComment = await Comment.create({
      user: userId,
      anime: animeId,
      episode: episodeId,
      comment,
    });

    // Save comment reference in user document
    user.comments.push({
      episode: episodeId,
      anime: animeId,
      comment,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc Get comments for an episode
 * @route GET /api/comment/:episodeId
 * @access Public
 */
exports.getEpisodeComments = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const comments = await Comment.find({ episode: episodeId })
      .populate("user", "userName profilePicture")
      .populate("anime")
      .populate("episode")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc Update a comment
 * @route PUT /api/comment/update-comment/commentId
 * @access Private
 */
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body; // Only comment text comes from body
    const userId = req.userId;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Updated comment text is required",
      });
    }

    // Find the comment document
    let existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    // Update the comment text
    existingComment.comment = comment;
    await existingComment.save();

    // Re-fetch with population
    existingComment = await Comment.findById(commentId)
      .populate("user", "userName profilePicture")
      .populate("anime")
      .populate("episode");

    // Update in user's comment history by episode + anime match
    await User.updateOne(
      {
        _id: userId,
        "comments.episode": existingComment.episode,
        "comments.anime": existingComment.anime,
      },
      {
        $set: {
          "comments.$.comment": comment,
          "comments.$.createdAt": new Date(), // could add updatedAt if desired
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: existingComment,
    });
  } catch (error) {
    console.error("❌ Error updating comment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc Delete a comment
 * @route DELETE /api/comment/delete-comment/:commentId
 * @access Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Find the comment document
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Delete from Comment collection
    await existingComment.deleteOne();

    // Remove from user's comment history using episode & anime
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          comments: {
            episode: existingComment.episode,
            anime: existingComment.anime,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
