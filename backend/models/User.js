const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  password: {
    type: String,
    minlength: 6,
    select: false // hide password by default when querying
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // allows multiple users without googleId
  },
  avatar: {
    type: String, // URL of profile picture
    default: ""   // empty string if not set
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt & updatedAt automatically
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
