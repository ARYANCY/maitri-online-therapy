const cloudinary = require("cloudinary").v2;

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.warn("⚠️  Cloudinary environment variables not fully configured:");
  console.warn("   CLOUD_NAME:", process.env.CLOUD_NAME ? "✓" : "✗ missing");
  console.warn("   CLOUD_API_KEY:", process.env.CLOUD_API_KEY ? "✓" : "✗ missing");
  console.warn("   CLOUD_API_SECRET:", process.env.CLOUD_API_SECRET ? "✓" : "✗ missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

module.exports = cloudinary;

