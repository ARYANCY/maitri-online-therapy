const mongoose = require("mongoose");

const ROLE_CATEGORIES = [
  "Geriatric Doctor",
  "Neurologist",
  "Dementia Care Nurse",
  "Occupational Therapist",
  "Speech & Cognitive Therapist",
  "Dementia Caregiver / Support Worker",
  "Memory Care Specialist",
  "Neuropsychologist",
  "Palliative/End-of-life Specialist",
  "Psychiatrist",
  "Social Worker",
  "Other"
];

const DEMENTIA_TYPES = [
  "Alzheimer's Disease",
  "Vascular Dementia",
  "Lewy Body Dementia",
  "FTD (Frontotemporal Dementia)",
  "Mixed Dementia",
  "Mild Cognitive Impairment (MCI)",
  "Parkinson's with Dementia",
  "Other"
];

const DEMENTIA_STAGES = [
  "Early Stage",
  "Middle Stage",
  "Late/Severe Stage",
  "End-of-life/Terminal Care"
];

const dochSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: [50, "Preferred name cannot exceed 50 characters"]
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Prefer not to say", "Other"],
      default: "Prefer not to say"
    },
    pronouns: {
      type: String,
      enum: ["He/Him", "She/Her", "They/Them", "Other"],
      default: "They/Them"
    },
    profilePhoto: {
      type: String,
      default: ""
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
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"]
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"]
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"]
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"]
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    roleCategories: [{
      type: String,
      enum: ROLE_CATEGORIES
    }],
    highestQualification: {
      type: String,
      required: [true, "Highest qualification is required"],
      trim: true,
      maxlength: [200, "Qualification cannot exceed 200 characters"]
    },
    dementiaCertifications: [{
      name: { type: String, trim: true },
      issuingBody: { type: String, trim: true },
      year: { type: Number },
      expiryDate: { type: Date }
    }],
    licenseNumber: {
      type: String,
      trim: true,
      maxlength: [100, "License number cannot exceed 100 characters"]
    },
    licenseFiles: [{
      url: { type: String },
      fileName: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    yearsInDementiaCare: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [70, "Experience value is too high"]
    },
    previousInstitutions: [{
      name: { type: String, trim: true },
      role: { type: String, trim: true },
      duration: { type: String, trim: true },
      location: { type: String, trim: true }
    }],
    dementiaTypesExperienced: [{
      type: String,
      enum: DEMENTIA_TYPES
    }],
    dementiaStagesHandled: [{
      type: String,
      enum: DEMENTIA_STAGES
    }],
    shortBio: {
      type: String,
      trim: true,
      maxlength: [1500, "Bio cannot exceed 1500 characters"]
    },
    specialSkills: [{
      type: String,
      trim: true
    }],
    languagesSpoken: [{
      type: String,
      trim: true
    }],
    sessionDuration: {
      type: Number,
      enum: [30, 45, 60, 90, 120],
      default: 60
    },
    preferredCommunicationMode: [{
      type: String,
      enum: ["Video", "Audio", "Chat", "In-Person", "Home Visit"]
    }],
    consultationFee: {
      initial: { type: Number, min: 0 },
      followUp: { type: Number, min: 0 },
      homeVisit: { type: Number, min: 0 }
    },
    acceptsInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProviders: [{
      type: String,
      trim: true
    }],
    priority: {
      type: Number,
      required: [true, "Priority is required"],
      min: [1, "Priority must be between 1 and 10"],
      max: [10, "Priority must be between 1 and 10"],
      default: 5,
      index: true
    },
    availability: [
      {
        date: {
          type: Date,
          required: true
        },
        time_slots: [{
          type: String,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format (e.g., 09:00, 14:30)"]
        }]
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now
    },
    appointments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        appointmentDate: {
          type: Date,
          required: true
        },
        timeSlot: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"]
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected", "confirmed", "completed", "cancelled"],
          default: "pending"
        },
        patientNotes: {
          type: String,
          trim: true,
          maxlength: [500, "Notes cannot exceed 500 characters"]
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    name: {
      type: String,
      trim: true
    },
    specialization: {
      type: String,
      trim: true
    },
    experience: {
      type: Number
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

dochSchema.pre("save", function(next) {
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (this.roleCategories && this.roleCategories.length > 0 && !this.specialization) {
    this.specialization = this.roleCategories[0];
  }
  if (this.yearsInDementiaCare !== undefined && this.experience === undefined) {
    this.experience = this.yearsInDementiaCare;
  }
  next();
});

dochSchema.index({ isActive: 1, priority: 1 });

module.exports = mongoose.model("DOCH", dochSchema);
