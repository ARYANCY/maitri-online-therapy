const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

const isAdminEmail = (email) => {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .includes(email?.toLowerCase());
};

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now };
  
  // Reset if lockout period has passed
  if (now - attempts.firstAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(identifier);
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeLeft = LOCKOUT_TIME - (now - attempts.firstAttempt);
    return { 
      allowed: false, 
      timeLeft: Math.ceil(timeLeft / 1000),
      message: `Too many login attempts. Please wait ${Math.ceil(timeLeft / 60000)} minutes.`
    };
  }
  
  return { 
    allowed: true, 
    remaining: MAX_LOGIN_ATTEMPTS - attempts.count 
  };
};

const recordLoginAttempt = (identifier, success) => {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }
  
  const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: Date.now() };
  attempts.count++;
  loginAttempts.set(identifier, attempts);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.googleId;
  return userObj;
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Email and password are required" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Please provide a valid email address" 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false,
        error: "Password must be at least 6 characters long" 
      });
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        success: false,
        error: rateLimit.message 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      recordLoginAttempt(email, false);
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      recordLoginAttempt(email, false);
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Check admin status
    const isAdmin = isAdminEmail(email) || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
    if (isAdmin && !user.isAdmin) { 
      user.isAdmin = true; 
      await user.save(); 
    }

    // Record successful login
    recordLoginAttempt(email, true);

    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = isAdmin;
    req.session.email = user.email;
    req.session.loginTime = Date.now();

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ 
          success: false,
          error: "Session save failed" 
        });
      }
      
      res.json({ 
        success: true, 
        user: sanitizeUser({ 
          _id: user._id, 
          email: user.email, 
          name: user.name, 
          isAdmin,
          avatar: user.avatar,
          createdAt: user.createdAt
        }),
        sessionInfo: {
          loginTime: req.session.loginTime,
          isAdmin: isAdmin
        }
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      error: "Login failed. Please try again later." 
    });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "Google token is required" 
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({ 
      idToken: token, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Google token" 
      });
    }

    const email = payload.email?.toLowerCase();
    const name = payload.name || "Unknown User";
    const avatar = payload.picture || "";

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Google account missing email" 
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ 
        email, 
        name, 
        googleId: payload.sub, 
        avatar, 
        password: "", 
        isAdmin: false 
      });
    } else {
      // Update user info if needed
      if (!user.avatar && avatar) user.avatar = avatar;
      if (!user.name || user.name === "Unknown User") user.name = name;
      await user.save();
    }

    // Check admin status
    const isAdmin = isAdminEmail(email);
    if (isAdmin && !user.isAdmin) { 
      user.isAdmin = true; 
      await user.save(); 
    }

    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = isAdmin;
    req.session.email = user.email;
    req.session.loginTime = Date.now();

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Session save failed" 
        });
      }
      
      res.json({ 
        success: true, 
        user: sanitizeUser({ 
          _id: user._id, 
          email: user.email, 
          name: user.name, 
          isAdmin,
          avatar: user.avatar,
          createdAt: user.createdAt
        }),
        sessionInfo: {
          loginTime: req.session.loginTime,
          isAdmin: isAdmin
        }
      });
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ 
      success: false,
      message: "Google login failed", 
      error: err.message 
    });
  }
};

exports.requireLogin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please login" 
    });
  }
  
  req.user = { 
    _id: req.session.userId, 
    isAdmin: req.session.isAdmin || false,
    email: req.session.email,
    loginTime: req.session.loginTime
  };
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please login" 
    });
  }
  
  const url = req.originalUrl || "";
  if (url.startsWith("/api/admin") || url.startsWith("/admin")) {
    if (!req.session.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: "Admin access only" 
      });
    }
  }
  
  req.user = { 
    _id: req.session.userId, 
    isAdmin: !!req.session.isAdmin,
    email: req.session.email,
    loginTime: req.session.loginTime
  };
  next();
};

exports.logoutUser = (req, res) => {
  if (!req.session) {
    return res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  }
  
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Logout failed" 
      });
    }
    
    res.clearCookie("connect.sid");
    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  });
};

exports.getSessionInfo = async (req, res) => {
  try {
    const { userId, email, isAdmin, loginTime } = req.session;
    
    if (!userId) {
      return res.json({ 
        success: false, 
        user: null,
        message: "No active session" 
      });
    }

    // Fetch fresh user data
    const user = await User.findById(userId).select("-password");
    if (!user) {
      // User was deleted, destroy session
      req.session.destroy();
      return res.json({ 
        success: false, 
        user: null,
        message: "User not found" 
      });
    }

    // Update admin status if needed
    const currentAdminStatus = isAdminEmail(email);
    if (currentAdminStatus !== isAdmin) {
      user.isAdmin = currentAdminStatus;
      await user.save();
      req.session.isAdmin = currentAdminStatus;
    }

    res.json({ 
      success: true, 
      user: sanitizeUser({
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: currentAdminStatus,
        avatar: user.avatar,
        createdAt: user.createdAt
      }),
      sessionInfo: {
        loginTime: loginTime,
        isAdmin: currentAdminStatus,
        sessionAge: loginTime ? Date.now() - loginTime : 0
      }
    });
  } catch (err) {
    console.error("Session info error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to get session info" 
    });
  }
};
