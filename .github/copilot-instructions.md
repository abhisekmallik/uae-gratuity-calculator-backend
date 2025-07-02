<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# UAE EOSB Calculator Backend - Copilot Instructions

This is the backend API for the UAE End of Service Benefits (EOSB) calculator application.

## Project Context

- **Purpose**: Calculate end-of-service benefits for UAE employees according to UAE Labor Law
- **Technology Stack**: Node.js, Express.js, TypeScript
- **Architecture**: RESTful API with modular structure

## Key Features

- EOSB calculation based on UAE Labor Law Article 132
- Configuration API for frontend dropdown values
- Input validation and error handling
- CORS support for frontend integration
- Rate limiting and security middleware

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Express.js best practices
- Implement proper error handling
- Use async/await for asynchronous operations
- Apply input validation for all endpoints

### API Endpoints

- `GET /api/eosb/health` - Health check
- `GET /api/eosb/config` - Get configuration data
- `POST /api/eosb/calculate` - Calculate EOSB

### Calculation Rules

- Minimum service: 1 year (365 days)
- First 5 years: 21 days salary per year
- After 5 years: 30 days salary per year
- Resignation penalties for unlimited contracts:
  - < 1 year: No gratuity
  - 1-3 years: 1/3 of calculated gratuity
  - 3-5 years: 2/3 of calculated gratuity
  - 5+ years: Full gratuity

### Testing

- Test all calculation scenarios
- Validate edge cases
- Test API endpoints with various inputs
- Ensure proper error responses

### Security

- Input validation on all endpoints
- Rate limiting applied
- CORS configuration for frontend
- Helmet.js for security headers
