// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
 en: {
    translation: {
      navbar: {
        title: "Maitri",
        feelingDown: "Feeling low? Find a new friend with Maitri!",
        hello: "Hello, {{name}} 👋",
        home: "Home",
        dashboard: "Dashboard",
        about: "About Maitri",
        talkToCounselor: "Talk to a Counselor",
        logout: "Logout",
      },
      dashboard: {
        tab: {
          chatbot: "Chatbot",
          chart: "Progress",
          todo: "To-Do",
          notFound: "Tab not found",
        },
        loading: "Loading your space...",
        error: {
          generic: "Something went wrong. Please try again.",
          sessionCheckFailed: "Session check failed:",
          fetchFailed: "Could not load dashboard data:",
          updateTodosFailed: "Unable to update your tasks:",
        },
      },
      todo: {
        title: "My To-Dos",
        placeholder: "Add a new task...",
        maxTasks: "You can only add up to 10 tasks.",
        empty: "No tasks yet. Start by adding one!",
        completedAll: "All tasks done! You're amazing 🎉",
        add: "Add",
        updateError: "Could not sync tasks with the server.",
        loading: "Loading your tasks...",
        deleteTask: "Delete task: {{title}}?",
      },
      chatbot: {
        inputPlaceholder: "Type your thoughts here...",
        sendButton: "Send",
        loginPrompt: "Please log in to start chatting.",
        connectionError: "Unable to connect to the server.",
        sendError: "Sorry, I couldn’t send that message.",
      },
      chart: {
        emotionalMetrics: "Emotional Well-being",
        screeningMetrics: "Screening Overview",
        barChart: "Bar Chart",
        lineChart: "Line Chart",
        noMetrics: "No data to show yet.",
      },
      reminder: {
        title: "Reminders",
        message: "Message",
        when: "When",
        customOption: "Choose date & time",
        schedule: "Set Reminder",
        scheduling: "Setting your reminder...",
        scheduled: "Reminder added successfully!",
        cancelled: "Reminder cancelled.",
        empty: "You have no reminders yet.",
        invalidDate: "Please select a valid date and time.",
        cancel: "Cancel",
        manage: "Manage Reminders",
        fetchError: "Could not load reminders.",
        scheduleError: "Failed to set reminder.",
        cancelError: "Failed to cancel reminder.",
        defaultMessage: "A gentle reminder from Maitri 💙",
        presets: {
          "1day": "In 1 day",
          "2day": "In 2 days",
          "3day": "In 3 days",
          "1week": "In 1 week",
        },
      },
      login: {
        googleLogin: "Continue with Google",
        loading: "Loading, please wait...",
      },
      counselor: {
        title: "Talk to a Counselor",
        description:
          "Need guidance or someone to listen? Connect with our professional counselor for a safe, confidential, and empathetic conversation.",
        name: "Dr. Dhritam Tapatkam Dehi",
        namePlaceholder: "Enter your name",
        email: "Email",
        emailPlaceholder: "Enter your email",
        message: "Message",
        messagePlaceholder: "Share your concerns here...",
        requestSession: "Request a Session",
        requestSubmitted:
          "Your request has been received. Our counselor will contact you soon!",
        qualifications: "Qualifications",
        qualificationsDetails:
          "M.A. in Clinical Psychology, Certified CBT Practitioner",
        experience: "Experience",
        experienceDetails:
          "7+ years in mental health counseling, specializing in anxiety, depression, and stress management",
        languages: "Languages",
        languagesDetails: "English, Hindi, Assamese",
        availability: "Availability",
        availabilityDetails: "Mon–Fri, 10:00 AM – 6:00 PM",
        callButton: "Call: 9999999999",
        form: {
          submit: "Submit Request",
          name: "Name",
          namePlaceholder: "Enter your name",
          email: "Email",
          emailPlaceholder: "Enter your email",
          message: "Message",
          messagePlaceholder: "Share your concerns here...",
        },
      },
      aboutMaitri: {
        heroTitle: "About Maitri",
        heroDescription:
          "Maitri is dedicated to raising mental health awareness and offering tools for emotional well-being. We aim to create a safe, supportive, and accessible space for everyone.",
        missionTitle: "Our Mission",
        missionDescription:
          "To empower individuals to take charge of their mental health with journaling, guided resources, and community support. We work to break stigma and encourage open conversations.",
        visionTitle: "Our Vision",
        visionDescription:
          "A world where mental health is valued as much as physical health, and support is within everyone’s reach.",
        featuresTitle: "What We Offer",
        features: [
          "Guided journaling to reflect on moods and emotions.",
          "An interactive chatbot for real-time mental health support.",
          "Emotional and screening insights to understand your mental state.",
          "Educational resources and videos on well-being.",
          "Community support and expert guidance.",
        ],
        videosTitle: "Helpful Videos",
        tipsTitle: "Mental Health Tips",
        tips: [
          "Write down things you’re grateful for every day.",
          "Exercise regularly to lift your mood and reduce stress.",
          "Stay connected with family and friends.",
          "Set realistic goals and break them into small steps.",
          "Take breaks from social media to recharge.",
          "Practice deep breathing or meditation daily.",
        ],
        faqsTitle: "FAQs",
        faq1: {
          question: "What is Maitri?",
          answer:
            "Maitri is a platform designed to support mental health through journaling, guidance, and community care.",
        },
        faq2: {
          question: "Is it free to use?",
          answer: "Yes, Maitri is completely free for everyone.",
        },
        faq3: {
          question: "Can I track my progress?",
          answer:
            "Yes! Maitri helps you monitor your mental and emotional well-being over time.",
        },
        faq4: {
          question: "Is my data private?",
          answer:
            "Absolutely. Your data is safe, secure, and never shared without your consent.",
        },
        testimonialsTitle: "What Our Users Say",
        testimonials: [
          "Maitri has truly helped me manage stress better.",
          "The journaling tool makes self-reflection easy and rewarding.",
          "I love the supportive community and expert advice here.",
        ],
        contactTitle: "Get Started with Maitri",
        contactDescription:
          "Begin your journey to better mental health today. Try our journaling and support features now!",
        startButton: "Start Journaling",
      },
    },
  },
