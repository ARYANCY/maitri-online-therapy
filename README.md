# Maitri - Mental Health & Cognitive Assessment Platform

A comprehensive full-stack web application for mental health support, cognitive assessment, and therapy management. Maitri provides early detection of cognitive decline through gamified assessments, connects users with healthcare professionals, and offers AI-powered mental health support.

## Project Overview

Maitri is a production-ready platform that combines cognitive assessment games, therapy booking, AI chatbot support, and comprehensive health monitoring. The platform is designed to be accessible, multilingual, and scientifically grounded in neuropsychological research.

## Core Features

### Cognitive Assessment Games
- **Digit Span**: Tests working memory and attention span
- **Memory Match**: Assesses visual memory and pattern recognition
- **Pattern Recall**: Evaluates sequential memory and visual processing
- **Color Sequence**: Tests color memory and sequencing ability
- **Reaction Time Test**: Measures processing speed and attention
- **Stroop Test**: Assesses cognitive flexibility and inhibition
- **N-Back**: Tests working memory and executive function
- **Clock Drawing**: Evaluates visuospatial abilities and executive function
- **Matching Cards**: Tests visual memory and concentration
- **Symbol Match**: Assesses pattern recognition and memory

### Risk Assessment & Analytics
- **Age-Based Normalization**: Adjusts scores based on age groups (10-15, 15-20, 20-30, 30-40, 40-50, 50-60, 60-70, 70-80, 80-90)
- **Weighted Domain Scoring**: Memory (35%), Language (20%), Attention (20%), Orientation (12.5%), Executive Function (12.5%)
- **Cognitive Domain Mapping**: Maps game results to cognitive domains
- **Risk Score Calculation**: Comprehensive risk assessment algorithm
- **Progress Tracking**: Historical performance monitoring
- **Detailed Reports**: PDF, CSV, and JSON export formats

### Healthcare Professional Management
- **Therapist Applications**: Complete application system for therapists
- **Healthcare Professional Registration**: Multi-step registration process
- **Profile Management**: Comprehensive profile with qualifications, experience, and credentials
- **Availability Management**: Schedule and availability setting
- **Appointment Booking**: Real-time appointment scheduling
- **Status Management**: Accept, reject, or delete applications

### AI-Powered Chatbot
- **Google Gemini Integration**: Advanced AI conversation support
- **Multi-language Support**: English, Hindi, Assamese
- **Context-Aware Responses**: Maintains conversation context
- **Mental Health Support**: Provides guidance and information
- **Session Management**: Persistent conversation history

### Appointment System
- **Real-time Booking**: Book appointments with therapists and healthcare professionals
- **Appointment Management**: View, cancel, and reschedule appointments
- **Status Tracking**: Track appointment status (pending, confirmed, completed, cancelled)
- **Reminder System**: Email notifications for upcoming appointments
- **Calendar Integration**: Visual calendar interface

### Internationalization (i18n)
- **Multi-language Support**: English, Hindi, Assamese
- **Dynamic Language Switching**: Change language on the fly
- **Localized Content**: All UI elements translated
- **RTL Support**: Right-to-left language support ready

### Mobile Responsive Design
- **Fully Responsive**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets and gestures
- **Mobile-First CSS**: Comprehensive mobile styling
- **Progressive Enhancement**: Works on all devices

### Security Features
- **Google OAuth 2.0**: Secure authentication
- **JWT Tokens**: Token-based session management
- **Session Management**: Secure server-side sessions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Helmet.js**: Security headers configuration
- **CORS**: Configured cross-origin resource sharing

### Dashboard & Analytics
- **User Dashboard**: Comprehensive user statistics
- **Game Progress**: Track completed games and scores
- **Appointment History**: View past and upcoming appointments
- **Health Metrics**: Cognitive performance trends
- **Chart Visualizations**: Interactive charts and graphs

### Report Generation
- **PDF Reports**: Professional PDF generation
- **CSV Export**: Data export for analysis
- **JSON Export**: Machine-readable format
- **Detailed Metrics**: Comprehensive performance data
- **Visual Charts**: Embedded charts in reports

