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
      downloadReport: "Download Report",
      downloading: "Generating Report..."
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
          answer:
            "Yes! Maitri is completely free and accessible to everyone."
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
        treasureFeature1: "Find the best cafes and hangout spots around Gauhati University,Guwahati",
        treasureFeature2: "Meet like-minded friends and grow your network",
        treasureFeature3: "Track your favorite study corners and campus events",
        treasureFeature4: "Share tips, stories, and hidden gems with peers",
        treasureButton: "Start the Treasure Hunt"
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
          answer:
            "बिल्कुल। मैत्री आपको समय के साथ अपनी भावनाओं पर विचार करने में मदद करता है ताकि आप अपनी प्रगति देख सकें।"
        },
        faq4: {
          question: "क्या मेरा डेटा सुरक्षित है?",
          answer:
            "हाँ। आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। आपका डेटा सुरक्षित रूप से एन्क्रिप्टेड है और आपकी अनुमति के बिना कभी साझा नहीं किया जाएगा।"
        },
        faq5: {
          question: "मैत्री किसके लिए उपयोगी है?",
          answer:
            "मैत्री उन सभी के लिए है जो अपने मानसिक स्वास्थ्य को बेहतर बनाना चाहते हैं—चाहे वे छात्र हों, पेशेवर, देखभाल करने वाले, या कोई भी जो आत्म-देखभाल की यात्रा पर है।"
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
        treasureButton: "ट्रेज़र हंट शुरू करें"
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
          "মৈত্ৰী মানসিক স্বাস্থ্য জাগৰণ আৰু অনুভৱগত কল্যাণৰ বাবে সঁজুলি প্ৰদান কৰিবলৈ উৎসৰ্গিত। আমি সকলোকে সুৰক্ষিত, সমৰ্থক আৰু সহজগম্য এক ঠাই প্ৰদান কৰিবলৈ চেষ্টা কৰোঁ।",

        missionTitle: "আমাৰ উদ্দেশ্য",
        missionDescription:
          "লোকসকলক জাৰ্নেলিং, পথপ্ৰদৰ্শক সঁজুলি আৰু সমবেদনা পূৰ্ণ সমাজৰ সহায়ত নিজৰ মানসিক স্বাস্থ্যৰ দায়িত্ব ল’বলৈ ক্ষমতাশালী কৰা। আমি মানসিক স্বাস্থ্য সম্পৰ্কীয় কুসংস্কাৰ ভাঙি খোলা আৰু অৰ্থপূৰ্ণ আলোচনাক উৎসাহিত কৰো।",

        visionTitle: "আমাৰ দৰ্শন",
        visionDescription:
          "এটা বিশ্ব, য’ত মানসিক স্বাস্থ্যক শাৰীৰিক স্বাস্থ্যৰ সমান গুৰুত্ব দিয়া হয় আৰু প্ৰত্যেক ব্যক্তিয়ে প্ৰয়োজনীয় যত্ন আৰু সমৰ্থন লাভ কৰে।",

        featuresTitle: "আমিয়ে কি প্ৰদান কৰো",
        features: [
          "নিজৰ অনুভৱসমূহক বুজিবলৈ আৰু প্ৰগতিৰ খবৰ ৰাখিবলৈ পথপ্ৰদৰ্শক জাৰ্নেলিং।",
          "সজীৱ সহায় আৰু পৰামৰ্শৰ বাবে এটা ইণ্টাৰেক্টিভ চেটবট।",
          "ব্যক্তিগত অনুভৱজনিত অন্তৰ্দৃষ্টি আৰু পৰীক্ষা সঁজুলি।",
          "কল্যাণ সম্পৰ্কীয় শিক্ষামূলক প্ৰবন্ধ, ভিডিঅ’ আৰু সম্পদ।",
          "বিশেষজ্ঞৰ পৰামৰ্শ আৰু সহপাঠীৰ উৎসাহৰ সৈতে সমৰ্থক সমাজ।",
          "সকলৰ বাবে সহজগম্য আৰু কলঙ্ক-মুক্ত সঁজুলি।"
        ],

        videosTitle: "সহায়ক ভিডিঅ’সমূহ",

        tipsTitle: "মানসিক স্বাস্থ্য পৰামৰ্শ",
        tips: [
          "প্ৰতিদিনে যিসকল বিষয়ে আপুনি কৃতজ্ঞ, সেয়া লিখি ৰাখক।",
          "মন ভাল কৰিবলৈ আৰু চাপ কমাবলৈ নিয়মিত ব্যায়াম কৰক।",
          "বন্ধু-বান্ধৱী আৰু পৰিয়ালৰ সৈতে সংযোগ ৰাখক।",
          "ডাঙৰ লক্ষ্যবোৰক সৰু-সৰু পদক্ষেপত বিভক্ত কৰক।",
          "ডিজিটেল ডিটক্স লওক আৰু সামাজিক মাধ্যমৰ পৰা কিছু সময়ৰ বাবে আঁতৰি থাকক।",
          "প্ৰতিদিনে ধ্যান, প্ৰাণায়াম বা গভীৰ নিশ্বাস লোৱাৰ অভ্যাস কৰক।",
          "প্ৰয়োজন হ’লে বিশেষজ্ঞৰ সহায় লওক—সহায় বিচৰা শক্তিৰ প্ৰমাণ।"
        ],

        faqsTitle: "প্ৰায় সোধা প্ৰশ্নসমূহ",
        faq1: {
          question: "মৈত্ৰী কি?",
          answer:
            "মৈত্ৰী হৈছে এটা ডিজিটেল প্লেটফৰ্ম যি জাৰ্নেলিং, পথপ্ৰদৰ্শক সঁজুলি আৰু সমাজৰ যত্নৰ জৰিয়তে মানসিক স্বাস্থ্যক সমৰ্থন দিয়ে।"
        },
        faq2: {
          question: "মৈত্ৰী ব্যৱহাৰ বিনামূল্যে নে?",
          answer: "হয়! মৈত্ৰী সম্পূৰ্ণৰূপে বিনামূল্যে আৰু সকলোৰে বাবে উপলব্ধ।"
        },
        faq3: {
          question: "মই কি মোৰ মানসিক স্বাস্থ্যৰ প্ৰগতিৰ খবৰ ৰাখিব পাৰিম?",
          answer:
            "অৱশ্যে। মৈত্ৰী আপোনাক সময়ৰ লগে লগে নিজৰ অনুভৱবোৰ বুজিবলৈ সহায় কৰে যাতে আপুনি নিজৰ প্ৰগতি পৰ্যবেক্ষণ কৰিব পাৰে।"
        },
        faq4: {
          question: "মোৰ তথ্য সুৰক্ষিত নে?",
          answer:
            "হয়। আপোনাৰ গোপনীয়তা আমাৰ বাবে অত্যন্ত গুৰুত্বপূৰ্ণ। আপোনাৰ তথ্য এনক্রিপ্টেড আৰু সুৰক্ষিতভাৱে সংৰক্ষিত হৈ থাকে আৰু আপোনাৰ অনুমতি নোহোৱাকৈ কেতিয়াও শ্বেয়াৰ কৰা নহ’ব।"
        },
        faq5: {
          question: "মৈত্ৰী কাকৰ বাবে উপকাৰী?",
          answer:
            "মৈত্ৰী সকলোৰে বাবে যি নিজৰ মানসিক স্বাস্থ্য উন্নত কৰিব বিচাৰে—ছাত্ৰ, ব্যৱসায়ী, যত্ন লোৱা ব্যক্তি বা আত্ম-যত্নৰ যাত্ৰাত থকা যে কোনো লোক।"
        },

        testimonialsTitle: "আমাৰ ব্যৱহাৰকাৰীসকলৰ মতামত",
        testimonials: [
          "মৈত্ৰীয়ে মোক চাপ আৰু উৎকণ্ঠা নিয়ন্ত্ৰণ কৰিবলৈ সহায় কৰিছে।",
          "জাৰ্নেলিং সঁজুলিয়ে আত্ম-প্ৰতিফলনক সহজ আৰু অৰ্থপূৰ্ণ কৰিছে।",
          "সমৰ্থক সমাজে মোক কেতিয়াও একাকী অনুভৱ কৰিব নিদিয়ে।",
          "যেতিয়া মোক কোৱাতকৈ শুনিবলৈ প্ৰয়োজন হয়, চেটবটখনে অত্যন্ত সহায় কৰে।",
          "মৈত্ৰী এতিয়া মোৰ আত্ম-যত্নৰ দৈনন্দিন অংশ হৈ পৰিছে।"
        ],

        contactTitle: "মৈত্ৰীৰ সৈতে আৰম্ভ কৰক",
        contactDescription:
          "আজিহে ভাল মানসিক স্বাস্থ্যৰ দিশত প্ৰথম পদক্ষেপ লওক। জাৰ্নেলিং আৰম্ভ কৰক, আমাৰ পথপ্ৰদৰ্শক সঁজুলি অন্বেষণ কৰক আৰু সমৰ্থক সমাজৰ সৈতে সংযোগ কৰক।",
        startButton: "আপোনাৰ যাত্ৰা আৰম্ভ কৰক",

        treasureTitle: "মৈত্ৰী ট্রেজাৰ আবিষ্কাৰ কৰক",
        treasureDescription:
          "ছাত্ৰ-ছাত্ৰীয়ে কেম্পাছৰ চুটি ৰহস্যসমূহ—কেফে, পাঠ অধ্যয়ন স্থান, কেণ্টিন, আৰু বিশ্ৰাম অঞ্চল—অন্বেষণ কৰিব পাৰে। বন্ধু-বান্ধৱীৰ সৈতে সংযোগ কৰক, সমাজৰ অংশ হ’ব, আৰু প্ৰতিটো দিনক এক অভিযান হিচাপে উপভোগ কৰক!",
        treasureFeature1: "গুৱাহাটী বিশ্ববিদ্যালয়,গুৱাহাটী সৰ্বশ্ৰেষ্ঠ কেফে আৰু হেংআউট স্থানসমূহ সন্ধান কৰক",
        treasureFeature2: "সদৃশ মন থকা বন্ধু-বান্ধৱী লগ পাব আৰু আপোনাৰ নেটৱৰ্ক বৃদ্ধি কৰক",
        treasureFeature3: "আপোনাৰ প্ৰিয় অধ্যয়ন কোণ আৰু কেম্পাছৰ অনুষ্ঠানবোৰৰ খবৰ ৰাখক",
        treasureFeature4: "সহপাঠীৰ সৈতে টিপছ, গল্প আৰু ৰহস্যসমূহ শ্বেয়াৰ কৰক",
        treasureButton: "ট্ৰেজাৰ হান্ট আৰম্ভ কৰক"
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

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
