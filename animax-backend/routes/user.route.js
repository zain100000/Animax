const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const userController = require("../controllers/user.controller");

/*
 * @desc    Route to register a User
 * @access  Private/User
 */
router.post(
  "/signup-user",
  profilePictureUpload.upload,
  userController.registerUser
);

/**
 * @desc    Route to login a User
 * @access  Private/User
 */
router.post("/signin-user", userController.loginUser);

/**
 * @desc    Route to get User by ID
 * @access  Private/User
 */
router.get("/get-user-by-id/:userId", protect, userController.getUserById);

/**
 * @desc    Route to update User profile
 * @access  Private/User
 */
router.patch("/reset-user-password", protect, userController.resetUserPassword);

/**
 * @desc    Route to update User profile
 * @access  Private/User
 */
router.patch(
  "/update-user/:userId",
  profilePictureUpload.upload,
  protect,
  userController.updateUser
);

/**
 * @desc    Route to delete User profile
 * @access  Private/User
 */
router.delete("/delete-user/:userId", protect, userController.deleteProfile);

/**
 * @desc    Route to logout User
 * @access  Private/User
 */
router.post("/logout-user", protect, userController.logoutUser);

module.exports = router;
