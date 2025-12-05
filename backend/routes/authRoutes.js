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

// Google OAuth routes - allow account selection via query param or default
router.get("/google", (req, res, next) => {
  const prompt = req.query.prompt || "select_account"; // Allow account selection
  passport.authenticate("google", { 
    scope: ["profile", "email"], 
    prompt: prompt,
    accessType: "offline"
    // Removed approvalPrompt as it conflicts with prompt parameter in newer OAuth API
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/`, session: true }),
  async (req, res) => {
    try {
      if (!req.user?._id) {
        return res.redirect(`${process.env.CLIENT_URL}/?error=oauth_failed`);
      }

      // Set comprehensive session data
      req.session.userId = req.user._id;
      req.session.email = req.user.email;
      req.session.isAdmin = !!req.user.isAdmin;
      req.session.loginTime = Date.now();
      req.session.loginMethod = "google";

      // Save session and ensure cookie is set before redirect
      // CRITICAL: Must save session and wait for it to complete before redirect
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('[SESSION ERROR] OAuth callback - Session save failed:', {
              error: err.message,
              stack: err.stack,
              name: err.name,
              userId: req.user._id,
              email: req.user.email,
              ip: req.ip
            });
            return reject(err);
          }
          resolve();
        });
      });

      // Verify session was saved
      const sessionName = process.env.SESSION_NAME || "maitri.sid";
      const sessionId = req.sessionID;
      const isProduction = process.env.NODE_ENV === "production";
      
      console.log('[SESSION DEBUG] OAuth callback - Session saved, preparing redirect:', {
        sessionName,
        sessionId,
        userId: req.user._id,
        email: req.user.email,
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        cookieConfig: {
          secure: isProduction || process.env.FORCE_SECURE_COOKIES === "true",
          sameSite: (isProduction || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax",
          httpOnly: true,
          path: "/"
        }
      });

      // CRITICAL: Manually set the session cookie to ensure it's included in redirect
      // express-session should do this automatically, but we'll ensure it happens
      // The cookie will be set by express-session middleware, but we verify it's configured correctly
      const cookieConfig = {
        path: "/",
        httpOnly: true,
        secure: isProduction || process.env.FORCE_SECURE_COOKIES === "true",
        sameSite: (isProduction || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax",
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
      };
      
      // Note: We don't manually set the cookie here because express-session handles it
      // But we log to verify the configuration
      console.log('[SESSION DEBUG] Cookie will be set by express-session with config:', cookieConfig);

      // Redirect to splash if not seen, otherwise dashboard
      // express-session automatically sets the cookie in the redirect response
      const seenSplash = req.cookies?.seenSplash === "true" || false;
      const redirectUrl = seenSplash 
        ? `${process.env.CLIENT_URL}/dashboard` 
        : `${process.env.CLIENT_URL}/splash`;
      
      console.log('[SESSION DEBUG] OAuth callback - Redirecting to:', {
        redirectUrl,
        sessionId,
        userId: req.user._id,
        willSetCookie: true
      });
      
      // Use res.redirect which will include Set-Cookie header
      // express-session automatically sets the cookie in the redirect response
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('[SESSION ERROR] OAuth callback exception:', {
        error: err.message,
        stack: err.stack,
        name: err.name,
        userId: req.user?._id,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      return res.redirect(`${process.env.CLIENT_URL}/?error=server_error`);
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
        message: req.t("auth.invalidAdminPassword", "Invalid admin password"),
      });
    }

    // Ensure user is logged in
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: req.t("auth.loginFirstForAdmin", "Please login with Google first before accessing admin features"),
      });
    }

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: req.t("auth.incorrectAdminPassword", "Incorrect admin password"),
      });
    }

    // Fetch user
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("auth.userNotFound"),
      });
    }

    // Update user and session
    user.isAdmin = true;
    await user.save();

    req.session.isAdmin = true;
    req.session.adminLoginTime = Date.now();
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('[SESSION ERROR] Admin login - Session save failed:', {
            error: err.message,
            stack: err.stack,
            name: err.name,
            userId: user._id,
            email: user.email,
            ip: req.ip
          });
          return reject(err);
        }
        resolve();
      });
    });

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
    return res.status(500).json({
      success: false,
      message: req.t("auth.adminLoginFailed", "Admin login failed. Please try again."),
    });
  }
});


// Logout route
router.get("/logout", (req, res) => {
  const userEmail = req.session?.email || "unknown";
  const sessionName = process.env.SESSION_NAME || "maitri.sid";
  
  req.session.destroy((err) => {
    if (err) {
      console.error('[SESSION ERROR] Logout - Session destroy failed:', {
        error: err.message,
        stack: err.stack,
        name: err.name,
        userEmail,
        sessionName,
        ip: req.ip
      });
      return res.status(500).json({
        success: false,
        message: req.t("auth.logoutFailed")
      });
    }
    
    // Clear cookie with same configuration as session cookie
    const isProduction = process.env.NODE_ENV === "production";
    const cookieConfig = {
      path: "/",
      httpOnly: true,
      secure: isProduction || process.env.FORCE_SECURE_COOKIES === "true",
      sameSite: (isProduction || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax"
    };
    
    try {
      res.clearCookie(sessionName, cookieConfig);
    } catch (cookieErr) {
      console.error('[SESSION ERROR] Logout - Failed to clear cookie:', {
        error: cookieErr.message,
        sessionName,
        cookieConfig,
        userEmail
      });
    }
    
    return res.redirect(`${process.env.CLIENT_URL}/`);
  });
});

// Enhanced session check route
router.get("/session-check", async (req, res) => {
  try {
    const { userId, email, isAdmin } = req.session;
    const referer = req.get("Referer") || "";
    const onAdminPage = referer.includes("/admin");
    
    // Debug logging for cookie issues - ALWAYS log in production for debugging
    const cookieHeader = req.get("Cookie");
    const origin = req.get("Origin");
    const sessionName = process.env.SESSION_NAME || "maitri.sid";
    
    // Always log session check requests for debugging
    console.log("[SESSION DEBUG] Session Check Request:", {
      hasSessionId: !!userId,
      userId: userId || null,
      hasCookieHeader: !!cookieHeader,
      cookieHeader: cookieHeader ? cookieHeader.substring(0, 200) : null,
      cookieHeaderLength: cookieHeader ? cookieHeader.length : 0,
      hasSessionCookie: cookieHeader ? cookieHeader.includes(sessionName) : false,
      origin,
      sessionName,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      sessionId: req.sessionID || null,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      referer,
      timestamp: new Date().toISOString()
    });

    if (!userId) {
      // Return 200 with success: false instead of 401 to avoid console errors
      // 401 is technically correct but causes noise in browser console
      // Frontend handles success: false the same way
      const response = { 
        success: false, 
        message: req.t("auth.noActiveSession", "No active session"), 
        user: null 
      };
      
      // Always log this error for debugging
      console.error("[SESSION ERROR] No userId in session:", {
        hasSession: !!req.session,
        sessionId: req.sessionID || null,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        sessionData: req.session || null,
        hasCookieHeader: !!cookieHeader,
        cookieHeader: cookieHeader ? cookieHeader.substring(0, 200) : null,
        cookieHeaderLength: cookieHeader ? cookieHeader.length : 0,
        hasSessionCookie: cookieHeader ? cookieHeader.includes(sessionName) : false,
        origin,
        sessionName,
        ip: req.ip,
        referer,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString()
      });
      
      if (process.env.NODE_ENV === "development" || process.env.DEBUG_COOKIES === "true") {
        response.debug = {
          hasCookieHeader: !!cookieHeader,
          sessionName,
          origin,
          cookieConfig: {
            secure: process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true",
            sameSite: (process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax"
          }
        };
      }
      
      // Return 200 instead of 401 to reduce console noise
      // Frontend already handles success: false correctly
      return res.status(200).json(response);
    }

    if (onAdminPage && !isAdmin) {
      console.error("[SESSION ERROR] Admin access denied:", {
        userId,
        email,
        isAdmin,
        onAdminPage,
        ip: req.ip,
        referer
      });
      return res.status(403).json({ success: false, message: req.t("auth.adminRequired"), user: null });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.error("[SESSION ERROR] User not found in database:", {
        userId,
        email,
        ip: req.ip,
        sessionDestroyed: true
      });
      req.session.destroy((err) => {
        if (err) {
          console.error("[SESSION ERROR] Failed to destroy session after user not found:", {
            error: err.message,
            userId
          });
        }
      });
      return res.status(401).json({ success: false, message: req.t("auth.userNotFound"), user: null });
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
    console.error("[SESSION ERROR] Session check exception:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      ip: req.ip,
      userId: req.session?.userId
    });
    res.status(500).json({ success: false, message: req.t("auth.sessionCheckFailed", "Session check failed"), error: err.message });
  }
});

// Session info route (alternative to session-check)
router.get("/session-info", getSessionInfo);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: req.t ? req.t("auth.serviceHealthy", "Auth service is healthy") : "Auth service is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Cookie debug endpoint - helps diagnose cookie issues
router.get("/cookie-debug", (req, res) => {
  const cookieHeader = req.get("Cookie");
  const origin = req.get("Origin");
  const sessionName = process.env.SESSION_NAME || "maitri.sid";
  const hasSession = !!req.session?.userId;
  
  const response = {
    success: true,
    cookieInfo: {
      hasCookieHeader: !!cookieHeader,
      cookieHeader: cookieHeader ? cookieHeader.substring(0, 200) : null,
      hasSessionCookie: cookieHeader ? cookieHeader.includes(sessionName) : false,
      sessionName,
      origin,
      hasActiveSession: hasSession,
      sessionUserId: req.session?.userId || null,
      sessionId: req.sessionID || null,
      sessionKeys: req.session ? Object.keys(req.session) : []
    },
    cookieConfig: {
      secure: process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true",
      sameSite: (process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax",
      httpOnly: true,
      path: "/",
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      clientUrl: process.env.CLIENT_URL,
      corsOrigin: process.env.CORS_ORIGIN,
    },
    recommendations: []
  };
  
  // Add recommendations based on findings
  if (!cookieHeader) {
    response.recommendations.push("No Cookie header received. Check if withCredentials is set in frontend requests.");
  }
  
  if (cookieHeader && !cookieHeader.includes(sessionName)) {
    response.recommendations.push(`Cookie header exists but doesn't contain session cookie '${sessionName}'. Check cookie name configuration.`);
  }
  
  if (origin && !hasSession) {
    response.recommendations.push("Cross-site request detected but no active session. Ensure cookies are set with SameSite=None and Secure=true.");
  }
  
  res.json(response);
});

// Cookie test endpoint - sets a test cookie to verify cookie setting works
router.get("/cookie-test", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieConfig = {
    path: "/",
    httpOnly: true,
    secure: isProduction || process.env.FORCE_SECURE_COOKIES === "true",
    sameSite: (isProduction || process.env.FORCE_SECURE_COOKIES === "true") ? "none" : "lax",
    maxAge: 86400000 // 24 hours
  };
  
  // Set a test cookie
  const testCookieValue = `test-${Date.now()}`;
  res.cookie("maitri-test-cookie", testCookieValue, cookieConfig);
  
  console.log('[COOKIE TEST] Setting test cookie:', {
    cookieName: "maitri-test-cookie",
    cookieValue: testCookieValue,
    cookieConfig,
    origin: req.get("Origin")
  });
  
  res.json({
    success: true,
    message: "Test cookie set",
    testCookie: {
      name: "maitri-test-cookie",
      value: testCookieValue,
      config: cookieConfig
    },
    instructions: "Check browser DevTools → Application → Cookies to see if cookie was set. Then make another request to /auth/cookie-test to see if cookie is sent back."
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
        message: req.t("auth.invalidLanguage", "Invalid language. Supported languages: en, hi, as")
      });
    }

    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: req.t("auth.loginRequired")
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
      message: req.t("auth.languageUpdated", "Language preference updated successfully"),
      language: language
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: req.t("auth.languageUpdateFailed", "Failed to update language preference")
    });
  }
});

module.exports = router;
