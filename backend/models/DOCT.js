const mongoose = require("mongoose");

const doctSchema = new mongoose.Schema(
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
    pronouns: {
      type: String,
      enum: ["He/Him", "She/Her", "They/Them", "Other"],
      default: "They/Them"
    },
    profilePhoto: {
      type: String,
      default: ""
    },
    dateOfBirth: {
      type: Date
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    },
    timeZone: {
      type: String,
      default: "Asia/Kolkata"
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
    primaryQualification: {
      type: String,
      required: [true, "Primary qualification is required"],
      trim: true,
      maxlength: [200, "Primary qualification cannot exceed 200 characters"]
    },
    additionalCertifications: [{
      name: { type: String, trim: true },
      year: { type: Number },
      institution: { type: String, trim: true }
    }],
    licensingBody: {
      type: String,
      trim: true,
      maxlength: [200, "Licensing body cannot exceed 200 characters"]
    },
    therapistCouncilNumber: {
      type: String,
      trim: true,
      maxlength: [100, "Council number cannot exceed 100 characters"]
    },
    yearsOfPractice: {
      type: Number,
      required: [true, "Years of practice is required"],
      min: [0, "Years of practice cannot be negative"],
      max: [70, "Years of practice value is too high"]
    },
    licenseFiles: [{
      url: { type: String },
      fileName: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    specializations: [{
      type: String,
      enum: [
        "Anxiety", "Depression", "Trauma/PTSD", "LGBTQ+", "ADHD", 
        "OCD", "Grief/Loss", "Relationship Issues", "Family Therapy",
        "Addiction", "Eating Disorders", "Stress Management", 
        "Self-Esteem", "Anger Management", "Career Counseling",
        "Child Psychology", "Adolescent Therapy", "Geriatric Psychology",
        "Dementia Care", "Bipolar Disorder", "Personality Disorders",
        "Sleep Disorders", "Phobias", "Other"
      ]
    }],
    approachesUsed: [{
      type: String,
      enum: [
        "CBT (Cognitive Behavioral Therapy)", 
        "DBT (Dialectical Behavior Therapy)",
        "REBT (Rational Emotive Behavior Therapy)",
        "Psychoanalysis", 
        "Mindfulness-Based Therapy",
        "Person-Centered Therapy",
        "Solution-Focused Therapy",
        "EMDR",
        "Art Therapy",
        "Play Therapy",
        "Narrative Therapy",
        "Gestalt Therapy",
        "Acceptance and Commitment Therapy (ACT)",
        "Trauma-Informed Care",
        "Holistic Therapy",
        "Other"
      ]
    }],
    shortBio: {
      type: String,
      trim: true,
      maxlength: [1500, "Bio cannot exceed 1500 characters"]
    },
    preferredTherapyStyle: {
      type: String,
      enum: ["Supportive", "Directive", "Analytical", "Holistic", "Trauma-Informed", "Eclectic"],
      default: "Supportive"
    },
    areasComfortableWith: [{
      type: String,
      trim: true
    }],
    areasNotHandled: [{
      type: String,
      trim: true
    }],
    languagesForSession: [{
      type: String,
      trim: true
    }],
    ageGroupsServed: [{
      type: String,
      enum: ["Children (5-12)", "Teens (13-17)", "Young Adults (18-25)", "Adults (26-59)", "Seniors (60+)"]
    }],
    sessionDuration: {
      type: Number,
      enum: [30, 45, 60, 90],
      default: 60
    },
    sessionLimitPerDay: {
      type: Number,
      min: 1,
      max: 20,
      default: 8
    },
    preferredCommunicationMode: [{
      type: String,
      enum: ["Video", "Audio", "Chat", "In-Person"]
    }],
    breakTimeBetweenSessions: {
      type: Number,
      min: 0,
      max: 60,
      default: 15
    },
    emergencyResponsePolicy: {
      type: String,
      enum: ["24h Reply", "Within Business Hours", "Scheduled Only", "Emergency Hotline Referral"],
      default: "Within Business Hours"
    },
    sessionFee: {
      individual: { type: Number, min: 0 },
      couple: { type: Number, min: 0 },
      family: { type: Number, min: 0 },
      group: { type: Number, min: 0 }
    },
    refundReschedulePolicy: {
      type: String,
      trim: true,
      maxlength: [1000, "Policy cannot exceed 1000 characters"]
    },
    confidentialityAgreement: {
      type: Boolean,
      default: false
    },
    mandatoryReportingConsent: {
      type: Boolean,
      default: false
    },
    ethicalPracticeDeclaration: {
      type: Boolean,
      default: false
    },
    informedConsentPolicy: {
      type: String,
      trim: true,
      maxlength: [2000, "Policy cannot exceed 2000 characters"]
    },
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

doctSchema.pre("save", function(next) {
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (this.specializations && this.specializations.length > 0 && !this.specialization) {
    this.specialization = this.specializations[0];
  }
  if (this.yearsOfPractice !== undefined && this.experience === undefined) {
    this.experience = this.yearsOfPractice;
  }
  next();
});

doctSchema.index({ isActive: 1, priority: 1 });
doctSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("DOCT", doctSchema);
