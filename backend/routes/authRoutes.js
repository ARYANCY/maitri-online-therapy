const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/User");
const { getSessionInfo } = require("../controllers/authController");
const { updateUserLanguage } = require("../utils/i18n");

// Rate limiting middleware
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: "Too many login attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 admin login attempts per windowMs
  message: {
    success: false,
    error: "Too many admin login attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: true }),
  async (req, res) => {
    try {
      if (!req.user?._id) {
        console.error("Google OAuth: No user data received");
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }

      // Set comprehensive session data
      req.session.userId = req.user._id;
      req.session.email = req.user.email;
      req.session.isAdmin = !!req.user.isAdmin;
      req.session.loginTime = Date.now();
      req.session.loginMethod = "google";

      req.session.save(err => {
        if (err) {
          console.error("Google OAuth session save error:", err);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=session_failed`);
        }
        
        // Always redirect to dashboard first, let frontend handle admin redirects
        const redirectUrl = `${process.env.CLIENT_URL}/splash`;
        
        console.log(`Google OAuth success: User ${req.user.email} redirected to ${redirectUrl}`);
        return res.redirect(redirectUrl);
      });
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

// Admin login route with rate limiting
router.post("/admin-login", adminLoginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    // Input validation
    if (!password || typeof password !== "string" || password.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin password",
      });
    }

    // Ensure user is logged in
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: "Please login with Google first before accessing admin features",
      });
    }

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      console.warn(`Admin login attempt with incorrect password from user: ${req.session.email}`);
      return res.status(401).json({
        success: false,
        message: "Incorrect admin password",
      });
    }

    // Fetch user
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error(`Admin login: User not found for session userId: ${req.session.userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user and session
    user.isAdmin = true;
    await user.save();

    req.session.isAdmin = true;
    req.session.adminLoginTime = Date.now();
    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    console.log(`Admin login success: User ${user.email} granted admin access`);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: true,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      sessionInfo: {
        adminLoginTime: req.session.adminLoginTime,
        isAdmin: true,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({
      success: false,
      message: "Admin login failed. Please try again.",
    });
  }
});


// Logout route
router.get("/logout", (req, res) => {
  const userEmail = req.session?.email || "unknown";
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout session destroy error:", err);
      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }
    
    res.clearCookie("connect.sid", { 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    
    console.log(`User ${userEmail} logged out successfully`);
    return res.redirect(`${process.env.CLIENT_URL}/`);
  });
});

// Enhanced session check route
router.get("/session-check", async (req, res) => {
  try {
    const { userId, email, isAdmin } = req.session;
    const referer = req.get("Referer") || "";
    const onAdminPage = referer.includes("/admin");

    if (!userId) {
      return res.status(401).json({ success: false, message: "No active session", user: null });
    }

    if (onAdminPage && !isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required", user: null });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ success: false, message: "User not found", user: null });
    }

    // Use session-stored admin status
    const sessionAdmin = !!req.session.isAdmin;

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: sessionAdmin,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      sessionInfo: {
        loginTime: req.session.loginTime,
        loginMethod: req.session.loginMethod,
        isAdmin: sessionAdmin,
        adminLoginTime: req.session.adminLoginTime,
        sessionAge: req.session.loginTime ? Date.now() - req.session.loginTime : 0,
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    res.status(500).json({ success: false, message: "Session check failed", error: err.message });
  }
});

// Session info route (alternative to session-check)
router.get("/session-info", getSessionInfo);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Language preference update route
router.post("/update-language", async (req, res) => {
  try {
    const { language } = req.body;
    const supportedLanguages = ['en', 'hi', 'as'];
    
    if (!language || !supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Supported languages: en, hi, as"
      });
    }

    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    // Update user's language preference in database
    await User.findByIdAndUpdate(req.session.userId, {
      preferredLanguage: language
    });

    // Update session language
    updateUserLanguage(req, language);

    res.json({
      success: true,
      message: "Language preference updated successfully",
      language: language
    });
  } catch (err) {
    console.error("Language update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update language preference"
    });
  }
});

module.exports = router;
