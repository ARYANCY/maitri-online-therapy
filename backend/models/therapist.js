const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      index: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
      index: true
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: [100, "Specialization cannot exceed 100 characters"]
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [70, "Experience value is too high"]
    },
    qualifications: {
      type: String,
      trim: true,
      maxlength: [500, "Qualifications cannot exceed 500 characters"]
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true
    },
    availability: {
      type: String,
      enum: ["full-time", "part-time", "weekends", "evenings", "flexible"],
      default: "flexible"
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"]
    },
    profileComplete: {
      type: Boolean,
      default: false
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
therapistSchema.index({ createdAt: -1 });
therapistSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Therapist", therapistSchema);
