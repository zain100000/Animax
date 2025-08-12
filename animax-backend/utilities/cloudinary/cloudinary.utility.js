const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new Error("No file uploaded."), false);
  }

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/avi"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only image (JPG, PNG, WEBP) and video (MP4, WEBM, AVI) are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "animeCover", maxCount: 1 },
  { name: "seasonCover", maxCount: 1 },
  { name: "animeEpisode", maxCount: 1 },
]);

const checkUploadedFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }
  next();
};

const uploadToCloudinary = async (
  file,
  type,
  title,
  season,
  episodeNumber,
  userId
) => {
  let folder = "Animax";
  let publicId;
  let resourceType = "image";

  if (type === "profilePicture") {
    folder += "/profilePictures";
    publicId = userId || `${Date.now()}`;
  } else if (type === "animeCover") {
    folder += `/anime/${title}/cover`;
    publicId = "cover";
  } else if (type === "seasonCover") {
    if (!season) throw new Error("Season number is required for seasonCover");
    folder += `/anime/${title}/seasons/Season_${season}/cover`;
    publicId = "cover";
  } else if (type === "animeEpisode") {
    if (!season || !episodeNumber)
      throw new Error("Season and episode number required");
    folder += `/anime/${title}/seasons/Season_${season}/episodes`;
    publicId = `Episode_${episodeNumber}`;
    if (file.mimetype.startsWith("video/")) resourceType = "video";
  } else {
    throw new Error("Invalid upload type");
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      public_id: publicId,
      resource_type: resourceType,
    });
    return { url: result.secure_url };
  } catch (error) {
    console.error("❌ Error Uploading to Cloudinary:", error);
    throw new Error("Error uploading to Cloudinary");
  }
};

/**
 * Delete entire anime folder
 */
const deleteFromCloudinary = async (animeTitle) => {
  try {
    const folderPath = `Animax/anime/${animeTitle}`;

    // List all resources under this folder, including subfolders
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 500,
    });

    if (resources.resources.length === 0) {
      console.log("⚠ No files found in folder.");
    } else {
      // Delete all files
      const publicIds = resources.resources.map((file) => file.public_id);
      await cloudinary.api.delete_resources(publicIds);
      console.log(`✅ Deleted ${publicIds.length} files in ${folderPath}`);
    }

    // List all subfolders under this folder
    const subfoldersResponse = await cloudinary.api.sub_folders(folderPath);
    const subfolders = subfoldersResponse.folders;

    // Recursively delete subfolders
    for (const subfolder of subfolders) {
      await deleteFromCloudinary(subfolder.path);
    }

    // Now delete this folder itself
    await cloudinary.api.delete_folder(folderPath);
    console.log(`✅ Deleted folder: ${folderPath}`);
  } catch (err) {
    console.error("❌ Error deleting anime folder:", err);
  }
};

/**
 * Delete a single file from Cloudinary by its URL
 */
const deleteSingleFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) throw new Error("❌ File URL is required");

    const decodedUrl = decodeURIComponent(fileUrl);
    const parts = decodedUrl.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");

    if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL format");

    // Resource type is usually at parts[4], e.g., 'image' or 'video'
    const resourceType = parts[4] || "image";

    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
    throw error; // rethrow for caller to catch
  }
};

module.exports = {
  upload,
  checkUploadedFiles,
  uploadToCloudinary,
  deleteFromCloudinary, // folder deletion
  deleteSingleFromCloudinary, // single file deletion
};
