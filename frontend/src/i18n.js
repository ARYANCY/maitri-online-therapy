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
        treasure: "Campus Highlights",
        notFound: "Tab not found",
      },
      loading: "Loading your space...",
      error: {
        generic: "Something went wrong. Please try again.",
        sessionCheckFailed: "Session check failed:",
        fetchFailed: "Could not load dashboard data:",
        updateTodosFailed: "Unable to update your tasks:",
      },
      downloadReport: "Download Report",
      downloading: "Generating Report..."
    },
    maitriTreasure: {
        title: "Explore Gauhati University",
        description: "Discover the best canteens, food spots, and hangout places on campus. Meet friends, enjoy meals, and explore the vibrant life of Gauhati University.",
        faqsTitle: "FAQs",
        startButton: "Start Exploring",
        carouselAlt0: "Gauhati University Spot 1",
        carouselAlt1: "Gauhati University Spot 2",
        carouselAlt2: "Gauhati University Spot 3",
        faqs: [
          { question: "What is Maitri Treasure?", answer: "A platform to explore Gauhati University, discover its canteens, food spots, and social hangouts." },
          { question: "Who can participate?", answer: "All students and staff of Gauhati University are welcome." },
          { question: "Is it free?", answer: "Yes, it’s completely free to use and enjoy." },
          { question: "How do I start?", answer: "Click the 'Start Exploring' button to begin exploring the campus." }
        ]
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
        emotionalMetrics: "Emotional Well-being Metrics",
        screeningMetrics: "Screening Assessment Metrics",
        barChart: "Bar Chart View",
        lineChart: "Line Chart View",
        noMetrics: "No data available to display yet.",
        stress: "Stress Level",
        happiness: "Happiness Level",
        anxiety: "Anxiety Level",
        overallMood: "Overall Mood",
        phq9: "PHQ-9 Score",
        gad7: "GAD-7 Score",
        ghq: "GHQ Score",
        title: "User Metrics"
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
       talk: {
        title: "Talk to a Counselor",
        subtitle: "Our verified counselors are ready to assist you professionally.",
        loading: "Loading counselors...",
        noCounselors: "No counselors available right now.",
        email: "Email",
        phone: "Phone",
        specialization: "Specialization",
        experience: "Experience",
        years: "yrs",
        qualifications: "Qualifications",
        callNow: "Call Now",
        footer: "Empowering mental wellness",
        therapistForm: "Therapist Form",
        adminDashboard: "Admin Dashboard",
        errorFetching: "Error fetching counselors"
      },
      aboutMaitri: {
        heroTitle: "About Maitri",
        heroDescription:
          "Maitri is dedicated to promoting mental health awareness and providing tools for emotional well-being. We strive to create a safe, supportive, and accessible space where everyone feels heard and valued.",

        missionTitle: "Our Mission",
        missionDescription:
          "To empower individuals to take charge of their mental health through journaling, guided resources, and compassionate community support. We aim to break the stigma around mental health and encourage open, meaningful conversations.",

        visionTitle: "Our Vision",
        visionDescription:
          "A world where mental health is treated with the same importance as physical health, and where every individual has access to the care and support they need.",

        featuresTitle: "What We Offer",
        features: [
          "Guided journaling to reflect on your emotions and track your progress.",
          "An interactive chatbot for real-time support and guidance.",
          "Personalized emotional insights and screening tools.",
          "Educational articles, videos, and resources on well-being.",
          "A supportive community space with expert advice and peer encouragement.",
          "Accessible, stigma-free tools designed for everyone."
        ],

        videosTitle: "Helpful Videos",

        tipsTitle: "Mental Health Tips",
        tips: [
          "Practice daily gratitude by writing down things you’re thankful for.",
          "Exercise regularly to boost your mood and reduce stress.",
          "Stay connected with friends and family for emotional support.",
          "Break big goals into small, achievable steps.",
          "Take digital detox breaks from social media to recharge.",
          "Practice mindfulness, meditation, or deep breathing each day.",
          "Seek professional help when you need it—asking for support is a strength."
        ],

        faqsTitle: "FAQs",
        faq1: {
          question: "What is Maitri?",
          answer:
            "Maitri is a digital platform that supports mental health through journaling, guided resources, and community care."
        },
        faq2: {
          question: "Is Maitri free to use?",
          answer: "Yes! Maitri is completely free and accessible to everyone."
        },
        faq3: {
          question: "Can I track my mental health progress?",
          answer:
            "Absolutely. Maitri helps you reflect on your emotions over time, so you can see your growth and patterns."
        },
        faq4: {
          question: "Is my data private and secure?",
          answer:
            "Yes. Your privacy matters to us. All your data is encrypted, kept secure, and never shared without your consent."
        },
        faq5: {
          question: "Who can benefit from Maitri?",
          answer:
            "Maitri is designed for anyone seeking to improve their mental well-being—students, professionals, caregivers, or anyone on their self-care journey."
        },

        testimonialsTitle: "What Our Users Say",
        testimonials: [
          "Maitri has helped me manage stress and anxiety in a simple, effective way.",
          "The journaling tool makes self-reflection easier and more meaningful.",
          "I love the supportive community—it makes me feel less alone.",
          "The chatbot is so helpful when I just need someone to listen.",
          "Maitri has become an important part of my self-care routine."
        ],

        contactTitle: "Get Started with Maitri",
        contactDescription:
          "Take the first step toward better mental health today. Start journaling, explore our guided tools, and connect with a supportive community.",
        startButton: "Start Your Journey",

        treasureTitle: "Discover Maitri Treasure",
        treasureDescription:
          "Students can explore hidden gems around campus—cafes, study spots, canteens, and chill zones. Connect with friends, join communities, and make every day an adventure!",
        treasureFeature1: "Find the best cafes and hangout spots around Gauhati University, Guwahati",
        treasureFeature2: "Meet like-minded friends and grow your network",
        treasureFeature3: "Track your favorite study corners and campus events",
        treasureFeature4: "Share tips, stories, and hidden gems with peers",
        treasureButton: "Start the Treasure Hunt",

        medicoTitle: "Maitri Medico",
        medicoDescription:
          "Reliable guidance and resources for mental health concerns. Tools, information, and support to improve your well-being anytime you need it.",
        medicoButton: "Visit Maitri Medico",
        medicoLink: "https://maitri-medico.vercel.app"
      },
      "report": {
          "title": "Maitri Mental Health Report",
          "disclaimer.1": "This report is AI-generated for self-assessment purposes only.",
          "disclaimer.2": "Consult a licensed mental health professional for any medical evaluation.",
          "disclaimerShort": "AI-generated self-assessment, not a clinical diagnosis.",
          "generatedAt": "Generated at",
          "institution": "Institution"
        },
  "university": { "name": "Gauhati University", "location": "Guwahati, Assam, India" },
  "section": { "userProfile": "User Profile" },
  "user": { "name": "Name", "email": "Email", "language": "Preferred Language", "guest": "Guest User" },
  "table": { "metric": "Metric", "value": "Value", "interpretation": "Interpretation", "description": "Description", "ideal": "Ideal Range / Meaning" },
  "footer": { "text": "Generated by Maitri Dashboard | Gauhati University ©" },
  "interpretation": { "unavailable": "Not available", "healthy": "Healthy range", "moderate": "Moderate concern", "severe": "Requires attention" },
  "metrics": {
    "anxiety": { "label": "Anxiety", "description": "Measures the level of worry, nervousness, and unease.", "ideal": "≤ 5 indicates low anxiety (healthy range)." },
    "depression": { "label": "Depression", "description": "Reflects sadness, hopelessness, and disinterest levels.", "ideal": "≤ 5 indicates stable mood (healthy range)." },
    "stress": { "label": "Stress", "description": "Assesses mental strain, tension, and irritability.", "ideal": "≤ 7 suggests manageable stress levels." },
    "sleep_quality": { "label": "Sleep Quality", "description": "Represents overall sleep satisfaction and restfulness.", "ideal": "≥ 7 indicates good sleep quality." },
    "social_support": { "label": "Social Support", "description": "Measures perceived emotional and social backing.", "ideal": "≥ 7 suggests strong support network." },
    "resilience": { "label": "Resilience", "description": "Reflects recovery ability after setbacks or stress.", "ideal": "≥ 8 indicates strong resilience." },
    "self_esteem": { "label": "Self Esteem", "description": "Represents self-confidence and perceived self-worth.", "ideal": "≥ 7 indicates healthy self-image." },
    "life_satisfaction": { "label": "Life Satisfaction", "description": "Represents overall contentment with life and direction.", "ideal": "≥ 8 suggests strong satisfaction with life." }
  },

       admin: {
        title: "Therapist Applications",
        description: "Manage and review therapist applications submitted by professionals. Approve trusted therapists to connect faster, or reject unverified entries for quality assurance.",
        goDashboard: "Go to Dashboard",
        table: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          specialization: "Specialization",
          experience: "Experience",
          qualifications: "Qualifications",
          status: "Status",
          actions: "Actions"
        },
        noApplications: "No applications found.",
        years: "yrs",
        accept: "Accept",
        reject: "Reject",
        talkCounselor: "Talk to Counselor",
        therapistForm: "Therapist Form",
        errorFetch: "Error fetching therapist applications",
        errorReject: "Error rejecting therapist",
        errorAccept: "Error accepting therapist"
      }

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
        treasure: "कैम्पस हाइलाइट्स",
        notFound: "टैब नहीं मिला"
      },
      loading: "आपका डैशबोर्ड लोड किया जा रहा है...",
      error: {
        generic: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
        sessionCheckFailed: "सेशन जांच विफल:",
        fetchFailed: "डैशबोर्ड डेटा लाने में त्रुटि:",
        updateTodosFailed: "टास्क अपडेट नहीं हो पाए:"
      },
      downloadReport: "रिपोर्ट डाउनलोड करें",
      downloading: "रिपोर्ट बनाई जा रही है..."
    },
    "maitriTreasure": {
      "title": "गुवाहाटी विश्वविद्यालय का अन्वेषण करें",
      "description": "कैंटीन, खाने-पीने की जगहों और कैंपस के हँगआउट स्थानों को खोजें। दोस्तों से मिलें, भोजन का आनंद लें और गुवाहाटी विश्वविद्यालय के जीवंत जीवन का अनुभव करें।",
      "faqsTitle": "सामान्य प्रश्न",
      "startButton": "अन्वेषण शुरू करें",
      "carouselAlt0": "गुवाहाटी विश्वविद्यालय स्थल 1",
      "carouselAlt1": "गुवाहाटी विश्वविद्यालय स्थल 2",
      "carouselAlt2": "गुवाहाटी विश्वविद्यालय स्थल 3",
      "faqs": [
        { "question": "मैत्री ट्रेजर क्या है?", "answer": "गुवाहाटी विश्वविद्यालय का पता लगाने, इसके कैंटीन, खाने-पीने की जगहों और सामाजिक हँगआउट को खोजने के लिए एक प्लेटफ़ॉर्म।" },
        { "question": "कौन भाग ले सकता है?", "answer": "गुवाहाटी विश्वविद्यालय के सभी छात्र और कर्मचारी स्वागत योग्य हैं।" },
        { "question": "क्या यह मुफ्त है?", "answer": "हाँ, इसे पूरी तरह से मुफ्त उपयोग और आनंद के लिए बनाया गया है।" },
        { "question": "मैं कैसे शुरू करूं?", "answer": "'खजाने की खोज शुरू करें' बटन पर क्लिक करके कैंपस का अन्वेषण शुरू करें।" }
      ]
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
    emotionalMetrics: "भावनात्मक कल्याण मेट्रिक्स",
    screeningMetrics: "स्क्रीनिंग मूल्यांकन मेट्रिक्स",
    barChart: "बार चार्ट दृश्य",
    lineChart: "लाइन चार्ट दृश्य",
    noMetrics: "प्रदर्शित करने के लिए कोई डेटा उपलब्ध नहीं है।",
    stress: "तनाव स्तर",
    happiness: "खुशी का स्तर",
    anxiety: "चिंता स्तर",
    overallMood: "कुल मनोदशा",
    phq9: "PHQ-9 स्कोर",
    gad7: "GAD-7 स्कोर",
    ghq: "GHQ स्कोर",
    title: "उपयोगकर्ता मेट्रिक्स"
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
    talk: {
        title: "सलाहकार से बात करें",
        subtitle: "हमारे सत्यापित सलाहकार पेशेवर रूप से आपकी मदद करने के लिए तैयार हैं।",
        loading: "सलाहकार लोड हो रहे हैं...",
        noCounselors: "अभी कोई सलाहकार उपलब्ध नहीं है।",
        email: "ईमेल",
        phone: "फोन",
        specialization: "विशेषता",
        experience: "अनुभव",
        years: "वर्ष",
        qualifications: "योग्यताएँ",
        callNow: "अब कॉल करें",
        footer: "मानसिक स्वास्थ्य को सशक्त बनाना",
        therapistForm: "थेरपिस्ट फॉर्म",
        adminDashboard: "एडमिन डैशबोर्ड",
        errorFetching: "सलाहकार लाने में त्रुटि"
      },
      aboutMaitri: {
        heroTitle: "मैत्री के बारे में",
        heroDescription:
          "मैत्री मानसिक स्वास्थ्य जागरूकता को बढ़ावा देने और भावनात्मक कल्याण के लिए उपकरण प्रदान करने के लिए समर्पित है। हम एक सुरक्षित, सहायक और सुलभ स्थान बनाने का प्रयास करते हैं जहाँ हर किसी को सुना और महत्व दिया जाए।",

        missionTitle: "हमारा मिशन",
        missionDescription:
          "लोगों को जर्नलिंग, मार्गदर्शित संसाधनों और सहानुभूतिपूर्ण सामुदायिक समर्थन के माध्यम से अपने मानसिक स्वास्थ्य की जिम्मेदारी लेने के लिए सशक्त बनाना। हम मानसिक स्वास्थ्य से जुड़ी धारणाओं को तोड़ने और खुली, सार्थक बातचीत को प्रोत्साहित करने का लक्ष्य रखते हैं।",

        visionTitle: "हमारा विज़न",
        visionDescription:
          "एक ऐसी दुनिया जहाँ मानसिक स्वास्थ्य को शारीरिक स्वास्थ्य जितना ही महत्व दिया जाए और हर व्यक्ति को देखभाल और समर्थन उपलब्ध हो।",

        featuresTitle: "हम क्या प्रदान करते हैं",
        features: [
          "मार्गदर्शित जर्नलिंग जिससे आप अपनी भावनाओं पर विचार कर सकें और प्रगति का ट्रैक रख सकें।",
          "वास्तविक समय सहायता और मार्गदर्शन के लिए इंटरैक्टिव चैटबॉट।",
          "व्यक्तिगत भावनात्मक अंतर्दृष्टि और स्क्रीनिंग उपकरण।",
          "कल्याण पर शैक्षिक लेख, वीडियो और संसाधन।",
          "विशेषज्ञ सलाह और साथियों के प्रोत्साहन के साथ एक सहायक सामुदायिक स्थान।",
          "हर किसी के लिए सुलभ और कलंक-मुक्त उपकरण।"
        ],

        videosTitle: "उपयोगी वीडियो",

        tipsTitle: "मानसिक स्वास्थ्य सुझाव",
        tips: [
          "प्रतिदिन उन चीज़ों को लिखें जिनके लिए आप आभारी हैं।",
          "नियमित व्यायाम करें ताकि मूड बेहतर हो और तनाव कम हो।",
          "मित्रों और परिवार से जुड़े रहें।",
          "बड़े लक्ष्यों को छोटे-छोटे चरणों में बाँटें।",
          "डिजिटल डिटॉक्स लें और सोशल मीडिया से ब्रेक लें।",
          "प्रतिदिन ध्यान, मेडिटेशन या गहरी साँसों का अभ्यास करें।",
          "जब ज़रूरत हो तो पेशेवर मदद लें—समर्थन माँगना एक ताक़त है।"
        ],

        faqsTitle: "अक्सर पूछे जाने वाले प्रश्न",
        faq1: {
          question: "मैत्री क्या है?",
          answer:
            "मैत्री एक डिजिटल प्लेटफ़ॉर्म है जो जर्नलिंग, मार्गदर्शन और सामुदायिक देखभाल के माध्यम से मानसिक स्वास्थ्य का समर्थन करता है।"
        },
        faq2: {
          question: "क्या मैत्री का उपयोग निःशुल्क है?",
          answer: "हाँ! मैत्री पूरी तरह से मुफ़्त और सभी के लिए सुलभ है।"
        },
        faq3: {
          question: "क्या मैं अपनी मानसिक स्वास्थ्य प्रगति को ट्रैक कर सकता/सकती हूँ?",
          answer: "बिल्कुल। मैत्री आपको समय के साथ अपनी भावनाओं पर विचार करने में मदद करता है ताकि आप अपनी प्रगति देख सकें।"
        },
        faq4: {
          question: "क्या मेरा डेटा सुरक्षित है?",
          answer: "हाँ। आपका डेटा एन्क्रिप्टेड और सुरक्षित रूप से संग्रहित है और आपकी अनुमति के बिना साझा नहीं किया जाएगा।"
        },
        faq5: {
          question: "मैत्री किसके लिए उपयोगी है?",
          answer: "मैत्री उन सभी के लिए है जो अपने मानसिक स्वास्थ्य को बेहतर बनाना चाहते हैं—छात्र, पेशेवर, देखभाल करने वाले या आत्म-देखभाल के यात्रा पर कोई भी।"
        },

        testimonialsTitle: "हमारे उपयोगकर्ता क्या कहते हैं",
        testimonials: [
          "मैत्री ने मुझे तनाव और चिंता को बेहतर तरीके से संभालने में मदद की।",
          "जर्नलिंग टूल ने आत्म-चिंतन को आसान और सार्थक बना दिया।",
          "सहायक समुदाय मुझे अकेला महसूस नहीं होने देता।",
          "चैटबॉट बहुत उपयोगी है जब मुझे किसी से बात करने की ज़रूरत होती है।",
          "मैत्री अब मेरी आत्म-देखभाल दिनचर्या का एक महत्वपूर्ण हिस्सा है।"
        ],

        contactTitle: "मैत्री के साथ शुरुआत करें",
        contactDescription:
          "आज ही बेहतर मानसिक स्वास्थ्य की ओर पहला कदम उठाएँ। जर्नलिंग शुरू करें, हमारे मार्गदर्शित उपकरणों को आज़माएँ और सहायक समुदाय से जुड़ें।",
        startButton: "अपनी यात्रा शुरू करें",

        treasureTitle: "मैत्री ट्रेज़र की खोज करें",
        treasureDescription:
          "छात्र कैम्पस के आसपास छिपी हुई जगहों—कैफे, अध्ययन स्थल, कैंटीन और आराम क्षेत्रों की खोज कर सकते हैं। दोस्तों से जुड़ें, समुदाय में शामिल हों और हर दिन को एक रोमांचक अनुभव बनाएं!",
        treasureFeature1: "गुवाहाटी विश्वविद्यालय,गुवाहाटी के सर्वश्रेष्ठ कैफे और हांगआउट स्पॉट खोजें",
        treasureFeature2: "समान विचारधारा वाले दोस्तों से मिलें और अपना नेटवर्क बनाएं",
        treasureFeature3: "अपने पसंदीदा अध्ययन स्थल और आयोजनों का ट्रैक रखें",
        treasureFeature4: "टिप्स, कहानियाँ और छिपी हुई जगहों को साथियों के साथ साझा करें",
        treasureButton: "ट्रेज़र हंट शुरू करें",

        medicoTitle: "मैत्री मेडिको",
        medicoDescription:
          "मानसिक स्वास्थ्य से जुड़े किसी भी विषय पर भरोसेमंद मार्गदर्शन। संसाधन, उपकरण और जानकारी के साथ आपकी मानसिक भलाई का समर्थन करें।",
        medicoButton: "मैत्री मेडिको देखें",
        medicoLink: "https://maitri-medico.vercel.app"
      },
      
  "report": {
    "title": "मैत्री मानसिक स्वास्थ्य रिपोर्ट",
    "disclaimer.1": "यह रिपोर्ट केवल आत्म-मूल्यांकन के लिए AI द्वारा बनाई गई है।",
    "disclaimer.2": "किसी भी चिकित्सकीय मूल्यांकन के लिए योग्य मानसिक स्वास्थ्य पेशेवर से परामर्श लें।",
    "disclaimerShort": "AI द्वारा बनाई गई आत्म-मूल्यांकन रिपोर्ट, नैदानिक नहीं।",
    "generatedAt": "निर्मित समय",
    "institution": "संस्थान"
  },
  "university": {
    "name": "गुवाहाटी विश्वविद्यालय",
    "location": "गुवाहाटी, असम, भारत"
  },
  "section": {
    "userProfile": "उपयोगकर्ता प्रोफ़ाइल"
  },
  "user": {
    "name": "नाम",
    "email": "ईमेल",
    "language": "पसंदीदा भाषा",
    "guest": "अतिथि उपयोगकर्ता"
  },
  "table": {
    "metric": "मेट्रिक",
    "value": "मान",
    "interpretation": "व्याख्या",
    "description": "विवरण",
    "ideal": "सर्वश्रेष्ठ सीमा / अर्थ"
  },
  "footer": {
    "text": "मैत्री डैशबोर्ड द्वारा जनरेट | गुवाहाटी विश्वविद्यालय ©"
  },
  "interpretation": {
    "unavailable": "उपलब्ध नहीं",
    "healthy": "स्वस्थ सीमा",
    "moderate": "मध्यम चिंता",
    "severe": "ध्यान आवश्यक"
  },
  "metrics": {
    "anxiety": {
      "label": "चिंता",
      "description": "चिंता, तनाव और बेचैनी के स्तर को मापता है।",
      "ideal": "≤ 5 कम चिंता (स्वस्थ सीमा) संकेत करता है।"
    },
    "depression": {
      "label": "अवसाद",
      "description": "उदासी, निराशा और असंतोष के स्तर को दर्शाता है।",
      "ideal": "≤ 5 स्थिर मूड (स्वस्थ सीमा) संकेत करता है।"
    },
    "stress": {
      "label": "तनाव",
      "description": "मानसिक दबाव, तनाव और चिड़चिड़ापन को मापता है।",
      "ideal": "≤ 7 प्रबंधनीय तनाव स्तर का सुझाव देता है।"
    },
    "sleep_quality": {
      "label": "नींद की गुणवत्ता",
      "description": "कुल नींद संतुष्टि और आराम का प्रतिनिधित्व करता है।",
      "ideal": "≥ 7 अच्छी नींद गुणवत्ता को दर्शाता है।"
    },
    "social_support": {
      "label": "सामाजिक समर्थन",
      "description": "अनुभूतिपूर्ण भावनात्मक और सामाजिक समर्थन को मापता है।",
      "ideal": "≥ 7 मजबूत समर्थन नेटवर्क का सुझाव देता है।"
    },
    "resilience": {
      "label": "लचीलापन",
      "description": "असफलताओं या तनाव के बाद पुनर्प्राप्ति क्षमता को दर्शाता है।",
      "ideal": "≥ 8 मजबूत लचीलापन को दर्शाता है।"
    },
    "self_esteem": {
      "label": "आत्म-सम्मान",
      "description": "आत्मविश्वास और आत्म-मूल्य का प्रतिनिधित्व करता है।",
      "ideal": "≥ 7 स्वस्थ आत्म-छवि को दर्शाता है।"
    },
    "life_satisfaction": {
      "label": "जीवन संतोष",
      "description": "जीवन की सामान्य संतुष्टि और दिशा को दर्शाता है।",
      "ideal": "≥ 8 जीवन में मजबूत संतोष का सुझाव देता है।"
    }
  },


    admin: {
        title: "थेरैपिस्ट आवेदन",
        description: "पेशेवरों द्वारा जमा किए गए थेरैपिस्ट आवेदन प्रबंधित और समीक्षा करें। भरोसेमंद थेरैपिस्ट को मंज़ूरी दें, या गैर-प्रमाणित प्रविष्टियों को अस्वीकार करें।",
        goDashboard: "डैशबोर्ड पर जाएँ",
        table: {
          name: "नाम",
          email: "ईमेल",
          phone: "फोन",
          specialization: "विशेषज्ञता",
          experience: "अनुभव",
          qualifications: "योग्यता",
          status: "स्थिति",
          actions: "क्रियाएँ"
        },
        noApplications: "कोई आवेदन नहीं मिला।",
        years: "साल",
        accept: "मंज़ूर करें",
        reject: "अस्वीकृत करें",
        talkCounselor: "काउंसलर से बात करें",
        therapistForm: "थेरैपिस्ट फॉर्म",
        errorFetch: "थेरैपिस्ट आवेदन लाने में त्रुटि",
        errorReject: "थेरैपिस्ट को अस्वीकार करने में त्रुटि",
        errorAccept: "थेरैपिस्ट को मंज़ूर करने में त्रुटि"
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
        treasure:"কেম্পাছ হাইলাইটছ",
        notFound: "টেব পোৱা নগ'ল"
      },
      loading: "আপোনাৰ ডেশ্বব'ৰ্ড লোড হ'বলৈ অপেক্ষা কৰক...",
      error: {
        generic: "এটা ত্ৰুটি হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
        sessionCheckFailed: "ছেছন পৰীক্ষা বিফল:",
        fetchFailed: "ডেশ্বব'ৰ্ডৰ তথ্য আহৰণ কৰোঁতে ত্ৰুটি:",
        updateTodosFailed: "কামবোৰ আপডেট কৰিব পৰা নগ'ল:"
      },
      downloadReport: "ৰিপোৰ্ট ডাউনলোড কৰক",
      downloading: "ৰিপোৰ্ট প্ৰস্তুত কৰি আছে..."
    },
    "maitriTreasure": {
      "title": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ অনুসন্ধান কৰক",
      "description": "কেণ্টিন, খাদ্যস্থান আৰু কেম্পাছৰ হেংআউট স্থানবোৰ অন্বেষণ কৰক। বন্ধু-বান্ধৱীৰ লগত মিলিত হওক, আহাৰ উপভোগ কৰক আৰু গুৱাহাটী বিশ্ববিদ্যালয়ৰ উজ্জ্বল জীৱন অনুভৱ কৰক।",
      "faqsTitle": "সাধাৰণ প্ৰশ্নসমূহ",
      "startButton": "অনুসন্ধান আৰম্ভ কৰক",
      "carouselAlt0": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ স্থান ১",
      "carouselAlt1": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ স্থান ২",
      "carouselAlt2": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ স্থান ৩",
      "faqs": [
        { "question": "মৈত্রী ট্রেজাৰ কি?", "answer": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ সন্ধান কৰিবলৈ, ইয়াৰ কেণ্টিন, খাদ্যস্থান আৰু সামাজিক হেংআউটবোৰ অন্বেষণ কৰাৰ বাবে এখন প্লেটফৰ্ম।" },
        { "question": "কে অংশগ্ৰহণ কৰিব পাৰে?", "answer": "গুৱাহাটী বিশ্ববিদ্যালয়ৰ সকলো ছাত্ৰ-ছাত্রী আৰু কৰ্মচাৰী স্বাগতম।" },
        { "question": "এইটো কি বিনামূল্যে?", "answer": "হয়, ই সম্পূর্ণৰূপে বিনামূল্যতে ব্যৱহাৰ কৰিবলৈ আৰু উপভোগ কৰিবলৈ।" },
        { "question": "মই কেনেকৈ আৰম্ভ কৰিম?", "answer": "'ট্ৰেজাৰ হান্ট আৰম্ভ কৰক' বুটামত ক্লিক কৰি কেম্পাছৰ অনুসন্ধান আৰম্ভ কৰক।" }
      ]
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
      emotionalMetrics: "ভাৱনাগত কল্যাণ মেট্ৰিক্স",
      screeningMetrics: "স্ক্ৰীণিং মূল্যাংকন মেট্ৰিক্স",
      barChart: "বার চাৰ্ট দৃশ্য",
      lineChart: "লাইন চাৰ্ট দৃশ্য",
      noMetrics: "প্ৰদৰ্শনৰ বাবে কোনো ডাটা উপলব্ধ নাই।",
      stress: "মানসিক চাপৰ স্তৰ",
      happiness: "সুখৰ স্তৰ",
      anxiety: "উদ্বেগৰ স্তৰ",
      overallMood: "সৰ্বমোট মনোভাৱ",
      phq9: "PHQ-9 স্ক'ৰ",
      gad7: "GAD-7 স্ক'ৰ",
      ghq: "GHQ স্ক'ৰ",
      title: "ব্যৱহাৰকাৰী মেট্ৰিক্স"
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
     talk: {
        title: "একজন পৰামৰ্শদাতাৰ সৈতে কথা কৰক",
        subtitle: "আমাৰ প্ৰমাণিত পৰামৰ্শদাতাসকলে আপোনাক পেচাদাৰীভাৱে সহায় কৰিবলৈ সাজু।",
        loading: "পৰামৰ্শদাতাসকল লোড হৈ আছে...",
        noCounselors: "বৰ্তমান কোনো পৰামৰ্শদাতা উপলব্ধ নাই।",
        email: "ই-মেইল",
        phone: "ফোন",
        specialization: "বিশেষত্ব",
        experience: "অভিজ্ঞতা",
        years: "বছৰ",
        qualifications: "যোগ্যতা",
        callNow: "এতিয়া কল কৰক",
        footer: "মানসিক সু-স্বাস্থ্যক শক্তিশালী কৰা",
        therapistForm: "থেৰাপিষ্ট ফৰ্ম",
        adminDashboard: "প্ৰশাসক ডেছব’ৰ্ড",
        errorFetching: "পৰামৰ্শদাতা আনি ত্ৰুটি ঘটিল"
      },
      aboutMaitri: {
        heroTitle: "মৈত্ৰী সম্বন্ধে",
        heroDescription:
          "মৈত্ৰী মানসিক স্বাস্থ্য জাগৰণ আৰু মানসিক কল্যাণৰ বাবে এক প্লেটফৰ্ম। আমি সকলোকে সুৰক্ষিত, সহায়ক আৰু সহজগম্য পৰিবেশ প্ৰদান কৰোঁ।",

        missionTitle: "আমাৰ উদ্দেশ্য",
        missionDescription:
          "লোকসকলক জাৰ্নেলিং, পথপ্ৰদৰ্শক সঁজুলি আৰু সমৰ্থক সমাজৰ সহায়ত নিজৰ মানসিক স্বাস্থ্যৰ যত্ন ল’বলৈ ক্ষমতাশালী কৰা। আমি মানসিক স্বাস্থ্য সম্পৰ্কীয় কুসংস্কাৰ ভাঙি খোলা আৰু অৰ্থপূৰ্ণ আলোচনাক উৎসাহিত কৰো।",

        visionTitle: "আমাৰ দৰ্শন",
        visionDescription:
          "এটা বিশ্ব, য’ত মানসিক স্বাস্থ্যক শাৰীৰিক স্বাস্থ্যৰ সমান গুৰুত্ব দিয়া হয় আৰু প্ৰত্যেক ব্যক্তিয়ে প্ৰয়োজনীয় যত্ন আৰু সমৰ্থন লাভ কৰে।",

        featuresTitle: "আমিয়ে কি প্ৰদান কৰো",
        features: [
          "নিজৰ অনুভৱসমূহ বুজিবলৈ আৰু প্ৰগতিৰ খবৰ ৰাখিবলৈ পথপ্ৰদৰ্শক জাৰ্নেলিং।",
          "সজীৱ সহায় আৰু পৰামৰ্শৰ বাবে ইণ্টাৰেক্টিভ চেটবট।",
          "ব্যক্তিগত অনুভৱ আৰু পৰীক্ষা সঁজুলি।",
          "কল্যাণ সম্পৰ্কীয় শিক্ষামূলক প্ৰবন্ধ, ভিডিঅ’ আৰু সম্পদ।",
          "বিশেষজ্ঞৰ পৰামৰ্শ আৰু সহপাঠীৰ উৎসাহৰ সৈতে সমৰ্থক সমাজ।",
          "সকলৰ বাবে সহজগম্য আৰু কলঙ্ক-মুক্ত সঁজুলি।"
        ],

        videosTitle: "সহায়ক ভিডিঅ’সমূহ",

        tipsTitle: "মানসিক স্বাস্থ্য পৰামৰ্শ",
        tips: [
          "প্ৰতিদিনে কৃতজ্ঞতাৰ বিষয়বোৰ লিখি ৰাখক।",
          "মন ভাল কৰিবলৈ আৰু চাপ কমাবলৈ নিয়মিত ব্যায়াম কৰক।",
          "বন্ধু-বান্ধৱী আৰু পৰিয়ালৰ সৈতে সংযোগ ৰাখক।",
          "ডাঙৰ লক্ষ্যবোৰক সৰু-সৰু পদক্ষেপত বিভক্ত কৰক।",
          "ডিজিটেল ডিটক্স লওক আৰু সামাজিক মাধ্যমৰ পৰা কিছু সময় আঁতৰি থাকক।",
          "প্ৰতিদিনে ধ্যান, প্ৰাণায়াম বা গভীৰ নিশ্বাস লোৱাৰ অভ্যাস কৰক।",
          "প্ৰয়োজন হ’লে বিশেষজ্ঞৰ সহায় লওক।"
        ],

        faqsTitle: "প্ৰায় সোধা প্ৰশ্নসমূহ",
        faq1: {
          question: "মৈত্ৰী কি?",
          answer:
            "মৈত্ৰী এটা ডিজিটেল প্লেটফৰ্ম যি জাৰ্নেলিং, পথপ্ৰদৰ্শক সঁজুলি আৰু সমাজৰ সহায়ৰ জৰিয়তে মানসিক স্বাস্থ্যক সমৰ্থন দিয়ে।"
        },
        faq2: {
          question: "মৈত্ৰী বিনামূল্যে নে?",
          answer: "হয়, মৈত্ৰী সম্পূৰ্ণৰূপে বিনামূল্যে আৰু সকলোৰে বাবে উপলব্ধ।"
        },
        faq3: {
          question: "মই মোৰ মানসিক স্বাস্থ্যৰ প্ৰগতিৰ খবৰ ৰাখিব পাৰিম নে?",
          answer: "অৱশ্যে। মৈত্ৰী আপোনাক সময়ৰ লগে লগে নিজৰ অনুভৱবোৰ বুজিবলৈ সহায় কৰে।"
        },
        faq4: {
          question: "মোৰ তথ্য সুৰক্ষিত নে?",
          answer: "হয়। আপোনাৰ তথ্য এনক্রিপ্টেড আৰু সুৰক্ষিতভাৱে সংৰক্ষিত হৈ থাকে আৰু অনুমতি নোহোৱাকৈ শ্বেয়াৰ কৰা নহ’ব।"
        },
        faq5: {
          question: "মৈত্ৰী কাকৰ বাবে উপকাৰী?",
          answer: "মৈত্ৰী সকলোৰে বাবে যি নিজৰ মানসিক স্বাস্থ্য উন্নত কৰিব বিচাৰে—ছাত্ৰ, ব্যৱসায়ী বা আত্ম-যত্নৰ যাত্ৰাত থকা যিকোনো ব্যক্তি।"
        },

        testimonialsTitle: "আমাৰ ব্যৱহাৰকাৰীসকলৰ মতামত",
        testimonials: [
          "মৈত্ৰীয়ে মোক চাপ আৰু উৎকণ্ঠা নিয়ন্ত্ৰণ কৰিবলৈ সহায় কৰিছে।",
          "জাৰ্নেলিং সঁজুলিয়ে আত্ম-প্ৰতিফলন সহজ আৰু অৰ্থপূৰ্ণ কৰিছে।",
          "সমৰ্থক সমাজে মোক একাকী অনুভৱ কৰাব নোৱাৰিব।",
          "যেতিয়া মোক সহায়ৰ প্ৰয়োজন, চেটবটখনে যথেষ্ট সহায় কৰে।",
          "মৈত্ৰী এতিয়া মোৰ আত্ম-যত্নৰ দৈনন্দিন অংশ।"
        ],

        contactTitle: "মৈত্ৰীৰ সৈতে আৰম্ভ কৰক",
        contactDescription:
          "আজিহে মানসিক স্বাস্থ্যৰ দিশত প্ৰথম পদক্ষেপ লওক। জাৰ্নেলিং আৰম্ভ কৰক, পথপ্ৰদৰ্শক সঁজুলি অন্বেষণ কৰক আৰু সমৰ্থক সমাজৰ সৈতে সংযোগ কৰক।",
        startButton: "আপোনাৰ যাত্ৰা আৰম্ভ কৰক",

        treasureTitle: "মৈত্ৰী ট্রেজাৰ আবিষ্কাৰ কৰক",
        treasureDescription:
          "ছাত্ৰ-ছাত্ৰীয়ে কেম্পাছৰ ৰহস্যসমূহ—কেফে, অধ্যয়ন স্থান, কেণ্টিন আৰু বিশ্ৰাম অঞ্চল—অন্বেষণ কৰিব পাৰে। বন্ধু-বান্ধৱীৰ সৈতে সংযোগ কৰক, সমাজৰ অংশ হ’ব, আৰু প্ৰতিটো দিনক এক অভিযান হিচাপে উপভোগ কৰক!",
        treasureFeature1: "গুৱাহাটী বিশ্ববিদ্যালয়ৰ শ্ৰেষ্ঠ কেফে আৰু হেংআউট স্থানসমূহ সন্ধান কৰক",
        treasureFeature2: "সদৃশ মন থকা বন্ধু-বান্ধৱী লগ পাব আৰু আপোনাৰ নেটৱৰ্ক বৃদ্ধি কৰক",
        treasureFeature3: "আপোনাৰ প্ৰিয় অধ্যয়ন কোণ আৰু কেম্পাছৰ অনুষ্ঠানবোৰৰ খবৰ ৰাখক",
        treasureFeature4: "সহপাঠীৰ সৈতে টিপছ, গল্প আৰু ৰহস্য শ্বেয়াৰ কৰক",
        treasureButton: "ট্ৰেজাৰ হান্ট আৰম্ভ কৰক",

        medicoTitle: "মৈত্ৰী মেডিক’",
        medicoDescription:
          "মানসিক স্বাস্থ্য সম্পৰ্কীয় যিকোনো সমস্যাৰ বাবে নিৰ্ভৰযোগ্য সম্পদ। পৰামৰ্শ, সঁজুলি আৰু তথ্যৰ সৈতে আপোনাৰ মানসিক সু-স্বাস্থ্যৰ সহায় কৰক।",
        medicoButton: "মৈত্ৰী মেডিক’ ভিজিট কৰক",
        medicoLink: "https://maitri-medico.vercel.app"
      },
      "report": {
    "title": "মৈত্রী মানসিক স্বাস্থ্য প্ৰতিবেদন",
    "disclaimer.1": "এই প্ৰতিবেদনটি কেৱল আত্ম-মূল্যায়নৰ বাবে AI দ্বাৰা নিৰ্মিত।",
    "disclaimer.2": "যিকোনো চিকিৎসা মূল্যায়নৰ বাবে যোগ্য মানসিক স্বাস্থ্য বিশেষজ্ঞৰ সৈতে পৰামৰ্শ কৰক।",
    "disclaimerShort": "AI দ্বাৰা নিৰ্মিত আত্ম-মূল্যায়ন প্ৰতিবেদন, চিকিৎসা উদ্দেশ্যৰ নহয়।",
    "generatedAt": "নির্মাণৰ সময়",
    "institution": "প্ৰতিষ্ঠান"
  },
  "university": {
    "name": "গুৱাহাটী বিশ্ববিদ্যালয়",
    "location": "গুৱাহাটী, অসম, ভাৰত"
  },
  "section": {
    "userProfile": "ব্যৱহাৰকাৰীৰ প্ৰফাইল"
  },
  "user": {
    "name": "নাম",
    "email": "ইমেইল",
    "language": "প্ৰিয় ভাষা",
    "guest": "অতিথি ব্যৱহাৰকাৰী"
  },
  "table": {
    "metric": "মেট্ৰিক",
    "value": "মান",
    "interpretation": "ব্যাখ্যা",
    "description": "বিৱৰণ",
    "ideal": "উত্তম সীমা / অৰ্থ"
  },
  "footer": {
    "text": "মৈত্রী ডেছব'ৰ্ড দ্বাৰা নিৰ্মিত | গুৱাহাটী বিশ্ববিদ্যালয় ©"
  },
  "interpretation": {
    "unavailable": "উপলব্ধ নহয়",
    "healthy": "স্বাস্থ্যকৰ সীমা",
    "moderate": "মধ্যম চিন্তা",
    "severe": "মনোযোগৰ প্ৰয়োজন"
  },
  "metrics": {
    "anxiety": {
      "label": "উদ্বেগ",
      "description": "উদ্বেগ, চিন্তা আৰু অশান্তিৰ পৰিমাণ মাপি।",
      "ideal": "≤ 5 কম উদ্বেগ (স্বাস্থ্যকৰ সীমা) সূচিত কৰে।"
    },
    "depression": {
      "label": "মনঃবেদনা",
      "description": "দুখ, নিৰাশা আৰু অসন্তুষ্টিৰ পৰিমাণ প্ৰদৰ্শন কৰে।",
      "ideal": "≤ 5 স্থিতিশীল মুড (স্বাস্থ্যকৰ সীমা) সূচিত কৰে।"
    },
    "stress": {
      "label": "চাপ",
      "description": "মানসিক চাপ, উত্তেজনা আৰু জৰাজীৰ্ণতা মাপি।",
      "ideal": "≤ 7 পৰিচালনাযোগ্য চাপৰ পৰামৰ্শ দিয়ে।"
    },
    "sleep_quality": {
      "label": "ঘুমৰ গুণমান",
      "description": "মুঠ ঘুমৰ সন্তুষ্টি আৰু আৰামক প্ৰতিনিধিত্ব কৰে।",
      "ideal": "≥ 7 ভাল ঘুমৰ গুণমান প্ৰদৰ্শন কৰে।"
    },
    "social_support": {
      "label": "সামাজিক সহায়",
      "description": "অনুভূতিপূর্ণ মানসিক আৰু সামাজিক সমৰ্থন মাপি।",
      "ideal": "≥ 7 শক্তিশালী সহায়ক নেটৱৰ্কৰ পৰামৰ্শ দিয়ে।"
    },
    "resilience": {
      "label": "স্থিতিশীলতা",
      "description": "প্ৰত্যাঘাত বা চাপৰ পিছত পুনৰুদ্ধাৰৰ ক্ষমতা প্ৰদৰ্শন কৰে।",
      "ideal": "≥ 8 শক্তিশালী স্থিতিশীলতা প্ৰদৰ্শন কৰে।"
    },
    "self_esteem": {
      "label": "আত্ম-সন্মান",
      "description": "আত্মবিশ্বাস আৰু আত্ম-মূল্য প্ৰতিনিধিত্ব কৰে।",
      "ideal": "≥ 7 স্বাস্থ্যকৰ আত্ম-চিত্র প্ৰদৰ্শন কৰে।"
    },
    "life_satisfaction": {
      "label": "জীৱনৰ সন্তুষ্টি",
      "description": "জীৱনৰ সামগ্ৰিক সন্তুষ্টি আৰু দিশ প্ৰদৰ্শন কৰে।",
      "ideal": "≥ 8 জীৱনত শক্তিশালী সন্তুষ্টি প্ৰদৰ্শন কৰে।"
    }
  },

      admin: {
        title: "থেৰাপিষ্ট আবেদনসমূহ",
        description: "প্ৰফেছনেলৰ দ্বাৰা দাখিল কৰা থেৰাপিষ্ট আবেদনসমূহ পৰিচালনা কৰক। বিশ্বাসযোগ্য থেৰাপিষ্ট মঞ্জুৰ কৰক, আৰু যাচাইকৃত নহোৱা এণ্ট্ৰীবোৰ বাতিল কৰক।",
        goDashboard: "ডেছব'ৰ্ডলৈ যাওক",
        table: {
          name: "নাম",
          email: "ইমেইল",
          phone: "ফোন",
          specialization: "বিশেষীকৰণ",
          experience: "অভিজ্ঞতা",
          qualifications: "যোগ্যতা",
          status: "স্থিতি",
          actions: "কৰ্ম"
        },
        noApplications: "কোনো আবেদন পোৱা নগ'ল।",
        years: "বছৰ",
        accept: "মঞ্জুৰ কৰক",
        reject: "প্ৰত্যাখ্যান কৰক",
        talkCounselor: "কাউন্সেলৰক ক'বলৈ",
        therapistForm: "থেৰাপিষ্ট ফৰ্ম",
        errorFetch: "থেৰাপিষ্ট আবেদনসমূহ আহৰণ কৰাত সমস্যা",
        errorReject: "থেৰাপিষ্ট প্রত্যাখ্যান কৰাত সমস্যা",
        errorAccept: "থেৰাপিষ্ট মঞ্জুৰ কৰাত সমস্যা"
      }

  }
}

};

// Initialize with stored language preference or default to English
const storedLang = localStorage.getItem("preferredLang") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: storedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
