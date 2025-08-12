const bcrypt = require("bcrypt");
const SuperAdmin = require("../models/super-admin.model");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const jwt = require("jsonwebtoken");

// Register a new SuperAdmin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const existingSuperAdmin = await SuperAdmin.findOne({
      email,
      role: "SUPERADMIN",
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
      });
    }

    let userProfileImageUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      userProfileImageUrl = uploadResult.url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new SuperAdmin({
      profilePicture: userProfileImageUrl,
      userName,
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
      isSuperAdmin: true,
    });

    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: "SuperAdmin created successfully",
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login SuperAdmin
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    const payload = {
      role: "SUPERADMIN",
      user: {
        id: superadmin.id,
        email: superadmin.email,
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
        message: "Super Admin Login Successfully",
        superAdmin: {
          id: superadmin.id,
          userName: superadmin.userName,
          email: superadmin.email,
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

// Get SuperAdmin by ID
exports.getSuperAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const superAdmin = await SuperAdmin.findById(id).select("-password");
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    res.json({
      success: true,
      message: "Super Admin Fetched Successfully",
      superAdmin: superAdmin,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting Super Admin!",
    });
  }
};

// Reset SuperAdmin password
exports.resetSuperAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    let superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    superAdmin.password = hashedPassword;
    await superAdmin.save();

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

// Logout Super Admin
exports.logoutSuperAdmin = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout SuccessFully!",
      token: null,
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