hi: {
  translation: {
    navbar: {
      title: "मैत्री",
      feelingDown: "ख़ुशी नहीं है? मैत्री के साथ एक नया साथी खोजें।",
      hello: "नमस्ते, {{name}}",
      home: "होम",
      dashboard: "डैशबोर्ड",
      about: "मैत्री के बारे में",
      talkToCounselor: "काउंसलर से बात करें",
      logout: "लॉगआउट"
    },
    dashboard: {
      tab: {
        chatbot: "चैटबॉट",
        chart: "प्रगति",
        todo: "कार्यसूची",
        notFound: "टैब नहीं मिला"
      },
      loading: "आपका डैशबोर्ड लोड किया जा रहा है...",
      error: {
        generic: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
        sessionCheckFailed: "सेशन जांच विफल:",
        fetchFailed: "डैशबोर्ड डेटा लाने में त्रुटि:",
        updateTodosFailed: "टास्क अपडेट नहीं हो पाए:"
      }
    },
    todo: {
      title: "मेरे कार्य",
      placeholder: "नया कार्य जोड़ें...",
      maxTasks: "अधिकतम 10 कार्य ही जोड़े जा सकते हैं।",
      empty: "कोई कार्य नहीं है — एक जोड़कर शुरुआत करें।",
      completedAll: "सभी कार्य पूरे हो गए! शानदार काम।",
      add: "जोड़ें",
      updateError: "सर्वर के साथ कार्य समन्वय में त्रुटि हुई।",
      loading: "आपके कार्य लोड किए जा रहे हैं...",
      deleteTask: "क्या आप कार्य '{ {title} }' हटाना चाहते हैं?"
    },
    chatbot: {
      inputPlaceholder: "यहाँ अपना संदेश टाइप करें...",
      sendButton: "भेजें",
      loginPrompt: "कृपया चैट शुरू करने के लिए लॉगिन करें।",
      connectionError: "सर्वर से कनेक्ट करने में त्रुटि।",
      sendError: "क्षमा करें, यह संदेश भेजा नहीं जा सका।"
    },
    chart: {
      emotionalMetrics: "भावनात्मक स्वास्थ्य",
      screeningMetrics: "स्क्रीनिंग सारांश",
      barChart: "बार चार्ट",
      lineChart: "लाइन चार्ट",
      noMetrics: "दिखाने के लिए डेटा उपलब्ध नहीं है।"
    },
    reminder: {
      title: "रिमाइंडर",
      message: "संदेश",
      when: "समय",
      customOption: "कस्टम दिनांक/समय चुनें",
      schedule: "रिमाइंडर सेट करें",
      scheduling: "रिमाइंडर सेट किया जा रहा है...",
      scheduled: "रिमाइंडर सफलतापूर्वक सेट हो गया!",
      cancelled: "रिमाइंडर रद्द कर दिया गया।",
      empty: "कोई रिमाइंडर नहीं।",
      invalidDate: "कृपया मान्य दिनांक और समय चुनें।",
      cancel: "रद्द करें",
      manage: "रिमाइंडर प्रबंधित करें",
      fetchError: "रिमाइंडर लाने में त्रुटि हुई।",
      scheduleError: "रिमाइंडर निर्धारित करने में असफल।",
      cancelError: "रिमाइंडर रद्द करने में असफल।",
      defaultMessage: "मैत्री की ओर से एक याद दिलाने वाला संदेश",
      presets: {
        "1day": "1 दिन में",
        "2day": "2 दिन में",
        "3day": "3 दिन में",
        "1week": "1 सप्ताह में"
      }
    },
    login: {
      googleLogin: "Google से जारी रखें",
      loading: "लोड हो रहा है, कृपया प्रतीक्षा करें..."
    },
    counselor: {
      title: "काउंसलर से संवाद करें",
      description:
        "यदि आप मार्गदर्शन या किसी से बात करने की आवश्यकता महसूस करते हैं, तो हमारे अनुभवी काउंसलर से संपर्क करें — गोपनीय और सहानुभूति-पूर्ण संवाद के लिए।",
      name: "Dr. Dhritam Tapatkam Dehi",
      namePlaceholder: "आपका नाम",
      email: "ईमेल",
      emailPlaceholder: "आपका ईमेल",
      message: "संदेश",
      messagePlaceholder: "अपनी बात यहाँ लिखें...",
      requestSession: "सत्र का अनुरोध करें",
      requestSubmitted:
        "आपका अनुरोध प्राप्त कर लिया गया है। हमारी टीम शीघ्र ही आपसे संपर्क करेगी।",
      qualifications: "योग्यता",
      qualificationsDetails:
        "Ph.D. (Clinical Psychology), मान्यता प्राप्त CBT प्रशिक्षक",
      experience: "अनुभव",
      experienceDetails:
        "मानसिक स्वास्थ्य पर 10+ वर्षों का व्यावसायिक परामर्श अनुभव—एंग्जाइटी, अवसाद और तनाव प्रबंधन में विशेषज्ञता",
      languages: "भाषाएँ",
      languagesDetails: "हिन्दी, अंग्रेज़ी, पंजाबी",
      availability: "उपलब्धता",
      availabilityDetails: "सोमवार – शुक्रवार, 09:00 AM – 05:00 PM",
      callButton: "कॉल करें +91 9999999999",
      form: {
        submit: "अनुरोध भेजें",
        name: "नाम",
        namePlaceholder: "अपना पूरा नाम लिखें",
        email: "ईमेल",
        emailPlaceholder: "इमेल पता लिखें",
        message: "संदेश",
        messagePlaceholder: "आपकी चिंताएँ या प्रश्न यहाँ लिखें"
      }
    },
    aboutMaitri: {
      heroTitle: "मैत्री के बारे में",
      heroDescription:
        "मैत्री एक समर्पित मंच है जो मानसिक स्वास्थ्य के प्रति जागरूकता बढ़ाने और भावनात्मक कल्याण के लिए व्यावहारिक उपकरण प्रदान करने के लिए बनाया गया है। हम एक सुरक्षित, समावेशी और सहायक वातावरण तैयार करने के लिए प्रतिबद्ध हैं।",
      missionTitle: "हमारा उद्देश्य",
      missionDescription:
        "व्यक्तियों को आत्म-देखभाल के लिए सक्षम बनाना — जर्नलिंग, मार्गदर्शित संसाधन और समुदायिक समर्थन के माध्यम से। हम मानसिक स्वास्थ्य पर खुली और सम्मानजनक बातचीत को बढ़ावा देते हैं।",
      visionTitle: "हमारा दृष्टिकोण",
      visionDescription:
        "एक ऐसा समाज जहाँ मानसिक स्वास्थ्य को शारीरिक स्वास्थ्य के समान प्राथमिकता मिलती है और मदद सभी के लिए सुलभ होती है।",
      featuresTitle: "हम क्या प्रदान करते हैं",
      features: [
        "मूड और भावनाओं पर मार्गदर्शित जर्नलिंग।",
        "तुरंत सहायता के लिए इंटरैक्टिव चैटबॉट।",
        "भावनात्मक तथा स्क्रीनिंग सूचकांक जो आपकी प्रगति दिखाते हैं।",
        "मानसिक स्वास्थ्य पर शिक्षात्मक लेख और वीडियो।",
        "समुदाय-आधारित सहायता तथा विशेषज्ञ परामर्श।"
      ],
      videosTitle: "सहायक वीडियो",
      tipsTitle: "मानसिक स्वास्थ्य सुझाव",
      tips: [
        "दैनिक कृतज्ञता लिखने की आदत डालें।",
        "नियमित व्यायाम से मूड बेहतर होता है और तनाव कम होता है।",
        "दोस्तों और परिवार से जुड़े रहें।",
        "बड़े लक्ष्यों को छोटे-छोटे कदमों में बाँटें।",
        "समय-समय पर सोशल मीडिया से दूरी बनाएँ।",
        "रोज़ाना गहरी साँस या ध्यान का अभ्यास करें।"
      ],
      faqsTitle: "अक्सर पूछे जाने वाले प्रश्न",
      faq1: {
        question: "मैत्री क्या है?",
        answer:
          "मैत्री एक प्लेटफ़ॉर्म है जो जर्नलिंग, सलाह और समुदाय के माध्यम से मानसिक स्वास्थ्य का समर्थन करता है।"
      },
      faq2: {
        question: "क्या यह नि:शुल्क है?",
        answer: "हाँ — मैत्री सभी के लिए नि:शुल्क उपलब्ध है।"
      },
      faq3: {
        question: "क्या मैं अपनी प्रगति ट्रैक कर सकता/सकती हूँ?",
        answer:
          "बिलकुल — हमारा टूल आपके भावनात्मक रुझानों और स्क्रीनिंग परिणामों को समय के साथ दिखाता है।"
      },
      faq4: {
        question: "क्या मेरा डेटा सुरक्षित है?",
        answer:
          "पूरी तरह से। आपका डेटा गोपनीय रखा जाता है और केवल आपकी सहमति से साझा किया जाएगा।"
      },
      testimonialsTitle: "उपयोगकर्ताओं की राय",
      testimonials: [
        "मैत्री ने मुझे तनाव प्रबंधन में वास्तव में मदद की।",
        "जर्नलिंग फीचर से मुझे अपनी भावनाओं को समझने में मदद मिलती है।",
        "विशेषज्ञ सलाह और समुदाय-सपोर्ट बहुत उपयोगी रहे।"
      ],
      contactTitle: "मैत्री के साथ शुरुआत करें",
      contactDescription:
        "बेहतर मानसिक स्वास्थ्य की ओर अपने कदम आज ही उठाएँ — हमारे जर्नलिंग और सहायता फीचर्स आज़माएँ।",
      startButton: "जर्नलिंग शुरू करें"
    }
  }
},

