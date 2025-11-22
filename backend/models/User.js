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
    minlength: 0,
    select: false 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  avatar: {
    type: String,
    default: ""
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'as'],
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) return false;
  if (!this.password) return false; 
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.path("password").validate(function(value) {
  if (this.googleId) return true; 
  return value && value.length >= 0;
}, "Password must be at least 6 characters long");

module.exports = mongoose.model("User", userSchema);
