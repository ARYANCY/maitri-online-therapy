const translations = {
  en: {
    // Chatbot messages
    chatbot: {
      welcome: "Hello! I'm your therapist chatbot. How are you feeling today?",
      error: "Sorry, I couldn't process that message.",
      emptyMessage: "Message cannot be empty",
      unauthorized: "Unauthorized access",
      processing: "Processing your message...",
      suggestions: {
        greeting: "Hi there! How can I help you today?",
        stress: "I'm feeling stressed and overwhelmed",
        anxiety: "I'm experiencing anxiety",
        sadness: "I'm feeling sad and down",
        sleep: "I'm having trouble sleeping",
        relationships: "I'm struggling with relationships",
        work: "I'm having work-related issues",
        general: "I just need someone to talk to"
      },
      responses: {
        empathetic: "I understand how you're feeling. That sounds really difficult.",
        supportive: "You're not alone in this. Many people experience similar feelings.",
        encouraging: "It's brave of you to share this. Taking care of your mental health is important.",
        practical: "Let's work through this together. What would help you feel better?",
        validating: "Your feelings are completely valid. It's okay to feel this way."
      }
    },
    
    // Authentication messages
    auth: {
      loginRequired: "Please login to access this feature",
      sessionExpired: "Your session has expired. Please login again",
      invalidCredentials: "Invalid credentials",
      accountCreated: "Account created successfully",
      loginSuccess: "Login successful",
      logoutSuccess: "Logged out successfully",
      unauthorized: "Unauthorized access",
      adminRequired: "Admin access required"
    },
    
    // Reminder messages
    reminder: {
      created: "Reminder scheduled successfully",
      cancelled: "Reminder cancelled successfully",
      notFound: "Reminder not found",
      limitReached: "Maximum of 10 active reminders allowed",
      invalidDate: "Please provide a valid future date",
      messageRequired: "Message is required",
      messageTooLong: "Message must be 500 characters or less"
    },
    
    // General messages
    general: {
      success: "Operation completed successfully",
      error: "An error occurred",
      notFound: "Resource not found",
      serverError: "Internal server error",
      validationError: "Validation error",
      loading: "Loading...",
      saving: "Saving...",
      deleting: "Deleting..."
    },
    
    // Therapist/Counselor messages
    therapist: {
      notFound: "No counselors available right now",
      applicationSubmitted: "Application submitted successfully",
      applicationUpdated: "Application updated successfully",
      applicationDeleted: "Application deleted successfully",
      invalidApplication: "Invalid application data"
    },
    
    // Dashboard messages
    dashboard: {
      dataLoaded: "Dashboard data loaded successfully",
      dataError: "Failed to load dashboard data",
      reportGenerated: "Report generated successfully",
      reportError: "Failed to generate report"
    }
  },
  
  hi: {
    // Chatbot messages
    chatbot: {
      welcome: "नमस्ते! मैं आपका थेरेपिस्ट चैटबॉट हूं। आज आप कैसा महसूस कर रहे हैं?",
      error: "क्षमा करें, मैं उस संदेश को प्रोसेस नहीं कर सका।",
      emptyMessage: "संदेश खाली नहीं हो सकता",
      unauthorized: "अनधिकृत पहुंच",
      processing: "आपका संदेश प्रोसेस हो रहा है...",
      suggestions: {
        greeting: "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूं?",
        stress: "मैं तनावग्रस्त और अभिभूत महसूस कर रहा हूं",
        anxiety: "मैं चिंता का अनुभव कर रहा हूं",
        sadness: "मैं उदास और निराश महसूस कर रहा हूं",
        sleep: "मुझे सोने में परेशानी हो रही है",
        relationships: "मैं रिश्तों में संघर्ष कर रहा हूं",
        work: "मुझे काम से जुड़ी समस्याएं हैं",
        general: "मुझे बस किसी से बात करने की जरूरत है"
      },
      responses: {
        empathetic: "मैं समझता हूं कि आप कैसा महसूस कर रहे हैं। यह वाकई मुश्किल लगता है।",
        supportive: "इसमें आप अकेले नहीं हैं। कई लोग समान भावनाओं का अनुभव करते हैं।",
        encouraging: "यह साझा करना बहादुरी की बात है। अपने मानसिक स्वास्थ्य का ध्यान रखना महत्वपूर्ण है।",
        practical: "आइए इसे मिलकर सुलझाएं। क्या आपको बेहतर महसूस करने में मदद करेगा?",
        validating: "आपकी भावनाएं पूरी तरह वैध हैं। इस तरह महसूस करना ठीक है।"
      }
    },
    
    // Authentication messages
    auth: {
      loginRequired: "इस सुविधा तक पहुंचने के लिए कृपया लॉगिन करें",
      sessionExpired: "आपका सत्र समाप्त हो गया है। कृपया फिर से लॉगिन करें",
      invalidCredentials: "अमान्य क्रेडेंशियल्स",
      accountCreated: "खाता सफलतापूर्वक बनाया गया",
      loginSuccess: "लॉगिन सफल",
      logoutSuccess: "सफलतापूर्वक लॉगआउट हो गए",
      unauthorized: "अनधिकृत पहुंच",
      adminRequired: "एडमिन पहुंच आवश्यक"
    },
    
    // Reminder messages
    reminder: {
      created: "रिमाइंडर सफलतापूर्वक निर्धारित किया गया",
      cancelled: "रिमाइंडर सफलतापूर्वक रद्द किया गया",
      notFound: "रिमाइंडर नहीं मिला",
      limitReached: "अधिकतम 10 सक्रिय रिमाइंडर की अनुमति है",
      invalidDate: "कृपया एक वैध भविष्य की तारीख प्रदान करें",
      messageRequired: "संदेश आवश्यक है",
      messageTooLong: "संदेश 500 अक्षरों से कम होना चाहिए"
    },
    
    // General messages
    general: {
      success: "ऑपरेशन सफलतापूर्वक पूरा हुआ",
      error: "एक त्रुटि हुई",
      notFound: "संसाधन नहीं मिला",
      serverError: "आंतरिक सर्वर त्रुटि",
      validationError: "सत्यापन त्रुटि",
      loading: "लोड हो रहा है...",
      saving: "सेव हो रहा है...",
      deleting: "डिलीट हो रहा है..."
    },
    
    // Therapist/Counselor messages
    therapist: {
      notFound: "अभी कोई काउंसलर उपलब्ध नहीं है",
      applicationSubmitted: "आवेदन सफलतापूर्वक जमा किया गया",
      applicationUpdated: "आवेदन सफलतापूर्वक अपडेट किया गया",
      applicationDeleted: "आवेदन सफलतापूर्वक डिलीट किया गया",
      invalidApplication: "अमान्य आवेदन डेटा"
    },
    
    // Dashboard messages
    dashboard: {
      dataLoaded: "डैशबोर्ड डेटा सफलतापूर्वक लोड हुआ",
      dataError: "डैशबोर्ड डेटा लोड करने में विफल",
      reportGenerated: "रिपोर्ट सफलतापूर्वक जेनरेट हुई",
      reportError: "रिपोर्ट जेनरेट करने में विफल"
    }
  },
  
  as: {
    // Chatbot messages
    chatbot: {
      welcome: "নমস্কাৰ! মই আপোনাৰ থেৰাপিষ্ট চেটবট। আজি আপুনি কেনেকৈ অনুভৱ কৰিছে?",
      error: "ক্ষমা কৰিব, মই সেই বাৰ্তাটো প্ৰচেছ কৰিব নোৱাৰিলোঁ।",
      emptyMessage: "বাৰ্তা খালী হ'ব নোৱাৰে",
      unauthorized: "অনধিকাৰ প্ৰৱেশ",
      processing: "আপোনাৰ বাৰ্তা প্ৰচেছ হৈ আছে...",
      suggestions: {
        greeting: "নমস্কাৰ! আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
        stress: "মই মানসিক চাপ আৰু অতিৰিক্ত ভাৰ অনুভৱ কৰিছোঁ",
        anxiety: "মই উদ্বেগৰ অভিজ্ঞতা লাভ কৰিছোঁ",
        sadness: "মই দুখিত আৰু হতাশ অনুভৱ কৰিছোঁ",
        sleep: "মোৰ টোপনিত সমস্যা হৈছে",
        relationships: "মই সম্পৰ্কৰ সৈতে সংঘাত কৰিছোঁ",
        work: "মোৰ কামৰ সৈতে জড়িত সমস্যা আছে",
        general: "মোক কেৱল কাৰোবাৰ সৈতে কথা পাতিবলৈ প্ৰয়োজন"
      },
      responses: {
        empathetic: "মই বুজিছোঁ আপুনি কেনেকৈ অনুভৱ কৰিছে। ইয়াৰ বাবে সঁচাকৈয়ে কঠিন লাগিছে।",
        supportive: "ইয়াত আপুনি অকলে নহয়। বহুতো লোকেই একে ধৰণৰ অনুভূতিৰ অভিজ্ঞতা লাভ কৰে।",
        encouraging: "ইয়াক ভাগ কৰাটো সাহসী কাম। আপোনাৰ মানসিক স্বাস্থ্যৰ যত্ন লোৱাটো গুৰুত্বপূৰ্ণ।",
        practical: "আহক ইয়াক একেলগে সমাধান কৰোঁ। কি আপোনাক ভাল অনুভৱ কৰাব?",
        validating: "আপোনাৰ অনুভূতিবোৰ সম্পূৰ্ণৰূপে বৈধ। এইদৰে অনুভৱ কৰাটো ঠিক আছে।"
      }
    },
    
    // Authentication messages
    auth: {
      loginRequired: "এই সুবিধা প্ৰৱেশ কৰিবলৈ অনুগ্ৰহ কৰি লগইন কৰক",
      sessionExpired: "আপোনাৰ ছেছন শেষ হৈছে। অনুগ্ৰহ কৰি পুনৰ লগইন কৰক",
      invalidCredentials: "অবৈধ প্ৰমাণপত্ৰ",
      accountCreated: "একাউণ্ট সফলতাৰে সৃষ্টি হৈছে",
      loginSuccess: "লগইন সফল",
      logoutSuccess: "সফলতাৰে লগআউট হৈছে",
      unauthorized: "অনধিকাৰ প্ৰৱেশ",
      adminRequired: "এডমিন প্ৰৱেশ প্ৰয়োজন"
    },
    
    // Reminder messages
    reminder: {
      created: "ৰিমাইণ্ডাৰ সফলতাৰে নিয়োজিত কৰা হৈছে",
      cancelled: "ৰিমাইণ্ডাৰ সফলতাৰে বাতিল কৰা হৈছে",
      notFound: "ৰিমাইণ্ডাৰ পোৱা নগ'ল",
      limitReached: "সৰ্বোচ্চ ১০টা সক্ৰিয় ৰিমাইণ্ডাৰৰ অনুমতি",
      invalidDate: "অনুগ্ৰহ কৰি এটা বৈধ ভৱিষ্যতৰ তাৰিখ প্ৰদান কৰক",
      messageRequired: "বাৰ্তা প্ৰয়োজন",
      messageTooLong: "বাৰ্তা ৫০০ আখৰতকৈ কম হ'ব লাগে"
    },
    
    // General messages
    general: {
      success: "কাৰ্য্য সফলতাৰে সম্পূৰ্ণ হৈছে",
      error: "এটা ত্ৰুটি হৈছে",
      notFound: "সম্পদ পোৱা নগ'ল",
      serverError: "আভ্যন্তৰীণ ছাৰ্ভাৰ ত্ৰুটি",
      validationError: "বৈধতাৰ ত্ৰুটি",
      loading: "লোড হৈ আছে...",
      saving: "চেভ হৈ আছে...",
      deleting: "ডিলিট হৈ আছে..."
    },
    
    // Therapist/Counselor messages
    therapist: {
      notFound: "বৰ্তমান কোনো কাউন্সেলৰ উপলব্ধ নাই",
      applicationSubmitted: "আবেদন সফলতাৰে দাখিল কৰা হৈছে",
      applicationUpdated: "আবেদন সফলতাৰে আপডেট কৰা হৈছে",
      applicationDeleted: "আবেদন সফলতাৰে ডিলিট কৰা হৈছে",
      invalidApplication: "অবৈধ আবেদন ডাটা"
    },
    
    // Dashboard messages
    dashboard: {
      dataLoaded: "ডেশ্বব'ৰ্ড ডাটা সফলতাৰে লোড হৈছে",
      dataError: "ডেশ্বব'ৰ্ড ডাটা লোড কৰাত ব্যৰ্থ",
      reportGenerated: "ৰিপোৰ্ট সফলতাৰে জেনেৰেট হৈছে",
      reportError: "ৰিপোৰ্ট জেনেৰেট কৰাত ব্যৰ্থ"
    }
  }
};