## Tech Stack

### Frontend
- **React 18.3**: Modern React with hooks
- **Vite 7.1**: Fast build tool and dev server
- **React Router 7.8**: Client-side routing
- **Bootstrap 5.3**: Responsive UI framework
- **Chart.js 4.5**: Data visualization
- **i18next 25.5**: Internationalization
- **Axios 1.11**: HTTP client
- **React Konva 18.2**: Canvas drawing (Clock Drawing game)
- **jsPDF 3.0**: PDF generation
- **html2canvas 1.4**: Screenshot generation

### Backend
- **Node.js 18+**: JavaScript runtime
- **Express.js 5.x**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **Passport.js**: Authentication middleware
- **Google Generative AI**: AI chatbot integration
- **Nodemailer**: Email notifications
- **Winston**: Logging framework
- **Joi**: Schema validation
- **Helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **express-session**: Session management
- **connect-mongo**: MongoDB session store

## Project Structure

```
maitri/
├── backend/                          # Backend server (Node.js/Express)
│   ├── config/                       # Configuration files
│   │   ├── cloudinary.js            # Cloudinary image upload config
│   │   ├── database.js              # MongoDB connection config
│   │   ├── env.js                   # Environment variables loader
│   │   └── passport.js             # Passport.js authentication config
│   ├── constants/                   # Application constants
│   │   └── index.js                 # Constant definitions
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js        # Authentication logic
│   │   ├── chatbotController.js    # AI chatbot logic
│   │   ├── dashboardController.js  # Dashboard data logic
│   │   ├── dementiaController.js   # Cognitive assessment logic
│   │   ├── healthcareProfessionalController.js  # Healthcare professional management
│   │   ├── reportController.js     # Report generation logic
│   │   └── therapistController.js  # Therapist management logic
│   ├── middleware/                  # Express middleware
│   │   ├── authMiddleware.js        # Authentication middleware
│   │   ├── cookieDebug.js          # Cookie debugging utility
│   │   ├── errorHandler.js         # Global error handler
│   │   ├── security.js             # Security middleware
│   │   ├── upload.js               # File upload middleware
│   │   └── validation.js           # Request validation
│   ├── models/                      # MongoDB models (Mongoose)
│   │   ├── DementiaAssessment.js   # Assessment data model
│   │   ├── DOCH.js                 # Healthcare professional model
│   │   ├── DOCT.js                 # Therapist model
│   │   ├── metrics.js              # Application metrics model
│   │   ├── Notification.js         # Notification model
│   │   ├── Screening.js            # Screening data model
│   │   ├── todo.js                 # Todo list model
│   │   └── User.js                 # User model
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.js           # Authentication routes
│   │   ├── chatbotRoutes.js        # Chatbot API routes
│   │   ├── dashboardRoutes.js      # Dashboard API routes
│   │   ├── dementiaRoutes.js       # Cognitive assessment routes
│   │   ├── healthcareProfessionalAdminRoutes.js  # Admin healthcare routes
│   │   ├── healthcareProfessionalRoutes.js      # Healthcare professional routes
│   │   ├── healthRoutes.js         # Health check routes
│   │   ├── languageRoutes.js       # Language preference routes
│   │   ├── notificationRoutes.js   # Notification routes
│   │   ├── reportRoutes.js         # Report generation routes
│   │   ├── therapistAdminRoutes.js # Admin therapist routes
│   │   ├── therapistRoutes.js      # Therapist routes
│   │   └── uploadRoutes.js         # File upload routes
│   ├── utils/                       # Utility functions
│   │   ├── ageNormalization.js     # Age-based score normalization
│   │   ├── cognitiveDomainMapper.js # Cognitive domain mapping
│   │   ├── i18n.js                 # Internationalization utilities
│   │   ├── logger.js               # Winston logger configuration
│   │   ├── responseHelper.js       # API response helpers
│   │   └── validation.js           # Validation utilities
│   ├── index.js                     # Main server entry point
│   ├── nginx.conf                   # Nginx configuration
│   ├── package.json                 # Backend dependencies
│   └── README.md                    # Backend documentation
│
├── frontend/                         # Frontend application (React/Vite)
│   ├── components/                  # Reusable React components
│   │   ├── Chart.jsx               # Chart visualization component
│   │   ├── Chatbot.jsx             # AI chatbot component
│   │   ├── Footer.jsx              # Footer component
│   │   ├── GameInstructions.jsx   # Game instructions modal
│   │   ├── GameKeyboardShortcuts.jsx  # Keyboard shortcuts helper
│   │   ├── GoogleLogin.jsx        # Google OAuth login component
│   │   ├── Navbar.jsx              # Navigation bar component
│   │   ├── PrivateAdminRoute.jsx  # Admin route protection
│   │   ├── Todo.jsx                # Todo list component
│   │   └── ViewResult.jsx          # Result viewing component
│   ├── css/                         # Stylesheets
│   │   ├── components/             # Component-specific styles
│   │   │   ├── Chart.css
│   │   │   ├── Chat.css
│   │   │   ├── Footer.css
│   │   │   ├── Navbar.css
│   │   │   └── Todo.css
│   │   ├── pages/                   # Page-specific styles
│   │   │   ├── AboutMaitri.css
│   │   │   ├── Admin.css
│   │   │   ├── AdminLogin.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Home.css
│   │   │   ├── Splash.css
│   │   │   ├── TalkToCounselor.css
│   │   │   └── TherapistForm.css
│   │   ├── game/                    # Game-specific styles
│   │   ├── bootstrap-theme.css     # Bootstrap theme customization
│   │   ├── mobile-responsive.css    # Mobile responsive styles
│   │   └── unified-design-system.css  # Design system variables
│   ├── hooks/                       # Custom React hooks
│   │   └── useVoskSpeechRecognition.js  # Speech recognition hook
│   ├── pages/                       # Page components
│   │   ├── game-components/        # Cognitive game components
│   │   │   ├── ClockDrawing.jsx    # Clock Drawing game
│   │   │   ├── ColorSequence.jsx    # Color Sequence game
│   │   │   ├── DigitSpan.jsx        # Digit Span game
│   │   │   ├── MatchingCards.jsx    # Matching Cards game
│   │   │   ├── MemoryMatch.jsx      # Memory Match game
│   │   │   ├── NBack.jsx            # N-Back game
│   │   │   ├── PatternRecall.jsx   # Pattern Recall game
│   │   │   ├── ReactionTimeTest.jsx # Reaction Time game
│   │   │   ├── ResultPopup.jsx      # Game result popup
│   │   │   ├── StroopTest.jsx       # Stroop Test game
│   │   │   ├── SymbolMatch.jsx      # Symbol Match game
│   │   │   ├── game-algo-js/        # Game algorithm implementations
│   │   │   │   ├── ageNormalization.js
│   │   │   │   ├── clockDrawing.js
│   │   │   │   ├── colorSequence.js
│   │   │   │   ├── digitSpan.js
│   │   │   │   ├── matchingCards.js
│   │   │   │   ├── memoryMatch.js
│   │   │   │   ├── nBack.js
│   │   │   │   ├── patternRecall.js
│   │   │   │   ├── reactionTime.js
│   │   │   │   ├── stroopTest.js
│   │   │   │   ├── symbolMatch.js
│   │   │   │   └── utils.js
│   │   │   └── game-algo-readme/    # Game algorithm documentation
│   │   │       ├── clock-drawing.md
│   │   │       ├── color-sequence.md
│   │   │       ├── digit-span.md
│   │   │       ├── memory-match.md
│   │   │       ├── n-back.md
│   │   │       ├── pattern-recall.md
│   │   │       ├── reaction-time.md
│   │   │       ├── README.md
│   │   │       ├── risk-assessment.md
│   │   │       ├── stroop-test.md
│   │   │       ├── symbol-match.md
│   │   │       └── text-recall.md
│   │   ├── AboutMaitri.jsx         # About page
│   │   ├── Admin.jsx               # Admin dashboard
│   │   ├── AdminLogin.jsx         # Admin login page
│   │   ├── CookieTest.jsx         # Cookie testing utility
│   │   ├── Dashboard.jsx          # User dashboard
│   │   ├── DOC.css                 # Doctor form styles
│   │   ├── DOC.jsx                 # Doctor/Healthcare professional form
│   │   ├── DOCHDashboard.jsx      # Healthcare professional dashboard
│   │   ├── DOCTDashboard.jsx      # Therapist dashboard
│   │   ├── game.jsx                # Game selection page
│   │   ├── Home.jsx                # Home page
│   │   ├── LearnOurMission.jsx     # Mission page
│   │   ├── MyAppointments.jsx      # Appointments page
│   │   ├── Splash.jsx              # Splash screen
│   │   ├── TalkToCounselor.jsx     # Counselor booking page
│   │   └── WhatIsDementia.jsx      # Dementia information page
│   ├── public/                      # Static public assets
│   │   ├── videos/                 # Video files
│   │   │   ├── splash.MP4
│   │   │   └── splashd.MP4
│   │   ├── _redirects              # Netlify redirects
│   │   └── vite.svg                # Vite logo
│   ├── src/                         # Source files
│   │   ├── audio/                  # Audio files
│   │   │   ├── empty.mp3
│   │   │   ├── start.mp3
│   │   │   └── tick.mp3
│   │   ├── i18n/                   # Internationalization files
│   │   │   ├── as.js               # Assamese translations
│   │   │   ├── en.js               # English translations
│   │   │   └── hi.js               # Hindi translations
│   │   ├── images/                 # Image assets
│   │   │   ├── bg.jpg
│   │   │   ├── home.jpg
│   │   │   ├── logo.png
│   │   │   ├── pic1.png
│   │   │   ├── pic2.png
│   │   │   └── pic3.png
│   │   ├── App.css                 # Main app styles
│   │   ├── App.jsx                 # Root app component
│   │   ├── i18n.js                 # i18n configuration
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # Application entry point
│   ├── utils/                       # Frontend utilities
│   │   ├── axiosClient.js          # Axios HTTP client config
│   │   ├── downloadReport.js       # Report download utility
│   │   └── session.js              # Session management
│   ├── dist/                        # Production build output
│   ├── copy-static.js              # Static file copy script
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── static.json                 # Static site configuration
│   └── vite.config.js             # Vite configuration
│
├── package.json                     # Root package.json (workspace config)
├── README.md                        # This file
└── render.yaml                      # Render.com deployment configuration
```

