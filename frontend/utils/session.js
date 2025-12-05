

const SESSION_STORAGE_KEY = 'maitri_session';
const SESSION_VERSION = '1.0'; 
const SESSION_KEYS = {
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  IS_ADMIN: 'isAdmin',
  SESSION_TIME: 'sessionTime',
  PREFERRED_LANG: 'preferredLang',
  ADMIN_SESSION: 'admin_session',
  ADMIN_EMAIL: 'adminEmail', 
};




function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}


export function storeUserSession(user, sessionInfo = null) {
  if (!isStorageAvailable()) {
    console.warn('[Session] localStorage is not available');
    return false;
  }

  if (!user || !user._id) {
    console.error('[Session] Invalid user data provided:', { 
      hasUser: !!user, 
      hasId: !!(user?._id) 
    });
    return false;
  }

  try {
    
    const userId = String(user._id || '').trim();
    const userEmail = String(user.email || '').trim();
    const userName = String(user.name || '').trim();
    const isAdmin = Boolean(user.isAdmin);
    const preferredLang = String(user.preferredLang || localStorage.getItem(SESSION_KEYS.PREFERRED_LANG) || 'en').trim();
    
    if (!userId) {
      console.error('[Session] User ID is required');
      return false;
    }

    const sessionData = {
      version: SESSION_VERSION,
      userId,
      userEmail,
      userName,
      isAdmin,
      sessionTime: Date.now(),
      preferredLang,
      sessionInfo: sessionInfo || null,
      avatar: user.avatar || null,
      createdAt: user.createdAt || null,
      lastUpdated: Date.now(),
    };

    
    const sessionDataStr = JSON.stringify(sessionData);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionDataStr);

    
    try {
      localStorage.setItem(SESSION_KEYS.USER_ID, sessionData.userId);
      localStorage.setItem(SESSION_KEYS.USER_EMAIL, sessionData.userEmail);
      localStorage.setItem(SESSION_KEYS.USER_NAME, sessionData.userName);
      localStorage.setItem(SESSION_KEYS.IS_ADMIN, sessionData.isAdmin ? 'true' : 'false');
      localStorage.setItem(SESSION_KEYS.SESSION_TIME, sessionData.sessionTime.toString());
      
      if (sessionData.preferredLang) {
        localStorage.setItem(SESSION_KEYS.PREFERRED_LANG, sessionData.preferredLang);
      }
    } catch (individualError) {
      
      console.warn('[Session] Failed to store some individual keys:', individualError);
    }

    if (import.meta.env.DEV) {
      console.log('[Session] Stored session info:', {
        userId: sessionData.userId,
        email: sessionData.userEmail,
        name: sessionData.userName,
        isAdmin: sessionData.isAdmin,
        sessionTime: new Date(sessionData.sessionTime).toISOString(),
        hasSessionInfo: !!sessionInfo,
      });
    }

    return true;
  } catch (error) {
    
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error('[Session] Storage quota exceeded. Clearing old data...');
      try {
        
        clearUserSession();
        
        return storeUserSession(user, sessionInfo);
      } catch (retryError) {
        console.error('[Session] Failed to store session after quota clear:', retryError);
        return false;
      }
    }

    console.error('[Session] Failed to store session:', {
      error: error.message,
      name: error.name,
      code: error.code,
      userId: user?._id,
      stack: error.stack,
    });
    return false;
  }
}


export function getUserSession() {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    
    const sessionDataStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionDataStr) {
      try {
        const sessionData = JSON.parse(sessionDataStr);
        
        if (sessionData && sessionData.userId && sessionData.sessionTime) {
          
          return {
            version: sessionData.version || SESSION_VERSION,
            userId: String(sessionData.userId || '').trim(),
            userEmail: String(sessionData.userEmail || '').trim(),
            userName: String(sessionData.userName || '').trim(),
            isAdmin: Boolean(sessionData.isAdmin),
            sessionTime: Number(sessionData.sessionTime) || 0,
            preferredLang: String(sessionData.preferredLang || 'en').trim(),
            sessionInfo: sessionData.sessionInfo || null,
            avatar: sessionData.avatar || null,
            createdAt: sessionData.createdAt || null,
            lastUpdated: sessionData.lastUpdated || sessionData.sessionTime,
          };
        } else {
          
          console.warn('[Session] Invalid session data structure, clearing...');
          clearUserSession();
        }
      } catch (parseError) {
        console.error('[Session] Failed to parse session data:', parseError);
        
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    
    const userId = localStorage.getItem(SESSION_KEYS.USER_ID);
    if (!userId || userId.trim() === '') {
      return null;
    }

    
    const sessionTime = parseInt(localStorage.getItem(SESSION_KEYS.SESSION_TIME) || '0', 10);
    if (!sessionTime || sessionTime === 0) {
      return null;
    }

    const reconstructedSession = {
      version: SESSION_VERSION,
      userId: String(userId).trim(),
      userEmail: String(localStorage.getItem(SESSION_KEYS.USER_EMAIL) || '').trim(),
      userName: String(localStorage.getItem(SESSION_KEYS.USER_NAME) || '').trim(),
      isAdmin: localStorage.getItem(SESSION_KEYS.IS_ADMIN) === 'true',
      sessionTime,
      preferredLang: String(localStorage.getItem(SESSION_KEYS.PREFERRED_LANG) || 'en').trim(),
      sessionInfo: null,
      avatar: null,
      createdAt: null,
      lastUpdated: sessionTime,
    };

    
    try {
      storeUserSession({
        _id: reconstructedSession.userId,
        email: reconstructedSession.userEmail,
        name: reconstructedSession.userName,
        isAdmin: reconstructedSession.isAdmin,
        preferredLang: reconstructedSession.preferredLang,
      });
    } catch (migrationError) {
      console.warn('[Session] Failed to migrate to consolidated storage:', migrationError);
    }

    return reconstructedSession;
  } catch (error) {
    console.error('[Session] Failed to get session:', error);
    return null;
  }
}