// Language detection and translation function
function detectLanguage(req) {
  // Priority order: session > header > default
  const sessionLang = req.session?.preferredLanguage;
  const headerLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const supportedLanguages = ['en', 'hi', 'as'];
  
  if (sessionLang && supportedLanguages.includes(sessionLang)) {
    return sessionLang;
  }
  
  if (headerLang && supportedLanguages.includes(headerLang)) {
    return headerLang;
  }
  
  return 'en'; // Default fallback
}

function translate(key, language = 'en', params = {}) {
  const keys = key.split('.');
  let translation = translations[language];
  
  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      // Fallback to English
      translation = translations['en'];
      for (const fallbackKey of keys) {
        if (translation && translation[fallbackKey]) {
          translation = translation[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  // Handle parameter interpolation
  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] || match;
    });
  }
  
  return translation || key;
}

// Middleware to add translation function to request
function i18nMiddleware(req, res, next) {
  req.t = (key, params = {}) => {
    const language = detectLanguage(req);
    return translate(key, language, params);
  };
  
  req.getLanguage = () => detectLanguage(req);
  
  next();
}

// Function to update user's language preference
function updateUserLanguage(req, language) {
  if (req.session) {
    req.session.preferredLanguage = language;
  }
}

module.exports = {
  translations,
  translate,
  detectLanguage,
  i18nMiddleware,
  updateUserLanguage
};