### Key Directories Explained

#### Backend Structure
- **`config/`**: Configuration files for database, authentication, and external services
- **`controllers/`**: Business logic handlers for API endpoints
- **`middleware/`**: Express middleware for authentication, validation, error handling
- **`models/`**: Mongoose schemas defining database structure
- **`routes/`**: API route definitions mapping URLs to controllers
- **`utils/`**: Helper functions for normalization, mapping, logging, etc.

#### Frontend Structure
- **`components/`**: Reusable React components used across pages
- **`pages/`**: Main page components and game implementations
- **`game-components/`**: Cognitive assessment game implementations
- **`game-algo-js/`**: Core game algorithms and scoring logic
- **`css/`**: Organized stylesheets by component and page
- **`src/`**: Core application files, i18n translations, assets
- **`utils/`**: Frontend utility functions for API calls, downloads, sessions

#### Game Components
Each cognitive game has:
- **Component file** (`.jsx`): React component with UI and game flow
- **Algorithm file** (`.js`): Core game logic, scoring, and validation
- **Documentation** (`.md`): Algorithm explanation and methodology

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm 8 or higher
- Google OAuth credentials
- Google Gemini API key

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd maitri
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, frontend, backend)
npm run install:all
```

### Step 3: Environment Configuration

#### Backend Environment Variables
Create `backend/.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maitri
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-session-secret-key
ADMIN_PASSWORD=your-admin-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEYS=your-gemini-api-key-1,your-gemini-api-key-2
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

