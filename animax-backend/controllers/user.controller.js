const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Watchlist = require("../models/watchlist.model");
const WatchProgress = require("../models/watch-progress.model");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const jwt = require("jsonwebtoken");
const { v2: cloudinary } = require("cloudinary");

/**
 * @desc    Register a new User
 * @route   POST /api/user/signup-user
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password, bio, watchlist } = req.body;

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Upload profile picture if provided
    let profilePictureUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      profilePictureUrl = uploadResult.url;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      profilePicture: profilePictureUrl,
      userName,
      email,
      password: hashedPassword,
      bio,
      watchlist: watchlist || [],
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Login User
 * @route   POST /api/user/signin-user
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    // Generate token
    const payload = {
      role: "USER",
      user: {
        id: user.id,
        email: user.email,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error Generating Token!",
        });
      }

      res.json({
        success: true,
        message: "User Login Successfully",
        data: {
          id: user.id,
          userName: user.userName,
          email: user.email,
        },
        token,
      });
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Logging In!",
    });
  }
};

/**
 * @desc    Get User by ID
 * @route   GET /api/user/get-user-by-id/:userId
 * @access  Private
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    res.json({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting User!",
    });
  }
};

/**
 * @desc    Reset User password
 * @route   POST /api/user/reset-password
 * @access  Public
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old Password is incorrect!",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Resetting Password!",
    });
  }
};

/**
 * @desc    Update User
 * @route   PUT /api/user/update-user/:userId
 * @access  Private
 */
exports.updateUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (req.body.userName) user.userName = req.body.userName;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.watchlist) user.watchlist = req.body.watchlist;

    // Profile picture update
    if (req.files?.profilePicture) {
      if (user.profilePicture) {
        try {
          const publicId = user.profilePicture.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`profilePictures/${publicId}`);
        } catch (error) {
          console.error("❌ Error deleting old profile picture:", error);
        }
      }

      const result = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );

      user.profilePicture = result.url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User Updated Successfully.",
      user,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Delete User Profile
 * @route   DELETE /api/user/delete-profile/:userId
 * @access  Private
 */
exports.deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Delete profile picture from Cloudinary
    if (user.profilePicture) {
      try {
        await profilePictureUpload.deleteSingleFromCloudinary(
          user.profilePicture
        );
      } catch (error) {
        console.error("❌ Error deleting profile picture:", error);
      }
    }

    // Delete watchlist
    await Watchlist.deleteMany({ user: userId });

    // Delete watch progress
    await WatchProgress.deleteMany({ user: userId });

    // Delete comments stored inside the User model
    user.comments = [];
    await user.save();

    // Finally delete the user document
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Logout User
 * @route   POST /api/user/logout-user
 * @access  Private
 */

exports.logoutUser = async (req, res, next) => {
  try {
    // Return success response with a null token
    res.status(200).json({
      success: true,
      message: "Logout SuccessFully!",
      token: null,
    });
  } catch (err) {
    // Handle server errors
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