as: {
  translation: {
    navbar: {
      title: "মৈত্রী",
      feelingDown: "মনটো ভাল নাই নেকি? মৈত্ৰীৰ সৈতে এটা নতুন সঙ্গী বিচাৰক।",
      hello: "নমস্কাৰ, {{name}}",
      home: "হোম",
      dashboard: "ডেশ্বব'ৰ্ড",
      about: "মৈত্ৰীৰ বিষয়ে",
      talkToCounselor: "কাউন্সেলৰৰ সৈতে কথা-বাৰ্তা",
      logout: "লগআউট"
    },
    dashboard: {
      tab: {
        chatbot: "চেটবট",
        chart: "প্ৰগতি",
        todo: "কৰিবলগীয়া কাম",
        notFound: "টেব পোৱা নগ'ল"
      },
      loading: "আপোনাৰ ডেশ্বব'ৰ্ড লোড হ'বলৈ অপেক্ষা কৰক...",
      error: {
        generic: "এটা ত্ৰুটি হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
        sessionCheckFailed: "ছেছন পৰীক্ষা বিফল:",
        fetchFailed: "ডেশ্বব'ৰ্ডৰ তথ্য আহৰণ কৰোঁতে ত্ৰুটি:",
        updateTodosFailed: "কামবোৰ আপডেট কৰিব পৰা নগ'ল:"
      }
    },
    todo: {
      title: "মোৰ কৰিবলগীয়া কাম",
      placeholder: "নতুন কাম যোগ কৰক...",
      maxTasks: "অধিকতম 10টা কাম যোগ কৰিব পাৰিব।",
      empty: "এখনো কাম নাই — এটা যোগ কৰি আৰম্ভ কৰক।",
      completedAll: "সকলো কাম সম্পূৰ্ণ! শ্ৰেষ্ঠ কাম।",
      add: "যোগ কৰক",
      updateError: "চাৰ্ভাৰৰ সৈতে কাম মিলাবলৈ ত্ৰুটি হ'ল।",
      loading: "আপোনাৰ কামবোৰ লোড হৈ আছে...",
      deleteTask: "আপুনি কি '{ {title} }' কামটো আঁতৰাব খোজে?"
    },
    chatbot: {
      inputPlaceholder: "আপোনাৰ বাৰ্তা ইয়াত লিখক...",
      sendButton: "পঠিয়াওক",
      loginPrompt: "চেট আৰম্ভ কৰিবলৈ অনুগ্ৰহ কৰি লগইন কৰক।",
      connectionError: "চাৰ্ভাৰৰ সৈতে সংযোগ কৰোঁতে ত্ৰুটি।",
      sendError: "ক্ষমা কৰিব, বাৰ্তাটো পঠিয়াব পৰা নগ'ল।"
    },
    chart: {
      emotionalMetrics: "মানসিক অৱস্থা",
      screeningMetrics: "স্ক্ৰিনিং সাৰাংশ",
      barChart: "বৰ চাৰ্ট",
      lineChart: "লাইন চাৰ্ট",
      noMetrics: "দেখুৱাবলৈ তথ্য নাই।"
    },
    reminder: {
      title: "ৰিমাইণ্ডাৰ",
      message: "বাৰ্তা",
      when: "সময়",
      customOption: "নিজেই তাৰিখ/সময় নিৰ্বাচন কৰক",
      schedule: "ৰিমাইণ্ডাৰ ছেট কৰক",
      scheduling: "ৰিমাইণ্ডাৰ ছেট কৰি আছে...",
      scheduled: "ৰিমাইণ্ডাৰ সফলতাৰে ছেট হ'ল!",
      cancelled: "ৰিমাইণ্ডাৰ বাতিল কৰা হ'ল।",
      empty: "কোনো ৰিমাইণ্ডাৰ নাই।",
      invalidDate: "অনুগ্ৰহ কৰি বৈধ তাৰিখ আৰু সময় নিৰ্বাচন কৰক।",
      cancel: "বাতিল কৰক",
      manage: "ৰিমাইণ্ডাৰ ব্যৱস্থাপনা কৰক",
      fetchError: "ৰিমাইণ্ডাৰ আহৰণ কৰোঁতে ত্ৰুটি।",
      scheduleError: "ৰিমাইণ্ডাৰ ছেট কৰিব পৰা নগ'ল।",
      cancelError: "ৰিমাইণ্ডাৰ বাতিল কৰিব পৰা নগ'ল।",
      defaultMessage: "মৈত্ৰীৰ পৰা এখন স্মৰণীয় বাৰ্তা",
      presets: {
        "1day": "১ দিনত",
        "2day": "২ দিনত",
        "3day": "৩ দিনত",
        "1week": "১ সপ্তাহত"
      }
    },
    login: {
      googleLogin: "Google ৰ জৰিয়তে আগবাঢ়ক",
      loading: "লোড হৈ আছে, অপেক্ষা কৰক..."
    },
    counselor: {
      title: "কাউন্সেলৰৰ সৈতে কথা-বাৰ্তা",
      description:
        "যদি আপুনি দিশনির্দেশনা বা সহানুভূতি-পূৰ্ণ আলোচনাৰ প্ৰয়োজন বোধ কৰে, তেন্তে আমাৰ অভিজ্ঞ কাউন্সেলৰৰ সৈতে যোগাযোগ কৰক — গোপনীয় আৰু বুজাবুজিৰ সৈতে।",
      name: "Dr. Dhritam Tapatkam Dehi",
      namePlaceholder: "আপোনাৰ নাম",
      email: "ইমেইল",
      emailPlaceholder: "আপোনাৰ ইমেইল",
      message: "বাৰ্তা",
      messagePlaceholder: "আপোনাৰ কথা ইয়াত লিখক...",
      requestSession: "ছেছনৰ অনুৰোধ কৰক",
      requestSubmitted:
        "আপোনাৰ অনুৰোধ লাভ কৰা হৈছে। অতি সোনকালে আমাৰ দল আপোনাৰ সৈতে যোগাযোগ কৰিব।",
      qualifications: "যোগ্যতা",
      qualificationsDetails:
        "Ph.D. (Clinical Psychology), মান্যতাপ্ৰাপ্ত CBT প্ৰশিক্ষক",
      experience: "অভিজ্ঞতা",
      experienceDetails:
        "মানসিক স্বাস্থ্য আৰু পৰামৰ্শক্ষেত্ৰত ১০ বছৰৰ অধিক অভিজ্ঞতা — উৎকণ্ঠা, বিষন্নতা আৰু চাপ পৰিচালনাত বিশেষজ্ঞ",
      languages: "ভাষা",
      languagesDetails: "অসমীয়া, হিন্দী, ইংৰাজী",
      availability: "উপলব্ধতা",
      availabilityDetails: "সোমবাৰ – শুক্ৰবাৰ, ০৯:০০ AM – ০৫:০০ PM",
      callButton: "কল কৰক +91 9999999999",
      form: {
        submit: "অনুৰোধ পঠিয়াওক",
        name: "নাম",
        namePlaceholder: "আপোনাৰ পূৰ্ণ নাম লিখক",
        email: "ইমেইল",
        emailPlaceholder: "আপোনাৰ ইমেইল ঠিকনা লিখক",
        message: "বাৰ্তা",
        messagePlaceholder: "আপোনাৰ চিন্তা বা প্ৰশ্ন ইয়াত লিখক"
      }
    },
    aboutMaitri: {
      heroTitle: "মৈত্ৰীৰ বিষয়ে",
      heroDescription:
        "মৈত্রী হৈছে মানসিক স্বাস্থ্যক লৈ সচেতনতা বৃদ্ধি আৰু দৈনন্দিন জীৱনত মানসিক কল্যাণৰ বাবে সহায়কৰ জৰিয়া প্ৰদান কৰিবলৈ নিৰ্মিত এটা প্লাটফৰ্ম। আমি সুৰক্ষিত, অন্তৰ্ভুক্তিমূলক আৰু সহায়ক পৰিৱেশ গঢ়ি তোলাত প্ৰতিজ্ঞাবদ্ধ।",
      missionTitle: "আমাৰ লক্ষ্য",
      missionDescription:
        "ব্য়ক্তিসকলক আত্ম-যত্নৰ বাবে সক্ষম কৰা — জাৰ্নেলিং, পৰামৰ্শ আৰু সমষ্টিগত সহায়ৰ জৰিয়তে। আমি মানসিক স্বাস্থ্যৰ ওপৰত মুক্ত আৰু সন্মানজনক আলোচনা প্ৰচাৰ কৰোঁ।",
      visionTitle: "আমাৰ দৃষ্টি",
      visionDescription:
        "এটা সমাজ য'ত মানসিক স্বাস্থ্যক শাৰীৰিক স্বাস্থ্যৰ সমান গুৰুত্ব দিয়া হয় আৰু সহায় সকলোৰে বাবে সহজলভ্য হয়।",
      featuresTitle: "আমাৰ সুবিধাসমূহ",
      features: [
        "মনোভাৱ আৰু অনুভূতিত জাৰ্নেলিং।",
        "ততালিকে সহায়ৰ বাবে ইণ্টাৰেক্টিভ চেটবট।",
        "আপোনাৰ প্ৰগতি দেখুৱাবলৈ মানসিক সূচক আৰু স্ক্ৰিনিং ফলাফল।",
        "মানসিক স্বাস্থ্যৰ ওপৰত শিক্ষামূলক লেখ আৰু ভিডিও।",
        "সম্প্ৰদায়-ভিত্তিক সহায় আৰু বিশেষজ্ঞ পৰামৰ্শ।"
      ],
      videosTitle: "সহায়ক ভিডিও",
      tipsTitle: "মানসিক স্বাস্থ্যৰ পৰামৰ্শ",
      tips: [
        "প্ৰতিদিনে কৃতজ্ঞতা প্ৰকাশৰ অভ্যাস গঢ়ি তুলক।",
        "নিয়মিত ব্যায়ামে মন ভাল কৰে আৰু চাপ হ্ৰাস কৰে।",
        "বন্ধু-বন্ধনী আৰু পৰিয়ালৰ সৈতে জড়িত থাকক।",
        "ডাঙৰ লক্ষ্যক সৰু-সৰু পদক্ষেপত বিভক্ত কৰক।",
        "সময়-সময়ত চ'চিয়েল মিডিয়াৰ পৰা দূৰত্ব ৰাখক।",
        "প্ৰতিদিনে গভীৰ শ্বাস বা ধ্যানৰ অভ্যাস কৰক।"
      ],
      faqsTitle: "প্ৰায়শই সোধা প্ৰশ্ন",
      faq1: {
        question: "মৈত্রী কি?",
        answer:
          "মৈত্রী হৈছে এটা প্লাটফৰ্ম যি জাৰ্নেলিং, পৰামৰ্শ আৰু সম্প্ৰদায়ৰ সহায়ৰ জৰিয়তে মানসিক স্বাস্থ্য সমৰ্থন কৰে।"
      },
      faq2: {
        question: "এইটো কি বিনামূলীয়া?",
        answer: "হয় — মৈত্রী সকলোৰে বাবে বিনামূলীয়া।"
      },
      faq3: {
        question: "মই কি মোৰ প্ৰগতি ট্ৰেক কৰিব পাৰিম?",
        answer:
          "অৱশ্যে — আমাৰ টুলত আপোনাৰ মানসিক অৱস্থা আৰু স্ক্ৰিনিং ফলাফল সময়ৰ লগত দেখুৱাই।"
      },
      faq4: {
        question: "মোৰ তথ্য সুৰক্ষিত নে?",
        answer:
          "সম্পূৰ্ণ সুৰক্ষিত। আপোনাৰ তথ্য গোপনীয়তাৰে ৰখা হয় আৰু কেৱল আপোনাৰ অনুমতিতহে ভাগ কৰা হয়।"
      },
      testimonialsTitle: "ব্যৱহাৰকাৰীৰ মতামত",
      testimonials: [
        "মৈত্ৰীয়ে মোক চাপ নিয়ন্ত্ৰণত সত্যিই সহায় কৰিছে।",
        "জাৰ্নেলিং সুবিধাটোৱে মোৰ অনুভূতি বুজিবলৈ সহায় কৰে।",
        "বিশেষজ্ঞ পৰামৰ্শ আৰু সম্প্ৰদায়ৰ সহায় যথেষ্ট উপকাৰী।"
      ],
      contactTitle: "মৈত্ৰীৰ সৈতে আৰম্ভ কৰক",
      contactDescription:
        "মানসিক স্বাস্থ্যৰ উন্নতিৰ বাবে আপোনাৰ পদক্ষেপ আজিয়েই লওক — আমাৰ জাৰ্নেলিং আৰু সহায় সুবিধাসমূহ ব্যৱহাৰ কৰি চাওক।",
      startButton: "জাৰ্নেলিং আৰম্ভ কৰক"
    }
  }
}

};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