#### Frontend Environment Variables
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_CLIENT_URL=http://localhost:5173
```

### Step 4: Start Development Servers
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend  # Backend on http://localhost:5000
```

### Step 5: Build for Production
```bash
# Build frontend
npm run build

# Start production servers
npm run start:backend
npm run start:frontend
```

## API Routes & Controllers

### Authentication Routes (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/logout` - User logout
- `GET /api/auth/session-check` - Check current session
- `POST /api/auth/admin-login` - Admin login

**Controller**: `authController.js`

### Dashboard Routes (`/api/dashboard`)
- `GET /api/dashboard` - Get user dashboard data
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/games` - Get game progress

**Controller**: `dashboardController.js`

### Dementia/Cognitive Assessment Routes (`/api/dementia`)
- `POST /api/dementia/game-results` - Submit game results
- `GET /api/dementia/assessment` - Get risk assessment
- `GET /api/dementia/history` - Get assessment history

**Controller**: `dementiaController.js`

### Chatbot Routes (`/api/chatbot`)
- `GET /api/chatbot` - Get conversation history
- `POST /api/chatbot` - Send message to AI chatbot
- `DELETE /api/chatbot` - Clear conversation history

**Controller**: `chatbotController.js`

### Therapist Routes (`/api/therapist`)
- `POST /api/therapist/register` - Register as therapist
- `GET /api/therapist/profile` - Get therapist profile
- `PUT /api/therapist/profile` - Update therapist profile
- `GET /api/therapist/appointments` - Get therapist appointments
- `POST /api/therapist/availability` - Set availability
- `PUT /api/therapist/availability/:id` - Update availability

**Controller**: `therapistController.js`

### Therapist Admin Routes (`/api/doct`)
- `GET /api/doct/applications` - Get all therapist applications
- `POST /api/doct/:id/accept` - Accept therapist application
- `POST /api/doct/:id/reject` - Reject therapist application
- `DELETE /api/doct/:id` - Delete therapist application
- `PUT /api/doct/:id/status` - Update application status

**Controller**: `therapistController.js` (admin methods)

### Healthcare Professional Routes (`/api/healthcare`)
- `POST /api/healthcare/register` - Register as healthcare professional
- `GET /api/healthcare/profile` - Get healthcare professional profile
- `PUT /api/healthcare/profile` - Update profile
- `GET /api/healthcare/appointments` - Get appointments

**Controller**: `healthcareProfessionalController.js`

### Healthcare Professional Admin Routes (`/api/doch`)
- `GET /api/doch/applications` - Get all healthcare professional applications
- `POST /api/doch/:id/accept` - Accept application
- `POST /api/doch/:id/reject` - Reject application
- `DELETE /api/doch/:id` - Delete application
- `PUT /api/doch/appointments/:id/status` - Update appointment status

**Controller**: `healthcareProfessionalController.js` (admin methods)

### Report Routes (`/api/reports`)
- `GET /api/reports/generate` - Generate assessment report
- `GET /api/reports/pdf/:id` - Download PDF report
- `GET /api/reports/csv/:id` - Download CSV report
- `GET /api/reports/json/:id` - Download JSON report

**Controller**: `reportController.js`

### Upload Routes (`/api/upload`)
- `POST /api/upload/profile-photo` - Upload profile photo
- `POST /api/upload/certificate` - Upload certificate
- `DELETE /api/upload/:id` - Delete uploaded file

### Notification Routes (`/api/notifications`)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Language Routes (`/api/language`)
- `GET /api/language` - Get available languages
- `POST /api/language/set` - Set user language preference

### Health Routes (`/api/health`)
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe
- `GET /api/health/metrics` - Application metrics

## Game Algorithms

### Cognitive Domain Mapping
Games are mapped to cognitive domains:
- **Memory**: Memory Match, Pattern Recall, Color Sequence
- **Language**: Stroop Test
- **Attention**: Digit Span, Reaction Time, N-Back
- **Orientation**: Clock Drawing
- **Executive Function**: Stroop Test, N-Back, Clock Drawing

### Age-Based Normalization
Scores are normalized based on age groups:
- **10-15**: Baseline (1.0x multiplier)
- **15-20**: 0.95x multiplier
- **20-30**: 1.0x multiplier (baseline)
- **30-40**: 0.98x multiplier
- **40-50**: 0.95x multiplier
- **50-60**: 0.90x multiplier
- **60-70**: 0.85x multiplier
- **70-80**: 0.80x multiplier
- **80-90**: 0.75x multiplier

### Risk Assessment Algorithm
1. **Game Score Collection**: Collect scores from all completed games
2. **Domain Mapping**: Map games to cognitive domains
3. **Age Normalization**: Apply age-based multipliers
4. **Domain Scoring**: Calculate weighted domain scores
5. **Risk Calculation**: Compute overall risk score (0-100)
6. **Interpretation**: Categorize risk level (Low, Moderate, High)

### Game-Specific Algorithms
Each game has its own algorithm file in `frontend/pages/game-components/game-algo-js/`:
- `digitSpan.js`: Digit sequence generation and scoring
- `memoryMatch.js`: Grid generation and match detection
- `patternRecall.js`: Color sequence generation and validation
- `reactionTime.js`: Reaction time measurement and scoring
- `stroopTest.js`: Stroop effect calculation
- `nBack.js`: N-back difficulty progression
- `clockDrawing.js`: Clock drawing analysis
- `colorSequence.js`: Color sequence memory
- `matchingCards.js`: Card matching logic
- `symbolMatch.js`: Symbol recognition
- `ageNormalization.js`: Age-based score adjustment

## Security Features

### Authentication & Authorization
- **Google OAuth 2.0**: Secure third-party authentication
- **JWT Tokens**: Stateless authentication tokens
- **Session Management**: Server-side session storage
- **Password Hashing**: Secure password storage
- **Admin Authentication**: Separate admin login system

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Admin Endpoints**: 10 requests per 15 minutes
- **Chatbot/API**: 20 requests per minute
- **Reminders**: 10 requests per 5 minutes

### Security Headers
- **Content Security Policy (CSP)**: XSS protection
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing prevention
- **X-XSS-Protection**: Additional XSS protection
- **Strict-Transport-Security**: HTTPS enforcement

### Input Validation
- **Joi Schema Validation**: Request body validation
- **Express-Validator**: Additional validation middleware
- **XSS Sanitization**: Input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Validation**: File type and size validation

### Data Protection
- **Environment Variables**: Sensitive data in .env
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **CORS Configuration**: Restricted cross-origin requests
- **Helmet.js**: Security headers middleware

## Internationalization

### Supported Languages
- **English (en)**: Default language
- **Hindi (hi)**: हिंदी
- **Assamese (as)**: অসমীয়া

### Implementation
- **i18next**: Internationalization framework
- **react-i18next**: React integration
- **Dynamic Language Switching**: Change language without page reload
- **Localized Content**: All UI text translated
- **Number & Date Formatting**: Locale-specific formatting

### Translation Files
Located in `frontend/src/i18n/`:
- `en.js`: English translations
- `hi.js`: Hindi translations
- `as.js`: Assamese translations

## Database Models

### User Model
- `_id`: Unique identifier
- `email`: User email (unique)
- `name`: User full name
- `profilePhoto`: Profile photo URL
- `language`: Preferred language
- `createdAt`: Account creation date
- `updatedAt`: Last update date

### Therapist Model
- `_id`: Unique identifier
- `userId`: Reference to User
- `name`: Therapist name
- `email`: Contact email
- `specializations`: Array of specializations
- `qualifications`: Array of qualifications
- `experience`: Years of experience
- `profilePhoto`: Profile photo URL
- `availability`: Availability schedule
- `status`: Application status (pending, accepted, rejected)
- `certificates`: Array of certificate URLs
- `createdAt`: Application date

### Healthcare Professional Model
- `_id`: Unique identifier
- `userId`: Reference to User
- `fullName`: Professional name
- `email`: Contact email
- `roleCategories`: Array of role categories
- `specialization`: Primary specialization
- `qualifications`: Array of qualifications
- `experience`: Years of experience
- `profilePhoto`: Profile photo URL
- `status`: Application status
- `createdAt`: Application date

### Appointment Model
- `_id`: Unique identifier
- `userId`: Reference to User
- `therapistId`: Reference to Therapist (optional)
- `healthcareProfessionalId`: Reference to Healthcare Professional (optional)
- `date`: Appointment date
- `time`: Appointment time
- `status`: Appointment status (pending, confirmed, completed, cancelled)
- `notes`: Additional notes
- `createdAt`: Booking date

### Game Result Model
- `_id`: Unique identifier
- `userId`: Reference to User
- `gameKey`: Game identifier
- `score`: Game score
- `time`: Time taken (seconds)
- `difficulty`: Difficulty level
- `ageGroup`: User age group
- `detail`: Additional game details
- `timestamp`: Completion timestamp

### Assessment Model
- `_id`: Unique identifier
- `userId`: Reference to User
- `riskScore`: Calculated risk score (0-100)
- `cognitiveDomains`: Domain scores
- `ageGroup`: User age group
- `gameResults`: Array of game results
- `timestamp`: Assessment date

## Deployment

### Environment Setup
1. Set all required environment variables
2. Configure MongoDB connection
3. Set up Google OAuth credentials
4. Configure Gemini API keys
5. Set up email service (SMTP)

### Build Process
```bash
# Install dependencies
npm run install:all

