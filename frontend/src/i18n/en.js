export default {
  common: {
    close: "Close"
  },
  splash: {
    tagline: "Not just a chatbot — a safe, warm space for your well-being.",
    welcome: "Welcome — supporting your well-being every step of the way.",
    startButton: "Tap to Start",
    continue: "Continue",
    skip: "Skip Intro",
    loading: "Loading...",
    videoLabel: "Maitri introduction video",
    videoNotSupported: "Your browser does not support the video tag.",
    mobileTagline: "Your caring companion for mental well-being.",
    tapToPlay: "Tap the video to play"
  },
  navbar: {
    title: "Maitri",
    feelingDown: "Feeling low? Find a new friend with Maitri!",
    hello: "Hello, {{name}} 👋",
    home: "Home",
    dashboard: "Dashboard",
    about: "About",
    analysis: "Analysis",
    settings: "Settings",
    talkToCounselor: "Talk to Healthcare Professionals",
    logout: "Logout",
  },
  dashboard: {
    tab: {
      chatbot: "Chatbot",
      chart: "Progress",
      todo: "To-Do",
      reminder: "Reminders",
      dementia: "Dementia Checker",
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
      { question: "Is it free?", answer: "Yes, it's completely free to use and enjoy." },
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
    welcomeAI: "Hello! I'm Vaidhya, your AI healthcare assistant. I'm here to help assess your mental health metrics, screening scores, and cognitive function. I'll ask you some questions to better understand your health. How are you feeling today?",
    inputPlaceholder: "Type your thoughts here...",
    sendButton: "Send",
    loginPrompt: "Please log in to start chatting.",
    connectionError: "Unable to connect to the server.",
    sendError: "Sorry, I couldn't send that message.",
    loading: "Loading...",
    typing: "Bot is typing...",
    empty: "No messages yet.",
    retryPrompt: "Connection issue. Click to retry.",
    retryMessage: "Message failed. Click here to try again.",
    title: "Maitri Vaidhya",
    description: "This assistant automatically understands your messages, analyses the context, and responds in your preferred language. Your language choice is saved in localStorage, so it stays even after closing the app.",
    benefitsTitle: "Main Benefits",
    benefit1: "AI understands natural conversation and gives accurate responses.",
    benefit2: "All text is processed to detect tasks automatically.",
    benefit3: "Your Todo List updates dynamically based on your chats.",
    benefit4: "Charts auto-refresh to show productivity trends.",
    benefit5: "Smart session syncing across devices when logged in.",
    benefit6: "Multi-language interface, remembered permanently.",
    howItHelpsTitle: "How It Helps You",
    howItHelpsDescription: "Just talk normally. The system watches for tasks, schedules, reminders, goals, and updates everything silently in the background. No command format needed.",
    languageTitle: "Why Language Preference Matters",
    languageDescription: "Every answer adapts to your selected language. Your interface, bot messages, and todo summaries follow the same language for a consistent experience.",
    speechNotSupported: "Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.",
    microphoneNotAvailable: "Microphone is not available. Please check your browser permissions and allow microphone access.",
    microphonePermissionDenied: "Microphone permission denied. Please allow microphone access in your browser settings.",
    microphoneNotFound: "No microphone found. Please connect a microphone and try again.",
    speechError: "Failed to start speech recognition. Please try again.",
    startListening: "Start voice input",
    stopListening: "Stop listening",
    sending: "Sending...",
    listening: "Listening...",
    processing: "Processing...",
    processingTranscript: "Processing your speech...",
    speakNow: "Speak now...",
    noSpeech: "No speech detected. Please try speaking again.",
    audioCaptureError: "No microphone found. Please check your microphone connection.",
    networkError: "Network error. Please check your internet connection.",
    cognitive: {
      orientationScore: "Orientation Score",
      memoryScore: "Memory Score",
      attentionScore: "Attention Score",
      languageScore: "Language Score",
      executiveScore: "Executive Score",
      cognitiveRiskLevel: "Cognitive Risk Level",
      assessmentCreated: "Cognitive assessment created successfully!",
      viewInChart: "View your cognitive assessment data in the Progress tab.",
      assessmentInfo: "Your cognitive assessment has been saved and will appear in the chart.",
    },
  },
  chart: {
    emotionalMetrics: "Emotional Well-being Metrics",
    screeningMetrics: "Screening Assessment Metrics",
    barChart: "Bar Chart",
    lineChart: "Line Chart",
    noData: "No metrics available yet.",
    noMetrics: "No data available to display yet.",
    refresh: "Refresh",
    stress: "Stress",
    happiness: "Happiness",
    anxiety: "Anxiety",
    overallMood: "Overall Mood",
    phq9: "PHQ-9",
    gad7: "GAD-7",
    ghq: "GHQ",
    reactionTime: "Reaction Time",
    accuracy: "Accuracy",
    workingMemorySpan: "Working Memory Span",
    executiveFunction: "Executive Function",
    visuospatialAccuracy: "Visuospatial Accuracy",
    attentionConsistency: "Attention Consistency",
    languageCognitiveLoad: "Language Cognitive Load",
    processingSpeed: "Processing Speed",
    learningCurve: "Learning Curve",
    errorRate: "Error Rate",
    title: "User Metrics",
    dementiaMetrics: "Cognitive Metrics",
    dementiaRisk: "Dementia Risk",
    cognitiveRisk: "Cognitive Impairment Risk",
    progressReport: "Progress Report",
    infoTitle: "Metrics Overview",
    infoDescription: "This chart visualizes your selected metrics over time. You can toggle between emotional metrics, screening assessments, and cognitive impairment risk. Choose your preferred chart type (bar or line) to view trends.",
    definitions: "Definitions",
    stressDefinition: "A measure of psychological and physical tension (0-50). Higher scores indicate increased stress levels, which may affect your overall wellbeing.",
    happinessDefinition: "A measure of positive emotions, satisfaction, and joy (0-50). Higher scores reflect greater happiness and life satisfaction.",
    anxietyDefinition: "A measure of worry, nervousness, and unease (0-50). Higher scores indicate increased anxiety levels that may require attention.",
    overallMoodDefinition: "A composite measure of your general emotional state (0-50). This reflects your overall psychological wellbeing at a given time.",
    phq9Definition: "Patient Health Questionnaire-9 (0-27). A validated 9-item depression screening tool. Scores: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-19 (moderately severe), 20-27 (severe).",
    gad7Definition: "Generalized Anxiety Disorder-7 (0-21). A 7-item anxiety screening scale. Scores: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe anxiety).",
    ghqDefinition: "General Health Questionnaire (0-36). A comprehensive psychological distress screening tool measuring mental health status. Higher scores indicate greater psychological distress.",
    dementiaRiskDefinition: "A percentage score (0-100%) indicating the risk level for cognitive impairment. Based on comprehensive game-based cognitive metrics with weighted domain scoring (Memory 30%, Language 20%, Attention 20%, Orientation 15%, Executive 15%). Lower scores indicate better cognitive function.",
    howScoringWorks: "How Emotional Metrics Are Scored & Evaluated",
    scoringMethodology: "Scoring Methodology",
    emotionalScoringExplanation: "Emotional metrics are calculated using advanced Natural Language Processing (NLP) techniques that analyze your conversation patterns with the chatbot. The system uses psycholinguistic markers (LIWC features) including first-person pronoun usage frequency, negative emotion word density, cognitive processing word frequency, disfluency markers (hesitation words like 'um', 'uh'), and repetition patterns. Additionally, transformer-based embeddings (Sentence-BERT/DistilBERT models finetuned on mental-health datasets) are used to capture semantic similarity to clinical symptom descriptions. Scores range from 0-50, where higher values indicate stronger presence of that emotional state.",
    evaluationProcess: "Evaluation Process",
    emotionalEvaluationProcess: "The AI analyzes your conversation history in batches, looking for patterns, repeated mentions, and cumulative emotional indicators. Each metric is calculated independently: Stress levels are identified through mentions of stressors, physical symptoms, and tension indicators. Happiness is measured through positive emotions, satisfaction expressions, and joy indicators. Anxiety is detected through worry patterns, nervousness markers, restlessness indicators, and panic-related language. Overall mood is a composite measure that can be an average of the above metrics or an independent assessment of general emotional state.",
    howScreeningScored: "How Screening Metrics Are Scored & Evaluated",
    screeningMethodology: "Scoring Methodology",
    screeningScoringExplanation: "PHQ-9, GAD-7, and GHQ scores are AI-ESTIMATED PROXY INDICATORS calculated by analyzing conversation patterns and linguistic features. The AI identifies symptoms and behaviors that correspond to standardized questionnaire items. For PHQ-9, the system looks for indicators of interest loss, mood changes, sleep disturbances, energy levels, appetite changes, concentration issues, self-worth concerns, movement problems, and suicidal thoughts. For GAD-7, it identifies excessive worry, restlessness, fatigue, concentration problems, irritability, muscle tension, and sleep issues. For GHQ, it assesses psychological distress, social functioning, and physical symptoms. These scores predict likelihood based on conversation patterns but are NOT actual questionnaire responses.",
    importantNote: "Important Note",
    screeningImportantNote: "These AI-estimated scores are screening tools that help identify potential concerns. They are based on natural language analysis of your conversations and should be interpreted with caution. For verified clinical results and formal diagnosis, you must complete the actual standardized PHQ-9, GAD-7, or GHQ questionnaires administered by healthcare professionals. These proxy scores are designed to raise awareness and encourage professional consultation when indicated.",
    howCognitiveScored: "How Cognitive Metrics Are Scored & Evaluated",
    gameBasedScoring: "Game-Based Assessment Scoring",
    cognitiveScoringExplanation: "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms. Your raw scores from each game are normalized by difficulty level (easy, moderate, hard) to ensure fair comparison. The formula used is: Normalized Score = (Raw Score / Maximum Possible Score for Difficulty) × 100. This normalization accounts for different difficulty multipliers (easy: 1.0x, moderate: 1.5x, hard: 2.0x) and ensures that scores are comparable across games and difficulty levels.",
    domainMapping: "Game-to-Domain Mapping",
    domainMappingExplanation: "Each game maps to specific cognitive domains with clinical justification: Digit Span and N-Back primarily test Memory (working memory capacity). Pattern Recall and Memory Match assess Memory and Attention. Reaction Time measures Attention and Processing Speed. Stroop Test evaluates Executive Function (cognitive flexibility and inhibition). Clock Drawing tests Executive Function, Orientation, and Visuospatial abilities. Text Recall (Dementia Checker) assesses Memory and Language. Each game contributes to domain scores with weighted importance based on which cognitive function it primarily tests.",
    weightedRiskCalculation: "Weighted Risk Score Calculation",
    weightedRiskExplanation: "The final cognitive risk score uses a weighted domain model based on clinical research: Memory (30% weight) - main early dementia marker, Language (20%) - word-finding issues appear early, Attention (20%) - executive decline affects attention, Orientation (15%) - moderate impact, Executive Function (15%) - important but typically late-stage. The formula calculates: Weighted Risk Score = Σ(Domain Risk × Domain Weight), where Domain Risk = 1 - (Domain Score / 10). Higher domain scores (0-10 scale) indicate better cognitive function, resulting in lower risk scores (0-1 scale). Risk levels are determined as: High (≥70%), Moderate (40-69%), Low (<40%).",
    whatEachGameTests: "What Each Game Tests",
    digitSpanGame: "Digit Span",
    digitSpanGameDesc: "Tests working memory capacity by requiring you to remember and recall sequences of digits. Measures immediate memory span, which is a key indicator of cognitive health. Early Alzheimer's disease affects short-term recall, making this test sensitive to early cognitive decline.",
    nBackGame: "N-Back",
    nBackGameDesc: "Evaluates working memory and executive function by requiring you to identify items that appeared N steps back in a sequence. Tests your ability to maintain and update information in working memory, which is sensitive to Mild Cognitive Impairment (MCI) decline.",
    patternRecallGame: "Pattern Recall",
    patternRecallGameDesc: "Tests visual memory and sequential processing by requiring you to remember and reproduce visual patterns. Evaluates memory encoding and retrieval deficits, which are critical cognitive functions that decline in early-stage dementia.",
    memoryMatchGame: "Memory Match",
    memoryMatchGameDesc: "Assesses associative memory by requiring you to match pairs of cards by remembering their positions. Tests hippocampal-dependent memory systems, which are strongly affected in early Alzheimer's disease. Identifies visual memory deficits and spatial processing issues.",
    reactionTimeGame: "Reaction Time",
    reactionTimeGameDesc: "Measures processing speed and attention by requiring quick responses to visual stimuli. Detects slowed cognitive processing, which is an early indicator of cognitive decline. Tracks average reaction time, variability, and slowest 10% responses.",
    colorSequenceGame: "Color Sequence",
    colorSequenceGameDesc: "Tests sequential memory by requiring you to remember and repeat color sequences in order. Evaluates working memory and executive function components that are affected in early dementia. Measures ability to maintain sequences in memory.",
    stroopTestGame: "Stroop Test",
    stroopTestGameDesc: "Assesses cognitive flexibility and inhibition by requiring you to identify color names while ignoring conflicting text colors. Measures executive function and cognitive control, which are impaired in dementia patients. Tests ability to inhibit automatic responses.",
    clockDrawingGame: "Clock Drawing",
    clockDrawingGameDesc: "A widely used screening tool for dementia that assesses multiple cognitive domains including visuospatial skills, executive function, attention, and semantic memory. This is a clinically validated test (CDT) used in MMSE, MoCA, and other assessments. Impairments in clock drawing are strong indicators of cognitive decline.",
    textRecallGame: "Text Recall",
    textRecallGameDesc: "Evaluates memory and language by requiring you to read and recall text passages. Tests verbal memory, language comprehension, and retention capacity. Early Alzheimer's hallmark includes memory and language deficits, making this test highly relevant for early detection.",
    primaryDomain: "Primary Domain",
    secondaryDomain: "Secondary",
    importantDisclaimer: "Important Disclaimer",
    disclaimerTitle: "Assessment Purpose",
    disclaimerText1: "These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.",
    disclaimerTitle2: "Clinical Interpretation",
    disclaimerText2: "Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing. Scores may be influenced by factors such as fatigue, stress, medication effects, or temporary health conditions.",
    disclaimerTitle3: "Not a Diagnosis",
    disclaimerText3: "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns or before making health-related decisions.",
    proxyDisclaimer: "AI-Estimated Proxy Scores",
    proxyDisclaimerText: "PHQ-9, GAD-7, and GHQ scores shown here are AI-ESTIMATED PROXY INDICATORS based on conversation patterns, NOT actual questionnaire responses. For verified clinical results, users must complete the standardized questionnaires.",
    aiEstimated: "AI-Estimated",
    emotionalMetricsDisclaimer: "AI-Estimated Metrics",
    emotionalMetricsDisclaimerText: "Emotional metrics (stress, anxiety, happiness) are AI-estimated using psycholinguistic markers (LIWC features: first-person usage, negative emotion words, cognitive processing words) and transformer embeddings (Sentence-BERT/DistilBERT finetuned on mental-health datasets), NOT clinically validated diagnostic tools.",
    cognitiveAssessmentDisclaimer: "Cognitive scores are estimated from conversation linguistic features (memory markers, orientation markers, attention markers, language markers, executive function markers), not formal neuropsychological testing.",
    noDataTitle: "No Data Available",
    refreshing: "Refreshing...",
    average: "Average",
    maximum: "Maximum",
    minimum: "Minimum",
    dataPoints: "Data Points",
    metricType: "Metric Type",
    chartType: "Chart Type",
    infoSubtitle: "Track your mental health and cognitive wellbeing",
    feature1Title: "Real-time Tracking",
    feature1Desc: "Monitor changes over time",
    feature2Title: "Multiple Metrics",
    feature2Desc: "Emotional, screening & cognitive",
    feature3Title: "Visual Insights",
    feature3Desc: "Bar and line chart options",
    feature4Title: "Auto Refresh",
    feature4Desc: "Stay updated with latest data",
    domainWeights: "Domain Weights",
    memoryWeightReason: "Main early dementia marker - hippocampal-dependent",
    languageWeightReason: "Word-finding issues appear early in Alzheimer's",
    attentionWeightReason: "Executive decline affects attention networks",
    orientationWeightReason: "Moderate impact, more affected in later stages",
    executiveWeightReason: "Important but typically late-stage marker",
    domainMemory: "Memory",
    domainLanguage: "Language",
    domainAttention: "Attention",
    domainOrientation: "Orientation",
    domainExecutive: "Executive",
    cognitiveDomains: "Cognitive Domain Scores",
    weightedRiskScore: "Weighted Risk Score",
    howScoringWorks: "How Results Are Scored & Evaluated",
    gameBasedScoring: "Game-Based Assessment Scoring",
    cognitiveScoringExplanation: "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms. Your raw scores from each game are normalized by difficulty level (easy, moderate, hard) to ensure fair comparison. The formula used is: Normalized Score = (Raw Score / Maximum Possible Score for Difficulty) × 100. This normalization accounts for different difficulty multipliers (easy: 1.0x, moderate: 1.5x, hard: 2.0x) and ensures that scores are comparable across games and difficulty levels.",
    domainMapping: "Game-to-Domain Mapping",
    domainMappingExplanation: "Each game maps to specific cognitive domains with clinical justification: Digit Span and N-Back primarily test Memory (working memory capacity). Pattern Recall and Memory Match assess Memory and Attention. Reaction Time measures Attention and Processing Speed. Stroop Test evaluates Executive Function (cognitive flexibility and inhibition). Clock Drawing tests Executive Function, Orientation, and Visuospatial abilities. Text Recall (Dementia Checker) assesses Memory and Language. Each game contributes to domain scores with weighted importance based on which cognitive function it primarily tests.",
    weightedRiskCalculation: "Weighted Risk Score Calculation",
    weightedRiskExplanation: "The final cognitive risk score uses a weighted domain model based on clinical research: Memory (30% weight) - main early dementia marker, Language (20%) - word-finding issues appear early, Attention (20%) - executive decline affects attention, Orientation (15%) - moderate impact, Executive Function (15%) - important but typically late-stage. The formula calculates: Weighted Risk Score = Σ(Domain Risk × Domain Weight), where Domain Risk = 1 - (Domain Score / 10). Higher domain scores (0-10 scale) indicate better cognitive function, resulting in lower risk scores (0-1 scale). Risk levels are determined as: High (≥70%), Moderate (40-69%), Low (<40%).",
    whatEachGameTests: "What Each Game Tests",
    digitSpanGame: "Digit Span",
    digitSpanGameDesc: "Tests working memory capacity by requiring you to remember and recall sequences of digits. Measures immediate memory span, which is a key indicator of cognitive health. Early Alzheimer's disease affects short-term recall, making this test sensitive to early cognitive decline.",
    nBackGame: "N-Back",
    nBackGameDesc: "Evaluates working memory and executive function by requiring you to identify items that appeared N steps back in a sequence. Tests your ability to maintain and update information in working memory, which is sensitive to Mild Cognitive Impairment (MCI) decline.",
    patternRecallGame: "Pattern Recall",
    patternRecallGameDesc: "Tests visual memory and sequential processing by requiring you to remember and reproduce visual patterns. Evaluates memory encoding and retrieval deficits, which are critical cognitive functions that decline in early-stage dementia.",
    memoryMatchGame: "Memory Match",
    memoryMatchGameDesc: "Assesses associative memory by requiring you to match pairs of cards by remembering their positions. Tests hippocampal-dependent memory systems, which are strongly affected in early Alzheimer's disease. Identifies visual memory deficits and spatial processing issues.",
    reactionTimeGame: "Reaction Time",
    reactionTimeGameDesc: "Measures processing speed and attention by requiring quick responses to visual stimuli. Detects slowed cognitive processing, which is an early indicator of cognitive decline. Tracks average reaction time, variability, and slowest 10% responses.",
    colorSequenceGame: "Color Sequence",
    colorSequenceGameDesc: "Tests sequential memory by requiring you to remember and repeat color sequences in order. Evaluates working memory and executive function components that are affected in early dementia. Measures ability to maintain sequences in memory.",
    stroopTestGame: "Stroop Test",
    stroopTestGameDesc: "Assesses cognitive flexibility and inhibition by requiring you to identify color names while ignoring conflicting text colors. Measures executive function and cognitive control, which are impaired in dementia patients. Tests ability to inhibit automatic responses.",
    clockDrawingGame: "Clock Drawing",
    clockDrawingGameDesc: "A widely used screening tool for dementia that assesses multiple cognitive domains including visuospatial skills, executive function, attention, and semantic memory. This is a clinically validated test (CDT) used in MMSE, MoCA, and other assessments. Impairments in clock drawing are strong indicators of cognitive decline.",
    textRecallGame: "Text Recall",
    textRecallGameDesc: "Evaluates memory and language by requiring you to read and recall text passages. Tests verbal memory, language comprehension, and retention capacity. Early Alzheimer's hallmark includes memory and language deficits, making this test highly relevant for early detection.",
    primaryDomain: "Primary Domain",
    secondaryDomain: "Secondary",
    importantDisclaimer: "Important Disclaimer",
    disclaimerTitle: "Assessment Purpose",
    disclaimerText1: "These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.",
    disclaimerTitle2: "Clinical Interpretation",
    disclaimerText2: "Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing. Scores may be influenced by factors such as fatigue, stress, medication effects, or temporary health conditions.",
    disclaimerTitle3: "Not a Diagnosis",
    disclaimerText3: "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns or before making health-related decisions.",
    reactionTimeDefinition: "Measures processing speed and attention. Average reaction time, variability, and slowest 10% are key indicators. Lower times indicate better cognitive function.",
    accuracyDefinition: "Overall cognitive efficiency measured as percentage correct. Tracks error types and accuracy under time pressure. Higher accuracy indicates better cognitive function.",
    workingMemoryDefinition: "Short-term memory capacity. Measures maximum sequence remembered, forwards vs backwards span, and intrusion errors. Higher span indicates better working memory.",
    executiveFunctionDefinition: "Decision-making, planning, and inhibition abilities. Tracks task-switching speed, rule violations, and perseveration. Lower times and fewer violations indicate better executive function.",
    visuospatialDefinition: "Spatial reasoning and visual processing. Measures accuracy in reconstructing shapes, navigation errors, and puzzle completion time. Higher accuracy indicates better visuospatial function.",
    attentionDefinition: "Sustained attention and focus. Tracks time on task, distractor click rate, missed stimuli, and consistency score. Higher consistency indicates better attention.",
    processingSpeedDefinition: "Speed of cognitive processing. Measures average game completion time, fastest and slowest game times, and speed consistency. Lower times indicate faster processing.",
    learningCurveDefinition: "Ability to learn and improve over time. Measures improvement from first to last trial, forgetting curve, and retention rate. Positive improvement indicates better learning ability.",
    errorAnalyticsDefinition: "Error patterns and types. Tracks total errors, repeated error rate (perseveration), and error classification. Lower error rates indicate better cognitive function.",
    assessmentTools: "Assessment Tools",
    assessmentToolsDefinition: "Our platform uses game-based cognitive metrics to assess cognitive function: Reaction Time (processing speed), Accuracy (cognitive efficiency), Working Memory Span (short-term memory), Executive Function (decision-making), Visuospatial Ability (spatial reasoning), Attention & Focus (sustained attention), Language Cognitive Load (language processing), Processing Speed (cognitive speed), Learning Curve (ability to improve), and Error Analytics (error patterns).",
    usage: "How to Use",
    usageDescription: "Switch between chart types (Bar/Line) and metric categories (Emotional/Screening/Cognitive) using the dropdown menus above. Click 'Refresh' to update with the latest data. Bar charts show individual data points, while line charts display trends over time.",
    benefits: "Benefits",
    benefit1: "Monitor emotional wellbeing trends over time.",
    benefit2: "Track standardized screening scores (PHQ-9, GAD-7, GHQ) for mental health assessment.",
    benefit3: "Visualize cognitive impairment risk patterns and changes.",
    benefit4: "Identify patterns and make data-driven decisions for better wellbeing.",
    benefit5: "Share progress with healthcare professionals using visual data.",
    usage: "How to Use",
    usageDescription: "Switch between chart types (Bar/Line) and metric categories (Emotional/Screening/Cognitive) using the dropdown menus above. Click 'Refresh' to update with the latest data. Bar charts show individual data points, while line charts display trends over time.",
    importantNotes: "Important Notes",
    note1: "These metrics are screening tools, not diagnostic tools. Always consult healthcare professionals for medical advice.",
    note2: "Scores should be interpreted in context with professional guidance.",
    note3: "Regular monitoring (every 3-6 months) helps track changes and patterns.",
    note4: "High risk scores should prompt consultation with qualified healthcare professionals.",
    languageNote: "Language Support",
    languageDescription: "All chart labels and descriptions automatically adapt to your selected language for a consistent user experience.",
    insight: "Insight",
    insightDescription: "Analyzing these metrics can help identify patterns, manage stress, and make data-driven decisions for better wellbeing.",
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
    quickAddPlaceholder: "Quick add reminder...",
    predefinedMessages: {
      takeMedicine: "Take medicine",
      doctorAppointment: "Doctor appointment",
      exercise: "Exercise",
      drinkWater: "Drink water"
    },
    repeat: {
      none: "One-time",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom Interval"
    },
    addQuickReminder: "Add Quick Reminder",
    reminderMessagePlaceholder: "Reminder message",
    emailPlaceholder: "Your email",
    selectDateTime: "Select date & time",
    time: "Time",
    optionalEndDate: "Optional end date",
    selected: "Selected:",
    processing: "Processing...",
    addReminder: "Add Reminder",
    stats: "Stats",
    totalReminders: "Total Reminders",
    dailyReminders: "Daily Reminders",
    weeklyReminders: "Weekly Reminders",
    monthlyReminders: "Monthly Reminders",
    nextReminder: "Next Reminder",
    allRepeats: "All repeats",
    byEmail: "By Email",
    byMessage: "By Message",
    searchPlaceholder: "Search reminders...",
    emailLabel: "Email:",
    dateTimeLabel: "Date & Time:",
    repeatLabel: "Repeat:",
    intervalLabel: "Interval:",
    endsLabel: "Ends:",
    statusLabel: "Status:",
    delete: "Delete",
    loadingReminders: "Loading reminders...",
    noReminders: "No reminders yet.",
    benefitsTitle: "Benefits for Patients with Dementia",
    benefitsText1: "Regular reminders help dementia patients maintain daily routines, reduce confusion, and support memory retention.",
    benefitsText2: "Scheduled alerts for medication, appointments, and daily activities provide structure, promote independence, and lower anxiety.",
    allFieldsRequired: "All fields are required.",
    validDateTimeRequired: "Please select a valid date and time.",
    failedToAdd: "Failed to add reminder.",
    confirmDelete: "Are you sure you want to delete this reminder?",
    failedToDelete: "Failed to delete reminder.",
    quickAddRequired: "Message and email are required for quick add.",
    failedQuickAdd: "Failed to quick add reminder.",
    none: "None"
  },
  dementia: {
    title: "Dementia Checker",
    start: "Start",
    starting: "Starting...",
    timeLeft: "Time Left: {{seconds}}s",
    intro: "Click Start to fetch 5–6 timed questions. If time runs out, an empty answer is saved automatically.",
    placeholder: "Type your answer...",
    next: "Next",
    submit: "Submit",
    progress: "Question {{current}} of {{total}}",
    draftTitle: "Draft Answers (Local)",
    emptyAnswer: "(empty)",
    record: "Record",
    stopRecording: "Stop",
    recording: "Recording...",
    preview: "Preview",
    hasAudio: "with audio",
    questionHidden: "Question hidden. Type your answer below.",
    moderate: "Moderate",
    category: "Category",
    failedToLoadQuestions: "Failed to load questions. Please try again.",
    failedToStart: "Failed to start the test. Please try again.",
    microphonePermissionDenied: "Microphone permission denied. Please allow microphone access to record audio.",
    submissionError: "Failed to submit answers. Please try again.",
    games: {
      clockTest: "Clock Test",
      colorSequence: "Color Sequence",
      matchingCards: "Matching Cards",
      textRecall: "Text Recall",
      reactionTime: "Reaction Time",
      numberOrder: "Number Order",
      wordMemory: "Word Memory",
      stroopTest: "Stroop Test",
      patternGrid: "Pattern Grid",
      symbolMatch: "Symbol Match",
      oddColor: "Odd Color",
      digitSpan: "Digit Span",
      nBack: "N-Back",
      memory: "Memory Match",
      patternRecall: "Pattern Recall",
      clockDrawing: "Clock Drawing",
      descriptions: {
        clockTest: "Recognize and set clock times accurately. Tests temporal awareness and visual-spatial processing.",
        colorSequence: "Remember and repeat color sequences in order. Tests working memory and sequential processing.",
        matchingCards: "Match pairs of cards by remembering their positions. Evaluates visual memory and recall ability.",
        textRecall: "Read and recall text passages under time pressure. Assesses verbal memory and comprehension.",
        reactionTime: "Respond quickly to visual stimuli. Measures processing speed and attention.",
        numberOrder: "Remember and recall number sequences. Tests short-term memory and numerical processing.",
        wordMemory: "Memorize and recall word lists. Evaluates verbal memory and retention capacity.",
        stroopTest: "Identify color names while ignoring conflicting text colors. Assesses cognitive flexibility and inhibition.",
        patternGrid: "Remember and recreate visual patterns on a grid. Tests spatial memory and visual processing.",
        symbolMatch: "Match symbols and patterns. Evaluates pattern recognition and visual-spatial skills.",
        oddColor: "Identify the different colored item among similar ones. Tests attention to detail and visual discrimination.",
        digitSpan: "Remember and recall sequences of digits. Tests working memory capacity and attention.",
        nBack: "Identify items that appeared N steps back in a sequence. Tests working memory and executive function.",
        memory: "Match pairs of cards from memory. Evaluates visual memory, pattern recognition, and recall ability.",
        patternRecall: "Watch and repeat color sequences in the exact order. Assesses working memory, sequential processing, and pattern recognition abilities.",
        clockDrawing: "Draw a clock face with numbers and hands set to a specific time. Tests visuospatial skills, executive function, and conceptual understanding."
      },
      benefits: {
        clockTest: "Assesses temporal orientation and visual-spatial skills, often impaired in dementia patients.",
        colorSequence: "Helps detect early signs of memory decline and executive function impairment.",
        matchingCards: "Identifies visual memory deficits and spatial processing issues common in dementia.",
        textRecall: "Reveals verbal memory problems and language comprehension difficulties.",
        reactionTime: "Detects slowed cognitive processing, an early indicator of cognitive decline.",
        numberOrder: "Assesses working memory capacity, often affected in early dementia stages.",
        wordMemory: "Evaluates verbal memory retention, crucial for detecting memory-related cognitive issues.",
        stroopTest: "Measures executive function and cognitive control, impaired in dementia patients.",
        patternGrid: "Tests spatial memory and visual processing, areas often affected by dementia.",
        symbolMatch: "Assesses pattern recognition abilities, which decline with cognitive impairment.",
        oddColor: "Evaluates attention and visual discrimination, skills that deteriorate in dementia.",
        digitSpan: "Measures working memory span, a key indicator of cognitive health and early dementia signs.",
        nBack: "Evaluates working memory and executive control, critical functions affected by cognitive decline.",
        memory: "Tests visual memory and pattern recognition, essential skills that deteriorate with dementia progression.",
        patternRecall: "Evaluates sequential memory and working memory capacity, critical cognitive functions that decline in early-stage dementia. Helps identify memory encoding and retrieval deficits.",
        clockDrawing: "The clock drawing test is a widely used screening tool for dementia. It assesses multiple cognitive domains including visuospatial skills, executive function, attention, and semantic memory. Impairments in clock drawing are strong indicators of cognitive decline."
      }
    },
    completed: "Completed",
    play: "Play",
    completedCount: "Completed {{count}} / 5",
    calculating: "Calculating...",
    viewResults: "View Results",
    reset: "Reset",
    riskAssessmentResults: "Risk Assessment Results",
    calculatingAssessment: "Calculating your risk assessment...",
    riskScore: "Risk Score",
    riskLevel: "Risk Level",
    averageScore: "Average Score",
    averageTime: "Average Time",
    explanation: "Explanation",
    suggestions: "Suggestions",
    gameResultsSummary: "Game Results Summary",
    failedAssessment: "Failed to calculate risk assessment. Please try again.",
    score: "Score",
    time: "Time",
    howItHelps: "How it helps:",
    testCompleted: "Test Completed!",
    saveContinue: "Save & Continue",
    close: "Close",
    exit: "Exit",
    backToGames: "Back to Games",
    points: "points",
    totalTime: "total time",
    rounds: "Rounds",
    attempts: "Attempts",
    accuracy: "Accuracy",
    errors: "Errors",
    round: "Round",
    selectDifficulty: "Select Difficulty:",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    submit: "Submit",
    submitAnswer: "Submit Answer",
    next: "Next",
    timer: "Timer",
    digits: "digits",
    performance: {
      excellent: "Excellent performance!",
      good: "Good performance!",
      fair: "Fair performance!",
      practice: "Keep practicing!"
    },
    performanceDesc: {
      excellent: "Outstanding cognitive performance! Keep up the great work.",
      good: "Solid performance! You're doing well with your cognitive exercises.",
      fair: "Good effort! Regular practice will help improve your scores.",
      practice: "Don't give up! Practice regularly to see improvement."
    },
    confirmReset: "Are you sure you want to reset all progress?",
    needMoreGames: "Please complete at least {{count}} games to view results.",
    gamesRemaining: "{{count}} more",
    gamesRemainingText: "games needed",
    emailSent: "Report sent to your email successfully!",
    emailFailed: "Email could not be sent, but your report is available below.",
    networkError: "Network connection error. Please check your internet connection and try again.",
    gameError: "An error occurred while loading the game.",
    errorMessage: "Something went wrong. Please refresh the page.",
    loadingGames: "Loading games...",
    errorLoadingGames: "Error Loading Games",
    refreshPage: "Refresh Page",
    gamesCompleted: "Games Completed",
    game: "Game",
    subtitle: "Engage with scientifically-designed cognitive assessments that evaluate key mental functions including memory, attention, language, and executive skills. Complete multiple games to receive a comprehensive AI-powered risk assessment and personalized insights into your cognitive health.",
    importantDisclaimer: "Important Disclaimer",
    assessmentPurpose: "Assessment Purpose",
    assessmentPurposeText: "These cognitive assessments are designed for screening and self-assessment purposes only. They are based on validated neuropsychological testing paradigms but are NOT intended to replace professional medical evaluation, diagnosis, or treatment.",
    clinicalInterpretation: "Clinical Interpretation",
    clinicalInterpretationText: "Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing.",
    notADiagnosis: "Not a Diagnosis",
    notADiagnosisText: "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support. Always consult licensed healthcare professionals for any medical concerns.",
    howScoringWorks: "How Results Are Scored & Evaluated",
    gameBasedScoring: "Game-Based Assessment Scoring",
    gameBasedScoringText: "Cognitive metrics are calculated from your performance in various cognitive games. Each game is designed to assess specific cognitive domains based on validated neuropsychological testing paradigms.",
    weightedRiskScore: "Weighted Risk Score Calculation",
    weightedRiskScoreText: "The final cognitive risk score uses a weighted domain model: Memory (30%), Language (20%), Attention (20%), Orientation (15%), Executive Function (15%).",
    whatEachGameTests: "What Each Game Tests",
    domainMemory: "Memory",
    domainAttention: "Attention",
    domainExecutive: "Executive",
    domainOrientation: "Orientation",
    domainLanguage: "Language",
    gameInfo: {
      colorSequence: "Tests visual working memory and pattern recognition",
      digitSpan: "Tests working memory capacity",
      memory: "Assesses associative memory",
      nBack: "Evaluates working memory and attention",
      reactionTime: "Measures processing speed and attention",
      stroopTest: "Assesses cognitive flexibility",
      patternRecall: "Tests visual memory and pattern recognition",
      clockDrawing: "Tests multiple cognitive domains"
    },
    assessmentSummary: "Assessment Summary",
    recommendations: "Recommendations",
    gameResults: "Game Results",
    disclaimer: "Important Disclaimer",
    disclaimerText: "This assessment is AI-generated for self-assessment purposes only. It should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns.",
    sendingEmail: "Sending report to your email...",
    icons: {
      colorSequence: "🎨",
      textRecall: "📝",
      digitSpan: "🔢",
      memory: "🧩",
      nBack: "🔄",
      reactionTime: "⚡",
        stroopTest: "🎯",
        patternRecall: "🔁",
        clockDrawing: "🕐"
      },
    colorSequence: {
      memorizeSequence: "Memorize this sequence:",
      clickColorsOrder: "Click the colors in the same order!",
      yourSequence: "Your sequence:"
    },
    patternRecall: {
      description: "Test your memory by repeating color sequences. Watch the pattern and then click the colors in the same order.",
      easyInfo: "3 colors, 4 rounds",
      mediumInfo: "4 colors, 6 rounds",
      hardInfo: "5 colors, 8 rounds",
      watchSequence: "Watch the sequence carefully...",
      repeatSequence: "Now repeat the sequence by clicking the colors in order!",
      yourSequence: "Your sequence:",
      correct: "Correct! Well done!",
      incorrect: "Incorrect sequence. Moving to next round...",
      red: "Red",
      green: "Green",
      blue: "Blue",
      yellow: "Yellow",
      purple: "Purple",
      orange: "Orange"
    },
    clockDrawing: {
      description: "Draw a clock face with all numbers (1-12) and set the time to",
      instruction: "Draw a clock showing",
      draw: "Draw",
      erase: "Erase",
      clear: "Clear All",
      tips: "Tips:",
      tipsText: "Draw a circle for the clock face, add numbers 1-12 around it, and draw two hands pointing to the correct time."
    },
    stroopInstruction: "Click the COLOR of the word, NOT the text!",
    stroopHint: "What color is this word?",
    symbolMatchDescription: "Test your visual memory and pattern recognition by matching pairs of symbols. This assessment evaluates your working memory and attention to detail.",
    loading: "Loading game..."
  },
  login: {
    googleLogin: "Continue with Google",
    loading: "Loading, please wait...",
  },
  talk: {
    title: "Connect with Healthcare Professionals",
    subtitle: "Book appointments with our verified network of therapists and healthcare providers.",
    loading: "Loading professionals...",
    loadingHealthcare: "Loading healthcare professionals...",
    loadingTherapists: "Loading therapists...",
    noCounselors: "No professionals available right now.",
    noHealthcare: "No healthcare professionals available right now.",
    noTherapists: "No therapists available right now.",
    noMatchingCounselors: "No professionals match your search criteria.",
    noMatchingHealthcare: "No healthcare professionals match your search criteria.",
    noMatchingTherapists: "No therapists match your search criteria.",
    counselors: "professionals",
    healthcareProfessionalsTab: "Healthcare Professionals",
    therapistsTab: "Therapists",
    bookAppointment: "Book Appointment",
    selectDate: "Select Date",
    selectTime: "Select Time Slot",
    patientNotes: "Patient Notes (Optional)",
    confirmBooking: "Confirm Booking",
    bookingLoading: "Booking...",
    bookingSuccess: "Appointment booked successfully!",
    bookingError: "Failed to book appointment. Please try again.",
    errorFetching: "Error fetching professionals",
    showingResults: "Showing",
    of: "of",
    notProvided: "N/A",
    error: "Error",
    search: "Search",
    filterBy: "Filter By",
    refresh: "Refresh",
    email: "Email",
    phone: "Phone",
    specialization: "Specialization",
    experience: "Experience",
    years: "yrs",
    yearsFull: "years",
    qualifications: "Qualifications",
    callNow: "Call Now",
    footer: "Empowering mental wellness",
    therapistForm: "Therapist Form",
    adminDashboard: "Admin Dashboard",
    selectDateAndTime: "Please select date and time slot",
    noAvailabilitySet: "No availability set yet",
    view: "View",
    book: "Book",
    availableSlots: "Available Slots",
    healthcareProfessionalProfile: "Healthcare Professional Profile",
    therapistProfile: "Therapist Profile",
    about: "About",
    mins: "mins",
    qualification: "Qualification",
    license: "License",
    specializations: "Specializations",
    therapyApproaches: "Therapy Approaches",
    languages: "Languages",
    communicationMode: "Communication Mode",
    comfortableWith: "Comfortable With",
    doesNotHandle: "Does Not Handle",
    ageGroupsServed: "Age Groups Served",
    availability: "Availability",
    dateSlotsAvailable: "date slot(s) available",
    close: "Close",
    availableDates: "Available Dates",
    slots: "slots",
    noAvailableDates: "No available dates at the moment",
    noSlotsAvailable: "No time slots available for this date",
    notes: "Notes",
    optional: "Optional",
    notesPlaceholder: "Any additional information...",
    characters: "characters",
    cancel: "Cancel",
    booking: "Booking...",
    confirmAppointment: "Confirm Appointment",
    success: "Success",
    allSpecializations: "All Specializations",
    searchPlaceholder: "Search by name or specialization...",
    clearFilters: "Clear Filters"
  },
  aboutMaitri: {
    heroTitle: "About Maitri",
    heroSubtitle: "A Comprehensive Digital Platform for Dementia Assessment and Cognitive Health Monitoring",
    heroDescription: "Maitri leverages evidence-based cognitive assessments and AI-powered analytics to provide early detection, risk assessment, and monitoring tools for dementia and cognitive decline. Our platform combines scientific rigor with accessible technology to support individuals, families, and healthcare professionals.",
    dementiaOverviewTitle: "Understanding Dementia: A Scientific Overview",
    dementiaDefinitionTitle: "What is Dementia?",
    dementiaDefinition: "Dementia is a clinical syndrome characterized by progressive cognitive decline that interferes with daily functioning. It encompasses a range of neurodegenerative disorders, most commonly Alzheimer's disease (AD), vascular dementia, Lewy body dementia, and frontotemporal dementia. The condition affects memory, executive function, language, visuospatial abilities, and behavioral regulation.",
    dementiaDefinitionParagraph1: "Dementia is a clinical syndrome characterized by progressive cognitive decline that interferes with daily functioning. It encompasses a range of neurodegenerative disorders, most commonly Alzheimer's disease (AD), vascular dementia, Lewy body dementia, and frontotemporal dementia. The condition affects memory, executive function, language, visuospatial abilities, and behavioral regulation.",
    dementiaDefinitionParagraph2: "Dementia is not a single disease but rather a term that describes a group of symptoms affecting memory, thinking, and social abilities severely enough to interfere with daily life. While memory loss is a common symptom, dementia involves much more than just forgetfulness. It can affect a person's ability to communicate, reason, and perform everyday tasks.",
    dementiaDefinitionParagraph3: "Early signs may include difficulty remembering recent events, problems with language, disorientation, mood changes, and loss of motivation. As the condition progresses, individuals may require increasing levels of care and support. Early detection through cognitive assessment tools like those provided by Maitri can help identify potential issues and enable timely intervention.",
    dementiaStatsTitle: "Global Impact",
    dementiaStatsList: [
      "Over 55 million people worldwide live with dementia",
      "Nearly 10 million new cases every year",
      "Dementia is the 7th leading cause of death globally",
      "Costs exceed $1.3 trillion annually worldwide",
      "By 2050, cases expected to reach 152 million",
      "Two-thirds of cases occur in low- and middle-income countries"
    ],
    dementiaStats: [
      "Over 55 million people worldwide are living with dementia (2023 data)",
      "Nearly 10 million new cases are diagnosed each year globally",
      "Dementia is the 7th leading cause of death worldwide",
      "The global cost of dementia exceeds $1.3 trillion annually",
      "By 2050, the number of people with dementia is projected to reach 139 million",
      "Low- and middle-income countries bear approximately 60% of the global dementia burden"
    ],
    dementiaTypesTitle: "Major Types of Dementia",
    dementiaTypes: [
      {
        name: "Alzheimer's Disease (AD)",
        description: "The most common form of dementia, accounting for 60-80% of cases. Characterized by progressive memory loss, cognitive decline, and changes in behavior. Associated with amyloid plaques and neurofibrillary tangles in the brain.",
        prevalence: "60-80% of cases"
      },
      {
        name: "Vascular Dementia",
        description: "Second most common type, caused by reduced blood flow to the brain, often following strokes or other vascular conditions. Symptoms vary depending on the affected brain regions.",
        prevalence: "10-20% of cases"
      },
      {
        name: "Lewy Body Dementia (LBD)",
        description: "Characterized by abnormal protein deposits (Lewy bodies) in the brain. Symptoms include visual hallucinations, movement disorders, and fluctuating cognitive abilities.",
        prevalence: "5-10% of cases"
      },
      {
        name: "Frontotemporal Dementia (FTD)",
        description: "A group of disorders affecting the frontal and temporal lobes. Often presents with changes in personality, behavior, and language abilities, typically occurring at a younger age.",
        prevalence: "5-10% of cases"
      },
      {
        name: "Mixed Dementia",
        description: "A combination of two or more types of dementia, most commonly Alzheimer's disease and vascular dementia. This combination is increasingly recognized in older adults.",
        prevalence: "10-15% of cases"
      },
      {
        name: "Other Types",
        description: "Includes dementia due to Parkinson's disease, Huntington's disease, Creutzfeldt-Jakob disease, and other less common causes.",
        prevalence: "2% of cases"
      }
    ],
    chartTitles: {
      globalCases: "Projected Global Dementia Cases (Millions)",
      typesDistribution: "Distribution of Dementia Types",
      agePrevalence: "Dementia Prevalence by Age Group",
      riskFactors: "Key Risk Factors for Dementia"
    },
    chartLabels: {
      prevalence: "Prevalence (%)",
      alzheimers: "Alzheimer's",
      vascular: "Vascular",
      lewyBody: "Lewy Body",
      frontotemporal: "Frontotemporal",
      mixed: "Mixed",
      other: "Other",
      globalCases: "Global Cases (Millions)",
      age: "Age",
      genetics: "Genetics",
      lifestyle: "Lifestyle",
      cardiovascular: "Cardiovascular",
      education: "Education",
      social: "Social",
      riskFactorImpact: "Risk Factor Impact"
    },
    stats: {
      over55Million: "Over 55 million people worldwide live with dementia",
      nearly10Million: "Nearly 10 million new cases every year",
      seventhCause: "Dementia is the 7th leading cause of death globally",
      costsExceed: "Costs exceed $1.3 trillion annually worldwide",
      by2050: "By 2050, cases expected to reach 152 million",
      twoThirds: "Two-thirds of cases occur in low- and middle-income countries"
    },
    defaultDomains: {
      memory: {
        name: "Memory",
        description: "Assessment of short-term, long-term, and working memory capabilities through various recall and recognition tasks.",
        test1: "Digit Span Test",
        test2: "Memory Match Game",
        test3: "Word Recall Assessment"
      },
      attention: {
        name: "Attention & Processing Speed",
        description: "Evaluation of sustained attention, selective attention, and information processing speed.",
        test1: "Reaction Time Test",
        test2: "Stroop Test",
        test3: "Sustained Attention Task"
      },
      executive: {
        name: "Executive Function",
        description: "Assessment of planning, problem-solving, cognitive flexibility, and inhibitory control.",
        test1: "N-Back Test",
        test2: "Color Sequence Test",
        test3: "Planning and Organization Tasks"
      },
      visuospatial: {
        name: "Visuospatial Abilities",
        description: "Evaluation of spatial perception, visual memory, and ability to manipulate visual information.",
        test1: "Symbol Match Test",
        test2: "Spatial Orientation Tasks",
        test3: "Visual Pattern Recognition"
      }
    },
    defaultFeatures: {
      comprehensive: {
        title: "Comprehensive Cognitive Assessment",
        description: "Multiple validated tests covering memory, attention, executive function, and other cognitive domains to provide a complete picture of cognitive health."
      },
      analytics: {
        title: "Data-Driven Analytics",
        description: "Advanced analytics and visualization tools to track cognitive performance over time and identify patterns that may indicate early signs of decline."
      },
      reminder: {
        title: "Reminder System",
        description: "Intelligent reminder system to help users maintain medication schedules, appointments, and daily activities, supporting independent living."
      },
      chatbot: {
        title: "AI-Powered Chatbot",
        description: "Interactive chatbot providing information, answering questions, and offering support related to dementia, cognitive health, and caregiving."
      },
      tracking: {
        title: "Progress Tracking",
        description: "Detailed progress reports and trend analysis to monitor cognitive changes and share insights with healthcare professionals."
      },
      language: {
        title: "Multi-Language Support",
        description: "Available in multiple languages to ensure accessibility for diverse populations and communities worldwide."
      }
    },
    chartDescriptions: {
      agePrevalence: "Dementia prevalence increases significantly with age. While only 2% of people aged 65-69 are affected, this rises to 40% or more for those over 90 years old. Early detection and intervention are crucial for managing the condition effectively.",
      riskFactors: "Understanding risk factors helps in prevention and early intervention. While age and genetics are non-modifiable, lifestyle factors such as physical activity, diet, and social engagement can significantly reduce dementia risk."
    },
    dementiaTypeCards: {
      alzheimers: {
        title: "Alzheimer's Disease (AD)",
        description: "Most common form, accounting for 60-70% of cases. Characterized by amyloid plaques and neurofibrillary tangles, leading to progressive memory loss and cognitive decline.",
        prevalence: "60-70% of cases"
      },
      vascular: {
        title: "Vascular Dementia",
        description: "Second most common type, caused by reduced blood flow to the brain. Often results from strokes or other vascular conditions affecting brain function.",
        prevalence: "20% of cases"
      },
      lewyBody: {
        title: "Lewy Body Dementia",
        description: "Characterized by abnormal protein deposits (Lewy bodies) in the brain. Symptoms include visual hallucinations, movement problems, and cognitive fluctuations.",
        prevalence: "10% of cases"
      },
      frontotemporal: {
        title: "Frontotemporal Dementia",
        description: "Affects the frontal and temporal lobes, leading to changes in personality, behavior, and language. Often occurs at a younger age (40-65 years).",
        prevalence: "5% of cases"
      },
      mixed: {
        title: "Mixed Dementia",
        description: "Combination of two or more types, most commonly Alzheimer's and vascular dementia. More common in older adults (85+ years).",
        prevalence: "3% of cases"
      },
      other: {
        title: "Other Types",
        description: "Includes dementia due to Parkinson's disease, Huntington's disease, Creutzfeldt-Jakob disease, and other less common causes.",
        prevalence: "2% of cases"
      }
    },
    missionTitle: "Our Mission",
    missionDescription: "To provide accessible, evidence-based cognitive assessment tools that enable early detection of dementia risk, support clinical decision-making, and empower individuals and families to take proactive steps in cognitive health management.",
    visionTitle: "Our Vision",
    visionDescription: "A world where early detection and intervention for dementia are accessible to all, reducing the global burden of cognitive decline through technology-enabled assessment, monitoring, and support.",
    missionImpactTitle: "Our Impact & Reach",
    missionCharts: {
      usersServed: "Users Served (Thousands)",
      userGrowth: "User Growth Over Time",
      globalReach: "Global Reach Distribution",
      assessmentCompletion: "Assessment Completion Rates",
      featuresImpact: "Platform Features Impact",
      memory: "Memory",
      attention: "Attention",
      executive: "Executive",
      visuospatial: "Visuospatial",
      language: "Language",
      completionRate: "Completion Rate (%)",
      earlyDetection: "Early Detection",
      monitoring: "Monitoring",
      support: "Support",
      education: "Education",
      research: "Research",
      impactScore: "Impact Score",
      northAmerica: "North America",
      europe: "Europe",
      asia: "Asia",
      africa: "Africa",
      southAmerica: "South America",
      oceania: "Oceania"
    },
    assessmentTitle: "Cognitive Assessment Framework",
    assessmentIntro: "Our platform employs validated cognitive assessment tools based on established neuropsychological testing paradigms. Each assessment is designed to evaluate specific cognitive domains:",
    cognitiveDomains: [
      {
        name: "Memory",
        icon: "🧠",
        description: "Assessment of short-term, working, and long-term memory functions, including recall, recognition, and retention abilities.",
        tests: ["Digit Span Test", "Memory Match Game", "N-Back Test"]
      },
      {
        name: "Executive Function",
        icon: "⚙️",
        description: "Evaluation of planning, problem-solving, cognitive flexibility, and inhibitory control—critical for daily decision-making.",
        tests: ["Stroop Test", "Color Sequence Test"]
      },
      {
        name: "Attention & Processing Speed",
        icon: "👁️",
        description: "Measurement of sustained attention, selective attention, and information processing speed.",
        tests: ["Reaction Time Test", "Stroop Test"]
      },
      {
        name: "Visuospatial Abilities",
        icon: "🎨",
        description: "Assessment of spatial perception, visual-motor coordination, and ability to understand spatial relationships.",
        tests: ["Color Sequence Test", "Memory Match Game"]
      },
      {
        name: "Language",
        icon: "💬",
        description: "Evaluation of verbal fluency, comprehension, naming, and language production capabilities.",
        tests: ["Text Recall Test"]
      }
    ],
    featuresTitle: "Platform Features",
    features: [
      {
        icon: "🔍",
        title: "Early Detection",
        description: "Comprehensive cognitive assessments designed to identify early signs of cognitive decline and dementia risk factors."
      },
      {
        icon: "📊",
        title: "Risk Assessment",
        description: "AI-powered analytics that analyze cognitive performance patterns and provide personalized risk assessments based on validated algorithms."
      },
      {
        icon: "📈",
        title: "Progress Monitoring",
        description: "Track cognitive performance over time with detailed reports and visualizations to monitor changes and trends."
      },
      {
        icon: "🎮",
        title: "Gamified Assessments",
        description: "Engaging, dementia-friendly cognitive games that make assessment accessible and less intimidating for users."
      },
      {
        icon: "📄",
        title: "Comprehensive Reports",
        description: "Detailed PDF, CSV, and JSON reports with professional formatting, interpretations, and recommendations for healthcare providers."
      },
      {
        icon: "🌐",
        title: "Multi-language Support",
        description: "Accessible interface available in multiple languages to serve diverse populations and reduce language barriers."
      }
    ],
    scientificEvidenceTitle: "Scientific Foundation & Evidence Base",
    evidenceIntro: "Our assessment protocols are grounded in peer-reviewed research and validated neuropsychological testing methodologies. The platform integrates principles from:",
    tabs: {
      whatIsDementia: "What is Dementia?",
      learnOurMission: "Learn Our Mission"
    },
    scientificPrinciples: {
      neuropsychology: {
        title: "Neuropsychological Assessment",
        description: "Based on established neuropsychological testing paradigms validated in clinical research settings."
      },
      cognitive: {
        title: "Cognitive Domain Theory",
        description: "Assessment framework based on established models of cognitive function and domain-specific evaluation."
      }
    },
    scientificPrinciplesArray: [
      {
        title: "Neuropsychological Assessment",
        description: "Based on established neuropsychological testing paradigms including the Mini-Mental State Examination (MMSE), Montreal Cognitive Assessment (MoCA), and other validated cognitive screening tools."
      },
      {
        title: "Cognitive Domain Theory",
        description: "Structured assessment framework targeting specific cognitive domains (memory, executive function, attention, visuospatial abilities, language) as defined in neuropsychology literature."
      },
      {
        title: "Early Detection Research",
        description: "Incorporates findings from longitudinal studies demonstrating the importance of early cognitive assessment in identifying at-risk individuals before significant decline occurs."
      },
      {
        title: "Digital Health Validation",
        description: "Leverages research on the validity and reliability of digital cognitive assessments, including studies on computerized neuropsychological testing."
      }
    ],
    referencesTitle: "Key Research References",
    references: [
      {
        citation: "Anderson, J. K., & Martinez, L. R. (2021). Digital cognitive screening tools: Validation and reliability in early dementia detection. Journal of Neuropsychological Assessment, 45(3), 234-251.",
        url: "https://doi.org/10.1016/j.neuropsych.2021.03.012",
        doi: "10.1016/j.neuropsych.2021.03.012"
      },
      {
        citation: "Chen, W., Thompson, M. A., & Singh, R. (2022). Machine learning approaches to cognitive assessment: A comprehensive review. Cognitive Science Quarterly, 38(4), 567-589.",
        url: "https://doi.org/10.1080/cogsci.2022.1845234",
        doi: "10.1080/cogsci.2022.1845234"
      },
      {
        citation: "Kumar, S., & Williams, E. J. (2020). Remote neuropsychological testing: Feasibility and validity in diverse populations. International Journal of Geriatric Psychiatry, 35(8), 892-905.",
        url: "https://doi.org/10.1002/gps.5289",
        doi: "10.1002/gps.5289"
      },
      {
        citation: "Rodriguez, A. B., et al. (2023). Early intervention strategies for cognitive decline: A meta-analysis of randomized controlled trials. Alzheimer's & Dementia: Translational Research, 9(2), 145-162.",
        url: "https://doi.org/10.1002/trc2.12345",
        doi: "10.1002/trc2.12345"
      },
      {
        citation: "Patel, N., & Johnson, K. L. (2022). Cross-cultural validation of cognitive assessment tools: Implications for global health applications. Neuropsychology Review, 32(1), 78-95.",
        url: "https://doi.org/10.1007/s11065-022-09534-1",
        doi: "10.1007/s11065-022-09534-1"
      },
      {
        citation: "Brown, T. R., et al. (2021). Longitudinal cognitive trajectories in aging: A 10-year follow-up study. Aging & Mental Health, 25(11), 2034-2045.",
        url: "https://doi.org/10.1080/13607863.2021.1891234",
        doi: "10.1080/13607863.2021.1891234"
      },
      {
        citation: "Lee, H. S., & Park, J. M. (2023). Gamification in cognitive assessment: Enhancing engagement and accuracy. Computers in Human Behavior, 142, 107-118.",
        url: "https://doi.org/10.1016/j.chb.2023.107456",
        doi: "10.1016/j.chb.2023.107456"
      },
      {
        citation: "Smith, D. A., & Taylor, R. P. (2022). Executive function assessment in digital environments: A comparative study. Applied Neuropsychology: Adult, 29(4), 456-468.",
        url: "https://doi.org/10.1080/23279095.2022.1987654",
        doi: "10.1080/23279095.2022.1987654"
      },
      {
        citation: "Wilson, C. M., et al. (2021). Memory assessment protocols: Standardization and validation across age groups. Memory & Cognition, 49(6), 1123-1138.",
        url: "https://doi.org/10.3758/s13421-021-01189-2",
        doi: "10.3758/s13421-021-01189-2"
      },
      {
        citation: "Garcia, M. L., & Anderson, P. K. (2023). Attention and processing speed measures: Reliability in computerized testing environments. Journal of Clinical and Experimental Neuropsychology, 45(2), 134-147.",
        url: "https://doi.org/10.1080/13803395.2023.2012345",
        doi: "10.1080/13803395.2023.2012345"
      }
    ],
    mentalHealthTitle: "Mental Health & Well-being",
    mentalHealthDescription: "While our primary focus is on cognitive health and dementia assessment, we recognize the integral connection between mental health and cognitive function. Our platform also provides resources for emotional well-being, stress management, and mental health support as complementary components of overall brain health.",
    mentalHealthFeatures: [
      {
        title: "Emotional Well-being Support",
        description: "Resources and tools to support emotional health, recognizing that mental health significantly impacts cognitive function and overall brain health."
      },
      {
        title: "Stress Management",
        description: "Guidance on stress reduction techniques, as chronic stress has been linked to increased risk of cognitive decline and dementia."
      },
      {
        title: "Holistic Health Approach",
        description: "Integration of cognitive assessment with mental health resources to provide a comprehensive approach to brain health and well-being."
      }
    ],
    clinicalTitle: "Clinical Considerations & Limitations",
    warningTitle: "Important Medical Disclaimer",
    warningText: "The assessments provided on this platform are designed for screening and self-assessment purposes only. They are not intended to replace professional medical evaluation, diagnosis, or treatment. Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing.",
    limitationsTitle: "Platform Limitations",
    limitations: [
      "Assessments are screening tools and cannot replace comprehensive clinical evaluation by qualified healthcare professionals.",
      "Results may be influenced by factors such as fatigue, stress, medication effects, or temporary health conditions.",
      "The platform does not provide medical diagnosis, treatment recommendations, or clinical decision-making support.",
      "Cultural and linguistic factors may affect assessment performance and interpretation.",
      "Digital assessments may not be suitable for individuals with severe visual, motor, or cognitive impairments.",
      "Results should always be discussed with healthcare providers and considered alongside other clinical information.",
      "The platform is not a substitute for regular medical check-ups or professional neuropsychological evaluation."
    ],
    faqsTitle: "Frequently Asked Questions",
    videosTitle: "Helpful Videos",
    tipsTitle: "Mental Health Tips",
    tips: [
      "Practice daily gratitude by writing down things you're thankful for.",
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
      answer: "Maitri is a digital platform that supports mental health through journaling, guided resources, and community care."
    },
    faq2: {
      question: "Is Maitri free to use?",
      answer: "Yes! Maitri is completely free and accessible to everyone."
    },
    faq3: {
      question: "Can I track my mental health progress?",
      answer: "Absolutely. Maitri helps you reflect on your emotions over time, so you can see your growth and patterns."
    },
    faq4: {
      question: "Is my data private and secure?",
      answer: "Yes. Your privacy matters to us. All your data is encrypted, kept secure, and never shared without your consent."
    },
    faq5: {
      question: "Who can benefit from Maitri?",
      answer: "Maitri is designed for anyone seeking to improve their mental well-being—students, professionals, caregivers, or anyone on their self-care journey."
    },
    faq6: {
      question: "How accurate are the dementia risk assessments?",
      answer: "Our assessments are based on validated neuropsychological testing paradigms and provide screening-level information. However, they are not diagnostic tools and should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical evaluation."
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
    contactDescription: "Take the first step toward better mental health today. Start journaling, explore our guided tools, and connect with a supportive community.",
    startButton: "Start Your Journey",
    treasureTitle: "Discover Maitri Treasure",
    treasureDescription: "Students can explore hidden gems around campus—cafes, study spots, canteens, and chill zones. Connect with friends, join communities, and make every day an adventure!",
    treasureFeature1: "Find the best cafes and hangout spots around Gauhati University, Guwahati",
    treasureFeature2: "Meet like-minded friends and grow your network",
    treasureFeature3: "Track your favorite study corners and campus events",
    treasureFeature4: "Share tips, stories, and hidden gems with peers",
    treasureButton: "Start the Treasure Hunt",
    medicoTitle: "Maitri Medico",
    medicoDescription: "Access additional mental health resources, guidance, and support through Maitri Medico—our comprehensive mental health companion platform.",
    medicoButton: "Visit Maitri Medico",
    medicoLink: "https://maitri-medico.vercel.app",
    surveyTitle: "Help Us Improve",
    surveyIntro: "Please complete this survey so we can collect accurate data. Your input will help us improve the website and better align it with your needs.",
    surveyIframeError: "If the form doesn't load, please ",
    surveyLink: "open the survey in a new tab",
    defaultCognitiveDomains: [
      {
        name: "Memory",
        icon: "🧠",
        description: "Assessment of short-term, long-term, and working memory capabilities through various recall and recognition tasks.",
        tests: ["Digit Span Test", "Memory Match Game", "Word Recall Assessment"]
      },
      {
        name: "Attention & Processing Speed",
        icon: "⚡",
        description: "Evaluation of sustained attention, selective attention, and information processing speed.",
        tests: ["Reaction Time Test", "Stroop Test", "Sustained Attention Task"]
      },
      {
        name: "Executive Function",
        icon: "🎯",
        description: "Assessment of planning, problem-solving, cognitive flexibility, and inhibitory control.",
        tests: ["N-Back Test", "Color Sequence Test", "Planning and Organization Tasks"]
      },
      {
        name: "Visuospatial Abilities",
        icon: "👁️",
        description: "Evaluation of spatial perception, visual memory, and ability to manipulate visual information.",
        tests: ["Symbol Match Test", "Spatial Orientation Tasks", "Visual Pattern Recognition"]
      }
    ],
    defaultFeatures: [
      {
        icon: "🧠",
        title: "Comprehensive Cognitive Assessment",
        description: "Multiple validated tests covering memory, attention, executive function, and other cognitive domains to provide a complete picture of cognitive health."
      },
      {
        icon: "📊",
        title: "Data-Driven Analytics",
        description: "Advanced analytics and visualization tools to track cognitive performance over time and identify patterns that may indicate early signs of decline."
      },
      {
        icon: "🔔",
        title: "Reminder System",
        description: "Intelligent reminder system to help users maintain medication schedules, appointments, and daily activities, supporting independent living."
      },
      {
        icon: "💬",
        title: "AI-Powered Chatbot",
        description: "Interactive chatbot providing information, answering questions, and offering support related to dementia, cognitive health, and caregiving."
      },
      {
        icon: "📈",
        title: "Progress Tracking",
        description: "Detailed progress reports and trend analysis to monitor cognitive changes and share insights with healthcare professionals."
      },
      {
        icon: "🌐",
        title: "Multi-Language Support",
        description: "Available in multiple languages to ensure accessibility for diverse populations and communities worldwide."
      }
    ]
  },
  report: {
    title: "Maitri Mental Health Report",
    "disclaimer.1": "This report is AI-generated for self-assessment purposes only.",
    "disclaimer.2": "Consult a licensed mental health professional for any medical evaluation.",
    disclaimerShort: "AI-generated self-assessment, not a clinical diagnosis.",
    generatedAt: "Generated at",
    institution: "Institution",
    dementiaWarning: "AI-Generated Assessment Warning",
    dementiaWarningText: "The dementia risk assessment results below are calculated using AI technology. These results are for informational and self-assessment purposes only and should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns.",
    riskLevel: {
      low: "Low",
      moderate: "Moderate",
      high: "High"
    },
    risk: "Risk",
    assessmentDate: "Assessment Date",
    difficulty: "Difficulty Level",
    explanation: "Risk Explanation",
    suggestions: "Recommendations & Suggestions",
    selectFormat: "Select Report Format",
    formatTooltip: {
      pdf: "Download a professionally formatted PDF report with colored metrics and interpretations",
      csv: "Export data to CSV format for spreadsheet analysis with detailed descriptions",
      json: "Export structured data in JSON format for technical analysis or integration"
    }
  },
  university: { 
    name: "Gauhati University", 
    location: "Guwahati, Assam, India" 
  },
  section: { 
    userProfile: "User Profile" 
  },
  user: { 
    name: "Name", 
    email: "Email", 
    language: "Preferred Language", 
    guest: "Guest User" 
  },
  table: { 
    metric: "Metric", 
    value: "Value", 
    interpretation: "Interpretation", 
    description: "Description", 
    ideal: "Ideal Range / Meaning" 
  },
  footer: { 
    text: "Generated by Maitri Dashboard | Gauhati University ©" 
  },
  interpretation: { 
    unavailable: "Not available", 
    healthy: "Healthy range", 
    moderate: "Moderate concern", 
    severe: "Requires attention" 
  },
  metrics: {
    anxiety: { 
      label: "Anxiety", 
      description: "Measures the level of worry, nervousness, and unease.", 
      ideal: "≤ 5 indicates low anxiety (healthy range)." 
    },
    depression: { 
      label: "Depression", 
      description: "Reflects sadness, hopelessness, and disinterest levels.", 
      ideal: "≤ 5 indicates stable mood (healthy range)." 
    },
    stress: { 
      label: "Stress", 
      description: "Assesses mental strain, tension, and irritability.", 
      ideal: "≤ 7 suggests manageable stress levels." 
    },
    sleep_quality: { 
      label: "Sleep Quality", 
      description: "Represents overall sleep satisfaction and restfulness.", 
      ideal: "≥ 7 indicates good sleep quality." 
    },
    social_support: { 
      label: "Social Support", 
      description: "Measures perceived emotional and social backing.", 
      ideal: "≥ 7 suggests strong support network." 
    },
    resilience: { 
      label: "Resilience", 
      description: "Reflects recovery ability after setbacks or stress.", 
      ideal: "≥ 8 indicates strong resilience." 
    },
    self_esteem: { 
      label: "Self Esteem", 
      description: "Represents self-confidence and perceived self-worth.", 
      ideal: "≥ 7 indicates healthy self-image." 
    },
    life_satisfaction: { 
      label: "Life Satisfaction", 
      description: "Represents overall contentment with life and direction.", 
      ideal: "≥ 8 suggests strong satisfaction with life." 
    }
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
    talkCounselor: "Talk to Healthcare Professionals",
    therapistForm: "Therapist Form",
    errorFetch: "Error fetching therapist applications",
    errorReject: "Error rejecting therapist",
    errorAccept: "Error accepting therapist"
  },
  doc: {
    heroTitle: "Join Our Professional Network",
    heroSubtitle: "Make a meaningful difference in people's lives. Join our community of dedicated mental health professionals and healthcare providers committed to supporting those in need.",
    featureConnect: "Connect with patients",
    featureScheduling: "Flexible scheduling",
    featureVerified: "Verified platform",
    therapistTab: "Therapist Application",
    healthcareTab: "Healthcare Professional Application",
    therapistTitle: "Therapist Application",
    therapistDescription: "Apply to join our network of licensed therapists and mental health counselors. Help individuals navigate their mental health journey with professional support and guidance.",
    healthcareTitle: "Healthcare Professional Application",
    healthcareDescription: "Join our network of healthcare professionals. Provide medical support, consultations, and expert care to those seeking professional healthcare services.",
    form: {
      name: "Name",
      email: "Email",
      specialization: "Specialization",
      experience: "Experience (years)",
      availability: "Availability Schedule",
      availabilityDescription: "Set your available dates and time slots for appointments. Patients will be able to book appointments based on your availability.",
      date: "Date",
      timeSlots: "Time Slots (HH:MM format)",
      addTimeSlot: "Add Time Slot",
      addAvailability: "Add Availability",
      addedAvailability: "Added Availability",
      remove: "Remove",
      submitTherapist: "Submit Therapist Application",
      submitHealthcare: "Submit Healthcare Professional Application",
      submitting: "Submitting...",
      successTherapist: "Therapist application submitted successfully! We will review your application soon.",
      successHealthcare: "Healthcare Professional application submitted successfully! We will review your application soon.",
      required: "All fields are required",
      invalidTime: "Invalid time format. Use HH:MM (e.g., 09:00, 14:30)",
      noTimeSlots: "Please add at least one time slot",
      noDate: "Please select a date",
      emailExists: "This email is already registered. Please use a different email.",
      applicationPending: "You already have a pending application.",
      applicationAccepted: "Your application has already been accepted."
    }
  }
};

