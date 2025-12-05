const logger = require('../utils/logger');

/**
 * Middleware to debug cookie and CORS issues
 * Logs cookie information, CORS headers, and potential issues
 * Always enabled to help debug cookie issues
 */
const cookieDebug = (req, res, next) => {
  // Always log cookie debug info for session issues
  const shouldLog = process.env.NODE_ENV === "development" || process.env.DEBUG_COOKIES === "true" || true; // Always log for now
  
  if (shouldLog) {
    const origin = req.get('Origin');
    const cookieHeader = req.get('Cookie');
    const userAgent = req.get('User-Agent');
    const sessionName = process.env.SESSION_NAME || "maitri.sid";
    
    // Detect browser type
    const browser = userAgent?.includes('Safari') && !userAgent?.includes('Chrome') ? 'Safari' :
                    userAgent?.includes('Firefox') ? 'Firefox' :
                    userAgent?.includes('Chrome') ? 'Chrome' :
                    userAgent?.includes('Brave') ? 'Brave' : 'Unknown';

    console.log('[COOKIE DEBUG] Request:', {
      method: req.method,
      path: req.path,
      origin,
      hasCookie: !!cookieHeader,
      hasSessionCookie: cookieHeader ? cookieHeader.includes(sessionName) : false,
      cookieCount: cookieHeader ? cookieHeader.split(';').length : 0,
      cookieHeader: cookieHeader ? cookieHeader.substring(0, 200) : null,
      userAgent: userAgent?.substring(0, 100),
      browser,
      protocol: req.protocol,
      secure: req.secure,
      host: req.get('Host'),
      sessionId: req.sessionID || null,
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : []
    });

    // Check for potential issues
    if (origin && !req.secure && process.env.NODE_ENV === 'production') {
      console.warn('[COOKIE DEBUG] Cross-site request without HTTPS - cookies may be blocked');
    }

    // Browser-specific warnings for cookie blocking
    if (origin && !cookieHeader) {
      if (browser === 'Safari') {
        console.error('[COOKIE DEBUG] Safari detected with no cookies - Safari ITP is likely blocking cookies');
        console.error('[COOKIE DEBUG] Safari ITP blocks ALL third-party cookies by default since 2020');
        console.error('[COOKIE DEBUG] Safari fix: Settings → Safari → Privacy → Uncheck "Prevent Cross-Site Tracking"');
        console.error('[COOKIE DEBUG] Note: Safari ITP expires cookies after 7 days of no user interaction');
        console.error('[COOKIE DEBUG] Recommendation: Use same-site domain or implement JWT token fallback');
      } else if (browser === 'Firefox') {
        console.warn('[COOKIE DEBUG] Firefox detected with no cookies - Firefox may be blocking third-party cookies');
        console.warn('[COOKIE DEBUG] Firefox fix: Settings → Privacy & Security → Enhanced Tracking Protection → Standard/Custom (allow cookies)');
        console.warn('[COOKIE DEBUG] Or add exceptions: Cookies and Site Data → Manage Exceptions → Add both frontend and backend domains');
      } else if (browser === 'Chrome' || browser === 'Brave') {
        console.warn('[COOKIE DEBUG] Chrome/Brave detected with no cookies - Third-party cookies may be blocked');
        console.warn('[COOKIE DEBUG] Chrome fix: Settings → Privacy and security → Third-party cookies → Allow');
        console.warn('[COOKIE DEBUG] Note: Chrome is phasing out third-party cookies in 2024');
      }
      
      // General cross-site cookie warning
      console.warn('[COOKIE DEBUG] Cross-site cookie blocking detected:', {
        frontendDomain: origin,
        backendDomain: req.get('Host'),
        browser,
        reason: 'Third-party cookie restrictions'
      });
    }

    // Log response headers - intercept both send and redirect
    const originalSend = res.send;
    const originalRedirect = res.redirect;
    
    res.send = function(data) {
      logCookieHeaders(req, res, 'send');
      return originalSend.call(this, data);
    };
    
    res.redirect = function(url) {
      logCookieHeaders(req, res, 'redirect');
      return originalRedirect.call(this, url);
    };
    
    function logCookieHeaders(req, res, method) {
      const setCookieHeader = res.get('Set-Cookie');
      const origin = req.get('Origin');
      const sessionName = process.env.SESSION_NAME || "maitri.sid";
      
      if (setCookieHeader) {
        const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        console.log(`[COOKIE DEBUG] ${method.toUpperCase()} - Set-Cookie header:`, {
          path: req.path,
          method: req.method,
          setCookie: cookieArray,
          cookieCount: cookieArray.length,
          hasSessionCookie: cookieArray.some(c => c.includes(sessionName))
        });
        
        // Check cookie attributes
        const sessionCookie = cookieArray.find(c => c.includes(sessionName));
        if (sessionCookie) {
          const hasSecure = sessionCookie.includes('Secure');
          const hasSameSiteNone = sessionCookie.includes('SameSite=None');
          const hasSameSiteLax = sessionCookie.includes('SameSite=Lax');
          const hasHttpOnly = sessionCookie.includes('HttpOnly');
          
          console.log(`[COOKIE DEBUG] Session cookie attributes:`, {
            hasSecure,
            hasSameSiteNone,
            hasSameSiteLax,
            hasHttpOnly,
            cookieString: sessionCookie.substring(0, 300)
          });
          
          if (hasSameSiteNone && !hasSecure) {
            console.error('[COOKIE DEBUG] CRITICAL: SameSite=None without Secure flag - browser will reject cookie!');
          }
          
          if (origin && !hasSameSiteNone && !hasSameSiteLax) {
            console.warn('[COOKIE DEBUG] Cross-site request but cookie not set to SameSite=None');
          }
        } else {
          console.warn(`[COOKIE DEBUG] Set-Cookie header present but session cookie '${sessionName}' not found:`, {
            cookies: cookieArray.map(c => c.substring(0, 50))
          });
        }
      } else {
        console.warn(`[COOKIE DEBUG] No Set-Cookie header in ${method} response:`, {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          hasSession: !!req.session,
          sessionId: req.sessionID
        });
      }
      
      const corsOrigin = res.get('Access-Control-Allow-Origin');
      const corsCredentials = res.get('Access-Control-Allow-Credentials');
      
      if (origin) {
        console.log('[COOKIE DEBUG] CORS headers:', {
          path: req.path,
          method: req.method,
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Credentials': corsCredentials,
          origin: origin
        });
        
        if (!corsOrigin || corsOrigin === '*') {
          console.warn('[COOKIE DEBUG] CORS origin not properly configured for credentials');
        }
        
        if (corsOrigin === '*' && corsCredentials === 'true') {
          console.error('[COOKIE DEBUG] CRITICAL: Cannot use wildcard CORS origin with credentials!');
        }
      }
    }
  }
  
  next();
};

module.exports = cookieDebug;
