const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "maitri/therapist-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    public_id: (req, file) => `profile-${Date.now()}`
  }
});

const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "maitri/therapist-certificates",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "auto",
    public_id: (req, file) => `cert-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }
});

const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."), false);
    }
  }
});

const uploadCertificates = multer({
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."), false);
    }
  }
});

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

module.exports = {
  uploadProfilePhoto,
  uploadCertificates,
  deleteFromCloudinary,
  cloudinary
};

