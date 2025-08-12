const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/super-admin.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Get Authorization header and check for Bearer token
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access, Token is missing",
      });
    }

    // Extract and verify JWT token
    const jwtToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Validate token structure and role
    if (!decodedToken?.user?.id || decodedToken?.role !== "SUPERADMIN") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token Structure or Role" });
    }

    // Fetch super admin user from DB without password
    const user = await SuperAdmin.findById(decodedToken.user.id).select(
      "-password"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // Attach user details to request object
    req.user = {
      id: user._id.toString(),
      role: "SUPERADMIN",
      email: user.email,
    };

    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error("Error Verifying Token:", error.message || error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
};

module.exports = authMiddleware;
