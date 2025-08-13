const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const superAdminController = require("../controllers/super-admin.controller");

/**
 * @desc    Route to register a SuperAdmin
 * @access  Private/SuperAdmin
 */
router.post(
  "/signup-super-admin",
  profilePictureUpload.upload,
  superAdminController.registerSuperAdmin
);

/**
 * @desc    Route to login a SuperAdmin
 * @access  Private/SuperAdmin
 */
router.post("/signin-super-admin", superAdminController.loginSuperAdmin);

/**
 * @desc    Route to get all SuperAdmins
 * @access  Private/SuperAdmin
 */
router.get(
  "/get-super-admin-by-id/:id",
  protect,
  superAdminController.getSuperAdminById
);

/**
 * @desc    Route to update SuperAdmin profile
 * @access  Private/SuperAdmin
 */
router.patch(
  "/reset-super-admin-password",
  protect,
  superAdminController.resetSuperAdminPassword
);

/**
 * @desc    Route to logout SuperAdmin
 * @access  Private/SuperAdmin
 */
router.post(
  "/logout-super-admin",
  protect,
  superAdminController.logoutSuperAdmin
);

module.exports = router;