# Build frontend
npm run build

# Start production server
npm run start:backend
```

### Production Considerations
- **Environment Variables**: All secrets in environment variables
- **Database**: Use MongoDB Atlas or managed MongoDB
- **Session Store**: MongoDB session store for scalability
- **Logging**: Winston with file rotation
- **Error Handling**: Comprehensive error handling
- **Health Checks**: Health endpoints for monitoring
- **Rate Limiting**: Production rate limits configured
- **CORS**: Configured for production domain
- **HTTPS**: SSL/TLS certificates required

### Monitoring
- **Health Endpoints**: `/api/health` for monitoring
- **Logging**: Winston logs to files
- **Error Tracking**: Error logs separated
- **Metrics**: Application metrics endpoint

## Environment Variables

### Backend Required Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `CLIENT_URL`: Frontend URL
- `SESSION_SECRET`: Session encryption secret
- `ADMIN_PASSWORD`: Admin login password
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GEMINI_API_KEYS`: Comma-separated Gemini API keys
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password

### Frontend Required Variables
- `VITE_API_URL`: Backend API URL
- `VITE_CLIENT_URL`: Frontend URL

## Testing

### Manual Testing
- Test all game components
- Verify authentication flow
- Test appointment booking
- Validate report generation
- Check mobile responsiveness
- Test multi-language support

