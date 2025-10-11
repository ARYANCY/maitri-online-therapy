const translations = {
  en: {
    // Chatbot messages
    chatbot: {
      welcome: "Hello! I'm your therapist chatbot. How are you feeling today?",
      error: "Sorry, I couldn't process that message. Please try again.",
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
      },
      metrics: {
        stressLevel: "Stress Level",
        happinessLevel: "Happiness Level", 
        anxietyLevel: "Anxiety Level",
        overallMood: "Overall Mood",
        phq9Score: "Depression Score (PHQ-9)",
        gad7Score: "Anxiety Score (GAD-7)",
        ghqScore: "General Health Score (GHQ-12)",
        riskLevel: "Risk Level",
        low: "Low",
        moderate: "Moderate",
        high: "High"
      },
      todos: {
        generated: "I've generated some helpful tasks for you based on our conversation.",
        noTasks: "No tasks generated at this time.",
        taskTitle: "Task",
        completed: "Completed",
        pending: "Pending"
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
      messageTooLong: "Message must be 500 characters or less",
      scheduledSuccess: "Reminder scheduled successfully",
      fetchError: "Failed to fetch reminders",
      invalidId: "Invalid reminder ID",
      notFound: "Reminder not found or already deleted",
      cancelledSuccess: "Reminder cancelled successfully",
      fetchStatsError: "Failed to fetch reminder statistics",
      maxReminders: "Maximum of 10 active reminders allowed. Please cancel some existing reminders first.",
      messageRequired: "Message and sendAt are required",
      messageTooLong: "Message must be 500 characters or less",
      invalidDate: "Invalid date format for sendAt",
      pastDate: "sendAt must be a future date/time",
      tooFarFuture: "sendAt cannot be more than 1 year in the future"
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
      deleting: "Deleting...",
      unauthorized: "Unauthorized: Please login",
      forbidden: "Access forbidden",
      badRequest: "Bad request",
      notImplemented: "Feature not implemented"
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
      reportError: "Failed to generate report",
      tasksLoaded: "Tasks loaded successfully",
      tasksUpdated: "Tasks updated successfully",
      tasksError: "Failed to load tasks",
      tasksUpdateError: "Failed to update tasks",
      noTasks: "No tasks available",
      tasksRequired: "Tasks must be an array",
      error: "Network Error"
    },
    
    // Todo messages
    todo: {
      created: "Task created successfully",
      updated: "Task updated successfully",
      deleted: "Task deleted successfully",
      notFound: "Task not found",
      fetchError: "Failed to fetch tasks",
      updateError: "Failed to update tasks",
      deleteError: "Failed to delete task",
      validationError: "Invalid task data",
      titleRequired: "Task title is required",
      titleTooLong: "Task title must be less than 200 characters"
    },
    
    // Report messages
    report: {
      generating: "Generating report...",
      generated: "Report generated successfully",
      error: "Failed to generate report",
      noData: "No data available for report",
      downloading: "Downloading report...",
      downloaded: "Report downloaded successfully",
      title: "Maitri Mental Health Report",
      disclaimer: "This report summarizes your mental health screening metrics. It is AI-generated; please consult a qualified counselor for professional guidance.",
      userInfo: "User Information",
      screeningMetrics: "Screening Metrics",
      visualChart: "Visual Chart Representation",
      generatedOn: "Generated on",
      language: "Language",
      name: "Name",
      email: "Email"
    },
    
    // Email messages
    email: {
      reminderSubject: "Maitri — Your Reminder",
      reminderGreeting: "Hello from Maitri!",
      reminderMessagePrefix: "You asked us to remind you about:",
      reminderScheduledFor: "This reminder was originally scheduled for:",
      reminderSentAt: "This email was sent at:",
      reminderClosing: "We hope this helps you stay on track with your well-being goals.",
      reminderTeam: "The Maitri Team",
      reminderRights: "All rights reserved."
    }
  },
  
  hi: {
    // Chatbot messages
    chatbot: {
      welcome: "नमस्ते! मैं आपका थेरेपिस्ट चैटबॉट हूं। आज आप कैसा महसूस कर रहे हैं?",
      error: "क्षमा करें, मैं उस संदेश को प्रोसेस नहीं कर सका। कृपया फिर से कोशिश करें।",
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
      },
      metrics: {
        stressLevel: "तनाव स्तर",
        happinessLevel: "खुशी स्तर",
        anxietyLevel: "चिंता स्तर",
        overallMood: "समग्र मनोदशा",
        phq9Score: "अवसाद स्कोर (PHQ-9)",
        gad7Score: "चिंता स्कोर (GAD-7)",
        ghqScore: "सामान्य स्वास्थ्य स्कोर (GHQ-12)",
        riskLevel: "जोखिम स्तर",
        low: "कम",
        moderate: "मध्यम",
        high: "उच्च"
      },
      todos: {
        generated: "मैंने हमारी बातचीत के आधार पर आपके लिए कुछ उपयोगी कार्य उत्पन्न किए हैं।",
        noTasks: "इस समय कोई कार्य उत्पन्न नहीं हुआ।",
        taskTitle: "कार्य",
        completed: "पूर्ण",
        pending: "लंबित"
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
      messageTooLong: "संदेश 500 अक्षरों से कम होना चाहिए",
      scheduledSuccess: "रिमाइंडर सफलतापूर्वक निर्धारित किया गया",
      fetchError: "रिमाइंडर प्राप्त करने में विफल",
      invalidId: "अमान्य रिमाइंडर ID",
      notFound: "रिमाइंडर नहीं मिला या पहले से ही हटा दिया गया",
      cancelledSuccess: "रिमाइंडर सफलतापूर्वक रद्द किया गया",
      fetchStatsError: "रिमाइंडर आंकड़े प्राप्त करने में विफल",
      maxReminders: "अधिकतम 10 सक्रिय रिमाइंडर की अनुमति है। कृपया पहले कुछ मौजूदा रिमाइंडर रद्द करें।",
      messageRequired: "संदेश और sendAt आवश्यक हैं",
      messageTooLong: "संदेश 500 अक्षरों से कम होना चाहिए",
      invalidDate: "sendAt के लिए अमान्य दिनांक प्रारूप",
      pastDate: "sendAt भविष्य की तारीख/समय होना चाहिए",
      tooFarFuture: "sendAt 1 वर्ष से अधिक भविष्य में नहीं हो सकता"
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
      deleting: "डिलीट हो रहा है...",
      unauthorized: "अनधिकृत: कृपया लॉगिन करें",
      forbidden: "पहुंच निषिद्ध",
      badRequest: "खराब अनुरोध",
      notImplemented: "सुविधा लागू नहीं की गई"
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
      reportError: "रिपोर्ट जेनरेट करने में विफल",
      tasksLoaded: "कार्य सफलतापूर्वक लोड हुए",
      tasksUpdated: "कार्य सफलतापूर्वक अपडेट हुए",
      tasksError: "कार्य लोड करने में विफल",
      tasksUpdateError: "कार्य अपडेट करने में विफल",
      noTasks: "कोई कार्य उपलब्ध नहीं",
      tasksRequired: "कार्य एक सरणी होना चाहिए"
    },
    
    // Todo messages
    todo: {
      created: "कार्य सफलतापूर्वक बनाया गया",
      updated: "कार्य सफलतापूर्वक अपडेट किया गया",
      deleted: "कार्य सफलतापूर्वक हटाया गया",
      notFound: "कार्य नहीं मिला",
      fetchError: "कार्य प्राप्त करने में विफल",
      updateError: "कार्य अपडेट करने में विफल",
      deleteError: "कार्य हटाने में विफल",
      validationError: "अमान्य कार्य डेटा",
      titleRequired: "कार्य शीर्षक आवश्यक है",
      titleTooLong: "कार्य शीर्षक 200 अक्षरों से कम होना चाहिए"
    },
    
    // Report messages
    report: {
      generating: "रिपोर्ट जेनरेट हो रही है...",
      generated: "रिपोर्ट सफलतापूर्वक जेनरेट हुई",
      error: "रिपोर्ट जेनरेट करने में विफल",
      noData: "रिपोर्ट के लिए कोई डेटा उपलब्ध नहीं",
      downloading: "रिपोर्ट डाउनलोड हो रही है...",
      downloaded: "रिपोर्ट सफलतापूर्वक डाउनलोड हुई",
      title: "मैत्री मानसिक स्वास्थ्य रिपोर्ट",
      disclaimer: "यह रिपोर्ट आपके मानसिक स्वास्थ्य स्क्रीनिंग मेट्रिक्स का सारांश प्रस्तुत करती है। यह AI-जेनरेटेड है; कृपया पेशेवर मार्गदर्शन के लिए एक योग्य काउंसलर से सलाह लें।",
      userInfo: "उपयोगकर्ता जानकारी",
      screeningMetrics: "स्क्रीनिंग मेट्रिक्स",
      visualChart: "विजुअल चार्ट प्रतिनिधित्व",
      generatedOn: "जेनरेट किया गया",
      language: "भाषा",
      name: "नाम",
      email: "ईमेल"
    },
    
    // Email messages
    email: {
      reminderSubject: "मैत्री — आपका रिमाइंडर",
      reminderGreeting: "मैत्री से नमस्ते!",
      reminderMessagePrefix: "आपने हमें याद दिलाने के लिए कहा था:",
      reminderScheduledFor: "यह रिमाइंडर मूल रूप से इसके लिए निर्धारित किया गया था:",
      reminderSentAt: "यह ईमेल इस समय भेजा गया था:",
      reminderClosing: "हमें उम्मीद है कि यह आपको अपने कल्याण लक्ष्यों के साथ ट्रैक पर रहने में मदद करेगा।",
      reminderTeam: "मैत्री टीम",
      reminderRights: "सभी अधिकार सुरक्षित।"
    }
  },
  
  as: {
    // Chatbot messages
    chatbot: {
      welcome: "নমস্কাৰ! মই আপোনাৰ থেৰাপিষ্ট চেটবট। আজি আপুনি কেনেকৈ অনুভৱ কৰিছে?",
      error: "ক্ষমা কৰিব, মই সেই বাৰ্তাটো প্ৰচেছ কৰিব নোৱাৰিলোঁ। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
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
      },
      metrics: {
        stressLevel: "মানসিক চাপৰ স্তৰ",
        happinessLevel: "সুখৰ স্তৰ",
        anxietyLevel: "উদ্বেগৰ স্তৰ",
        overallMood: "সামগ্ৰিক মেজাজ",
        phq9Score: "বিষণ্নতা স্ক'ৰ (PHQ-9)",
        gad7Score: "উদ্বেগ স্ক'ৰ (GAD-7)",
        ghqScore: "সাধাৰণ স্বাস্থ্য স্ক'ৰ (GHQ-12)",
        riskLevel: "ঝুঁকিৰ স্তৰ",
        low: "কম",
        moderate: "মধ্যম",
        high: "উচ্চ"
      },
      todos: {
        generated: "মই আমাৰ কথোপকথনৰ ভিত্তিত আপোনাৰ বাবে কিছুমান সহায়ক কাম উৎপাদন কৰিছোঁ।",
        noTasks: "এই সময়ত কোনো কাম উৎপাদন হোৱা নাই।",
        taskTitle: "কাম",
        completed: "সম্পূৰ্ণ",
        pending: "বিচাৰাধীন"
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
      messageTooLong: "বাৰ্তা ৫০০ আখৰতকৈ কম হ'ব লাগে",
      scheduledSuccess: "ৰিমাইণ্ডাৰ সফলতাৰে নিয়োজিত কৰা হৈছে",
      fetchError: "ৰিমাইণ্ডাৰ প্ৰাপ্ত কৰাত ব্যৰ্থ",
      invalidId: "অবৈধ ৰিমাইণ্ডাৰ ID",
      notFound: "ৰিমাইণ্ডাৰ পোৱা নগ'ল বা ইতিমধ্যে মচি পেলোৱা হৈছে",
      cancelledSuccess: "ৰিমাইণ্ডাৰ সফলতাৰে বাতিল কৰা হৈছে",
      fetchStatsError: "ৰিমাইণ্ডাৰ পৰিসংখ্যা প্ৰাপ্ত কৰাত ব্যৰ্থ",
      maxReminders: "সৰ্বোচ্চ ১০টা সক্ৰিয় ৰিমাইণ্ডাৰৰ অনুমতি। অনুগ্ৰহ কৰি প্ৰথমে কিছুমান বিদ্যমান ৰিমাইণ্ডাৰ বাতিল কৰক।",
      messageRequired: "বাৰ্তা আৰু sendAt প্ৰয়োজন",
      messageTooLong: "বাৰ্তা ৫০০ আখৰতকৈ কম হ'ব লাগে",
      invalidDate: "sendAt ৰ বাবে অবৈধ তাৰিখৰ ফৰ্মেট",
      pastDate: "sendAt ভৱিষ্যতৰ তাৰিখ/সময় হ'ব লাগে",
      tooFarFuture: "sendAt ১ বছৰতকৈ অধিক ভৱিষ্যতত হ'ব নোৱাৰে"
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
      deleting: "ডিলিট হৈ আছে...",
      unauthorized: "অনধিকাৰ: অনুগ্ৰহ কৰি লগইন কৰক",
      forbidden: "প্ৰৱেশ নিষিদ্ধ",
      badRequest: "বেয়া অনুৰোধ",
      notImplemented: "বৈশিষ্ট্য প্ৰয়োগ কৰা হোৱা নাই"
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
      reportError: "ৰিপোৰ্ট জেনেৰেট কৰাত ব্যৰ্থ",
      tasksLoaded: "কামবোৰ সফলতাৰে লোড হৈছে",
      tasksUpdated: "কামবোৰ সফলতাৰে আপডেট হৈছে",
      tasksError: "কামবোৰ লোড কৰাত ব্যৰ্থ",
      tasksUpdateError: "কামবোৰ আপডেট কৰাত ব্যৰ্থ",
      noTasks: "কোনো কাম উপলব্ধ নাই",
      tasksRequired: "কামবোৰ এটা এৰে হ'ব লাগে"
    },
    
    // Todo messages
    todo: {
      created: "কাম সফলতাৰে সৃষ্টি কৰা হৈছে",
      updated: "কাম সফলতাৰে আপডেট কৰা হৈছে",
      deleted: "কাম সফলতাৰে মচি পেলোৱা হৈছে",
      notFound: "কাম পোৱা নগ'ল",
      fetchError: "কাম প্ৰাপ্ত কৰাত ব্যৰ্থ",
      updateError: "কাম আপডেট কৰাত ব্যৰ্থ",
      deleteError: "কাম মচাত ব্যৰ্থ",
      validationError: "অবৈধ কাম ডাটা",
      titleRequired: "কামৰ শীৰ্ষক প্ৰয়োজন",
      titleTooLong: "কামৰ শীৰ্ষক ২০০ আখৰতকৈ কম হ'ব লাগে"
    },
    
    // Report messages
    report: {
      generating: "ৰিপোৰ্ট জেনেৰেট হৈ আছে...",
      generated: "ৰিপোৰ্ট সফলতাৰে জেনেৰেট হৈছে",
      error: "ৰিপোৰ্ট জেনেৰেট কৰাত ব্যৰ্থ",
      noData: "ৰিপোৰ্টৰ বাবে কোনো ডাটা উপলব্ধ নাই",
      downloading: "ৰিপোৰ্ট ডাউনলোড হৈ আছে...",
      downloaded: "ৰিপোৰ্ট সফলতাৰে ডাউনলোড হৈছে",
      title: "মৈত্ৰী মানসিক স্বাস্থ্য ৰিপোৰ্ট",
      disclaimer: "এই ৰিপোৰ্টে আপোনাৰ মানসিক স্বাস্থ্য স্ক্ৰীনিং মেট্ৰিক্সৰ সাৰাংশ প্ৰদান কৰে। ই AI-জেনেৰেটেড; অনুগ্ৰহ কৰি পেছাদাৰী পৰামৰ্শৰ বাবে এজন যোগ্য কাউন্সেলৰৰ সৈতে পৰামৰ্শ লওক।",
      userInfo: "ব্যৱহাৰকাৰী তথ্য",
      screeningMetrics: "স্ক্ৰীনিং মেট্ৰিক্স",
      visualChart: "ভিজুৱেল চাৰ্ট প্ৰতিনিধিত্ব",
      generatedOn: "জেনেৰেট কৰা হৈছে",
      language: "ভাষা",
      name: "নাম",
      email: "ইমেইল"
    },
    
    // Email messages
    email: {
      reminderSubject: "মৈত্ৰী — আপোনাৰ ৰিমাইণ্ডাৰ",
      reminderGreeting: "মৈত্ৰীৰ পৰা নমস্কাৰ!",
      reminderMessagePrefix: "আপুনি আমাক এই বিষয়ে সোঁৱৰাই দিবলৈ কৈছিল:",
      reminderScheduledFor: "এই ৰিমাইণ্ডাৰ মূলতঃ এইটোৰ বাবে নিয়োজিত কৰা হৈছিল:",
      reminderSentAt: "এই ইমেইল এই সময়ত পঠোৱা হৈছিল:",
      reminderClosing: "আমি আশা কৰোঁ যে ই আপোনাক আপোনাৰ কল্যাণ লক্ষ্যৰ সৈতে ট্ৰেকত থাকাত সহায় কৰিব।",
      reminderTeam: "মৈত্ৰী দল",
      reminderRights: "সকলো অধিকাৰ সংৰক্ষিত।"
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