export function clearUserSession(clearAdminSession = true) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.warn('[Session] Failed to remove consolidated storage:', err);
    }

    
    const keysToRemove = [
      SESSION_KEYS.USER_ID,
      SESSION_KEYS.USER_EMAIL,
      SESSION_KEYS.USER_NAME,
      SESSION_KEYS.IS_ADMIN,
      SESSION_KEYS.SESSION_TIME,
      SESSION_KEYS.ADMIN_EMAIL, 
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        
        console.warn(`[Session] Failed to remove key ${key}:`, err);
      }
    });

    
    if (clearAdminSession) {
      try {
        localStorage.removeItem(SESSION_KEYS.ADMIN_SESSION);
      } catch (err) {
        console.warn('[Session] Failed to remove admin session:', err);
      }
    }

    if (import.meta.env.DEV) {
      console.log('[Session] Cleared session info');
    }

    return true;
  } catch (error) {
    console.error('[Session] Failed to clear session:', {
      error: error.message,
      name: error.name,
      stack: error.stack,
    });
    return false;
  }
}


export function updateUserSession(updates) {
  if (!isStorageAvailable()) {
    return false;
  }

  const currentSession = getUserSession();
  if (!currentSession) {
    console.warn('[Session] No session to update');
    return false;
  }

  const updatedSession = {
    ...currentSession,
    ...updates,
    sessionTime: currentSession.sessionTime, 
  };

  return storeUserSession({
    _id: updatedSession.userId,
    email: updatedSession.userEmail,
    name: updatedSession.userName,
    isAdmin: updatedSession.isAdmin,
    preferredLang: updatedSession.preferredLang,
    avatar: updatedSession.avatar,
    createdAt: updatedSession.createdAt,
  }, updatedSession.sessionInfo);
}


export function isUserLoggedIn() {
  const session = getUserSession();
  return session !== null && session.userId !== '';
}


export function getUserId() {
  const session = getUserSession();
  return session?.userId || null;
}


export function getUserEmail() {
  const session = getUserSession();
  return session?.userEmail || null;
}


export function getUserName() {
  const session = getUserSession();
  return session?.userName || null;
}


export function isAdmin() {
  const session = getUserSession();
  return session?.isAdmin || false;
}


export function storePreferredLang(lang) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(SESSION_KEYS.PREFERRED_LANG, lang);
    
    const session = getUserSession();
    if (session) {
      updateUserSession({ preferredLang: lang });
    }
    return true;
  } catch (error) {
    console.error('[Session] Failed to store preferred language:', error);
    return false;
  }
}


export function getPreferredLang() {
  if (!isStorageAvailable()) {
    return 'en';
  }

  try {
    const session = getUserSession();
    return session?.preferredLang || localStorage.getItem(SESSION_KEYS.PREFERRED_LANG) || 'en';
  } catch (error) {
    console.error('[Session] Failed to get preferred language:', error);
    return 'en';
  }
}


export function storeAdminSession(adminSession) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(SESSION_KEYS.ADMIN_SESSION, JSON.stringify(adminSession));
    return true;
  } catch (error) {
    console.error('[Session] Failed to store admin session:', error);
    return false;
  }
}


export function getAdminSession() {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const adminSessionStr = localStorage.getItem(SESSION_KEYS.ADMIN_SESSION);
    if (adminSessionStr) {
      return JSON.parse(adminSessionStr);
    }
    return null;
  } catch (error) {
    console.error('[Session] Failed to get admin session:', error);
    return null;
  }
}


export function clearAdminSession() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(SESSION_KEYS.ADMIN_SESSION);
    return true;
  } catch (error) {
    console.error('[Session] Failed to clear admin session:', error);
    return false;
  }
}


export function isSessionValid(maxAgeMs = 24 * 60 * 60 * 1000) {
  const session = getUserSession();
  if (!session || !session.sessionTime) {
    return false;
  }

  const age = Date.now() - session.sessionTime;
  return age < maxAgeMs;
}


export function getUserObject() {
  const session = getUserSession();
  if (!session) {
    return null;
  }

  return {
    _id: session.userId,
    email: session.userEmail,
    name: session.userName,
    isAdmin: session.isAdmin,
    preferredLang: session.preferredLang,
    avatar: session.avatar,
    createdAt: session.createdAt,
  };
}


export function refreshSession() {
  const session = getUserSession();
  if (!session) {
    return false;
  }

  return updateUserSession({
    lastUpdated: Date.now(),
  });
}


export function getSessionAge() {
  const session = getUserSession();
  if (!session || !session.sessionTime) {
    return null;
  }

  return Date.now() - session.sessionTime;
}


export function needsSessionRefresh(refreshThresholdMs = 60 * 60 * 1000) {
  const session = getUserSession();
  if (!session || !session.lastUpdated) {
    return true;
  }

  const age = Date.now() - session.lastUpdated;
  return age > refreshThresholdMs;
}