### API Testing
- Use Postman or similar tool
- Test all endpoints
- Verify authentication
- Check rate limiting
- Validate error responses

## Additional Resources

### Game Documentation
Detailed game algorithm documentation available in:
`frontend/pages/game-components/game-algo-readme/`

### API Documentation
- Authentication endpoints
- Game result submission
- Appointment management
- Report generation

### Cognitive Assessment
- Age-based normalization
- Domain mapping algorithms
- Risk assessment methodology
- Score interpretation guidelines

## Key Features Summary

1. **10 Cognitive Games**: Comprehensive assessment suite
2. **Age-Based Scoring**: Normalized for age groups
3. **Risk Assessment**: AI-powered risk calculation
4. **Therapist Booking**: Complete appointment system
5. **AI Chatbot**: Mental health support
6. **Multi-language**: 3 languages supported
7. **Mobile Responsive**: Full mobile optimization
8. **Report Generation**: PDF, CSV, JSON exports
9. **Progress Tracking**: Historical performance
10. **Admin Dashboard**: Application management

## Development Workflow

1. **Feature Development**: Create feature branch
2. **Local Testing**: Test on local environment
3. **Code Review**: Review before merge
4. **Build Verification**: Ensure build succeeds
5. **Deployment**: Deploy to production

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Maitri** - Empowering mental health through technology and compassion.
