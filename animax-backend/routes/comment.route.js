const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const commentController = require("../controllers/comment.controller");

/**
 * @desc    Add comment to an episode
 */
router.post("/add-comment", protect, commentController.addComment);

/**
 * @desc    Get comments for an episode
 */
router.get(
  "/get-comments-by-episode/:episodeId",
  protect,
  commentController.getEpisodeComments
);

/**
 * @desc Update a comment
 */
router.patch(
  "/update-comment/:commentId",
  protect,
  commentController.updateComment
);

/**
 * @desc Delete a comment
 */
router.delete(
  "/delete-comment/:commentId",
  protect,
  commentController.deleteComment
);

module.exports = router;
