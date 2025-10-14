# Maitri Backend API

A production-ready Node.js backend API for the Maitri Mental Health Platform, built with Express.js, MongoDB, and comprehensive security features.

## Features

- 🔐 **Authentication & Authorization**: Google OAuth, JWT tokens, session management
- 🛡️ **Security**: Helmet, CORS, rate limiting, input validation, XSS protection
- 📊 **Logging**: Winston with daily rotation, structured logging
- 🏥 **Health Monitoring**: Comprehensive health checks and metrics
- 🌐 **Internationalization**: Multi-language support (English, Hindi, Assamese)
- 📧 **Email System**: Reminder notifications with Nodemailer
- 🤖 **AI Integration**: Google Gemini AI for chatbot functionality
- 📈 **Performance**: Compression, connection pooling, caching
- 🐳 **Docker Support**: Production-ready containerization
- 🔄 **Graceful Shutdown**: Proper signal handling and cleanup

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js, Google OAuth 2.0
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston with daily-rotate-file
- **Validation**: Joi, express-validator
- **Email**: Nodemailer
- **AI**: Google Generative AI
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maitri/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Build Docker image**
   ```bash
   docker build -t maitri-backend .
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `development` |
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `CLIENT_URL` | Frontend URL | Yes | - |
| `SESSION_SECRET` | Session secret key | Yes | - |
| `ADMIN_PASSWORD` | Admin password | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | - |
| `GEMINI_API_KEYS` | Comma-separated API keys | Yes | - |

See `env.example` for complete configuration.

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth
- `GET /auth/logout` - User logout
- `GET /auth/session-check` - Check session
- `POST /auth/admin-login` - Admin login

### API Routes
- `GET /api/dashboard` - Dashboard data
- `POST /api/chatbot` - Chat with AI
- `GET /api/reminders` - Get reminders
- `POST /api/reminders` - Create reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health info
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - Application metrics

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Admin endpoints**: 10 requests per 15 minutes
- **Chat/API**: 20 requests per minute
- **Reminders**: 10 requests per 5 minutes

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict-Transport-Security (HTTPS)

### Input Validation
- Joi schema validation
- Express-validator middleware
- XSS protection and sanitization
- SQL injection prevention

## Logging

### Log Levels
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `http`: HTTP request logs
- `debug`: Debug information

### Log Files
- `logs/error-YYYY-MM-DD.log` - Error logs
- `logs/combined-YYYY-MM-DD.log` - All logs
- Console output with colors

### Log Rotation
- Daily rotation
- Maximum file size: 20MB
- Retention: 14 days

## Health Monitoring

### Health Check Endpoints
- **Basic**: `/health` - Quick health status
- **Detailed**: `/health/detailed` - Comprehensive system info
- **Readiness**: `/health/ready` - Kubernetes readiness probe
- **Liveness**: `/health/live` - Kubernetes liveness probe

### Metrics Collected
- System uptime
- Memory usage
- Database connection status
- Request response times
- Error rates

## Database

### Connection
- Connection pooling (10-20 connections)
- Automatic reconnection
- SSL support for production
- Health monitoring

### Models
- **User**: Authentication and profile data
- **Reminder**: Scheduled notifications
- **Metrics**: Mental health metrics
- **Screening**: Assessment results
- **Todo**: Task management
- **Therapist**: Professional applications

## Error Handling

### Global Error Handler
- Centralized error processing
- Structured error responses
- Request ID tracking
- Security-conscious error messages

### Error Types
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Rate limit errors (429)
- Server errors (500)

## Performance

### Optimizations
- Gzip compression
- Connection pooling
- Request caching
- Efficient database queries
- Memory management

### Monitoring
- Response time tracking
- Memory usage monitoring
- Database performance metrics
- Error rate tracking

## Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

### Code Quality
- ESLint configuration
- Prettier formatting
- Error handling patterns
- Security best practices


### Environment Setup
1. Configure environment variables
2. Set up MongoDB
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Configure monitoring

## Monitoring & Alerting

### Health Checks
- Application health monitoring
- Database connectivity checks
- External service availability
- Performance metrics

### Log Analysis
- Structured logging for easy parsing
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Security Considerations

### Data Protection
- Input validation and sanitization
- XSS and injection prevention
- Secure session management
- Password hashing with bcrypt

### Network Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- IP whitelisting (optional)

### Access Control
- Role-based access control
- Session management
- Admin privilege escalation
- Audit logging

## Troubleshooting

### Common Issues
1. **Database connection failed**
   - Check MongoDB URI
   - Verify network connectivity
   - Check authentication credentials

2. **Rate limit exceeded**
   - Check rate limit configuration
   - Implement exponential backoff
   - Consider increasing limits

3. **Session issues**
   - Verify session secret
   - Check cookie configuration
   - Ensure proper CORS setup

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Maitri Backend API** - Empowering mental health through technology.
