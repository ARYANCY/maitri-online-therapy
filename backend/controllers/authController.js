const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const { validate, schemas } = require("../middleware/validation");

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

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  logger.info(`Login attempt for email: ${email}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
  });

  // Input validation
  if (!email || !password) {
    logger.warn('Login attempt with missing credentials', {
      email: email ? 'provided' : 'missing',
      password: password ? 'provided' : 'missing',
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(400).json({ 
      success: false,
      error: "Email and password are required" 
    });
  }

  if (!validateEmail(email)) {
    logger.warn('Login attempt with invalid email format', {
      email,
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(400).json({ 
      success: false,
      error: "Please provide a valid email address" 
    });
  }

  if (!validatePassword(password)) {
    logger.warn('Login attempt with invalid password format', {
      email,
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(400).json({ 
      success: false,
      error: "Password must be at least 6 characters long" 
    });
  }

  // Rate limiting check
  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    logger.warn('Login attempt blocked by rate limit', {
      email,
      ip: req.ip,
      timeLeft: rateLimit.timeLeft,
      requestId: req.id,
    });
    return res.status(429).json({ 
      success: false,
      error: rateLimit.message 
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    recordLoginAttempt(email, false);
    logger.warn('Login attempt with non-existent email', {
      email,
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: "Invalid credentials" 
    });
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    recordLoginAttempt(email, false);
    logger.warn('Login attempt with incorrect password', {
      email,
      userId: user._id,
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: "Invalid credentials" 
    });
  }

  // Check admin status
  const isAdmin = user.isAdmin || isAdminEmail(email) || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
  if (isAdmin && !user.isAdmin) { 
    user.isAdmin = true; 
    await user.save();
    logger.info('User granted admin privileges', {
      email,
      userId: user._id,
      ip: req.ip,
      requestId: req.id,
    });
  }

  // Record successful login
  recordLoginAttempt(email, true);

  // Set session
  req.session.userId = user._id;
  req.session.isAdmin = isAdmin;
  req.session.email = user.email;
  req.session.loginTime = Date.now();
  req.session.loginMethod = 'email';

  req.session.save(err => {
    if (err) {
      logger.error('Session save error during login', {
        error: err.message,
        email,
        userId: user._id,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(500).json({ 
        success: false,
        error: "Session save failed" 
      });
    }
    
    logger.info('User logged in successfully', {
      email,
      userId: user._id,
      isAdmin,
      ip: req.ip,
      requestId: req.id,
    });
    
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
        loginMethod: req.session.loginMethod,
        isAdmin: isAdmin
      }
    });
  });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { token, adminPassword } = req.body;

  logger.info('Google login attempt', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
  });

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

  // Admin password check
  const isAdmin = user.isAdmin || (adminPassword && adminPassword === process.env.ADMIN_PASSWORD);

  if (isAdmin && !user.isAdmin) {
    user.isAdmin = true;
    await user.save();
    logger.info('User granted admin privileges via Google login', {
      email,
      userId: user._id,
      ip: req.ip,
      requestId: req.id,
    });
  }

  // Set session
  req.session.userId = user._id;
  req.session.isAdmin = isAdmin;
  req.session.email = user.email;
  req.session.loginTime = Date.now();
  req.session.loginMethod = 'google';

  req.session.save(err => {
    if (err) {
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
        loginMethod: req.session.loginMethod,
        isAdmin
      }
    });
  });
});


exports.requireLogin = (req, res, next) => {
  if (!req.session?.userId) {
    logger.warn('Unauthorized access attempt', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
    });
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
    logger.warn('Unauthorized admin access attempt', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please login" 
    });
  }
  
  const url = req.originalUrl || "";
  if (url.startsWith("/api/admin") || url.startsWith("/admin")) {
    if (!req.session.isAdmin) {
      logger.warn('Non-admin user attempted admin access', {
        url: req.originalUrl,
        method: req.method,
        userId: req.session.userId,
        email: req.session.email,
        ip: req.ip,
        requestId: req.id,
      });
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
  const userId = req.session?.userId;
  const email = req.session?.email;
  
  if (!req.session) {
    return res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  }
  
  req.session.destroy(err => {
    if (err) {
      logger.error('Logout error', {
        error: err.message,
        userId,
        email,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(500).json({ 
        success: false,
        message: "Logout failed" 
      });
    }
    
    logger.info('User logged out successfully', {
      userId,
      email,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.clearCookie("connect.sid");
    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  });
};

exports.getSessionInfo = asyncHandler(async (req, res) => {
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
    logger.warn('Session check failed - user not found in database', {
      userId,
      email,
      ip: req.ip,
      requestId: req.id,
    });
    return res.json({ 
      success: false, 
      user: null,
      message: "User not found" 
    });
  }

  // Update admin status if needed
const currentAdminStatus = user.isAdmin || isAdminEmail(email);
  if (currentAdminStatus !== isAdmin) {
    user.isAdmin = currentAdminStatus;
    await user.save();
    req.session.isAdmin = currentAdminStatus;
    logger.info('User admin status updated during session check', {
      userId,
      email,
      oldStatus: isAdmin,
      newStatus: currentAdminStatus,
      ip: req.ip,
      requestId: req.id,
    });
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
});
