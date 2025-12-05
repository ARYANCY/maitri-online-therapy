const express = require("express");
const router = express.Router();
const { uploadProfilePhoto, uploadCertificates, deleteFromCloudinary } = require("../middleware/upload");
const { requireLogin } = require("../middleware/authMiddleware");

router.post("/profile-photo", requireLogin, (req, res) => {
  uploadProfilePhoto.single("profilePhoto")(req, res, (err) => {
    if (err) {
      console.error("Profile photo upload error:", err);
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Error uploading file",
        error: err.code || "UPLOAD_ERROR"
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
      message: "Profile photo uploaded successfully"
    });
  });
});

router.post("/certificates", requireLogin, (req, res) => {
  uploadCertificates.array("certificates", 5)(req, res, (err) => {
    if (err) {
      console.error("Certificates upload error:", err);
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Error uploading files",
        error: err.code || "UPLOAD_ERROR"
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    
    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      fileName: file.originalname,
      publicId: file.filename
    }));
    
    res.status(200).json({
      success: true,
      files: uploadedFiles,
      message: "Certificates uploaded successfully"
    });
  });
});

router.delete("/file/:publicId", requireLogin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;
    const deleted = await deleteFromCloudinary(publicId, resourceType || "image");
    if (deleted) {
      res.status(200).json({ success: true, message: "File deleted successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to delete file" });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ success: false, message: "Error deleting file", error: error.message });
  }
});

module.exports = router;
