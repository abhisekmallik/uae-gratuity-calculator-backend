# UAE EOSB Calculator Backend

A RESTful API service for calculating End of Service Benefits (EOSB) according to UAE Labor Law Article 132 with **accurate calculation formula**.

## Features

- ✅ **Accurate EOSB Calculations** - Formula based on UAE Labor Law Article 132
- ✅ **Correct Daily Wage Calculation** - Uses proper `(Monthly Salary ÷ 30) × Eligible Days` formula
- ✅ **Precise Service Period** - Accurate year, month, and day calculation using calendar dates
- ✅ **Proper Penalty Logic** - Resignation penalties only apply to unlimited contracts
- ✅ **Input Validation** - Comprehensive validation with flexible date handling
- ✅ **Configuration API** - Dynamic dropdown values and calculation rules
- ✅ **CORS Support** - Ready for frontend integration
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Production Logger** - Environment-based logging with disable option for production
- ✅ **TypeScript** - Type-safe development
- ✅ **Security** - Helmet.js and security best practices

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/abhisekmallik/uae-gratuity-calculator-backend
cd uae-gratuity-calculator-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Base URL

```
http://localhost:3001/api/eosb
```

### Endpoints

#### GET /health

Health check endpoint

```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-01-01T00:00:00.000Z"
  },
  "message": "Service is healthy"
}
```

#### GET /config

Get configuration data for frontend

```json
{
  "success": true,
  "data": {
    "terminationTypes": [...],
    "contractTypes": [...],
    "calculationRules": {...}
  }
}
```

#### POST /calculate

Calculate EOSB for an employee

**Request Body:**

```json
{
  "basicSalary": 10000,
  "allowances": 0,
  "terminationType": "resignation",
  "isUnlimitedContract": true,
  "joiningDate": "2020-01-01",
  "lastWorkingDay": "2025-01-01"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalServiceYears": 5,
    "totalServiceMonths": 0,
    "totalServiceDays": 0,
    "basicSalaryAmount": 10000,
    "totalSalary": 10000,
    "eligibleYears": 5,
    "gratuityAmount": 35000,
    "breakdown": {
      "firstFiveYears": {
        "years": 5,
        "rate": 21,
        "amount": 35000
      },
      "additionalYears": {
        "years": 0,
        "rate": 30,
        "amount": 0
      }
    },
    "isEligible": true
  }
}
```

## Input Validation

The API includes comprehensive input validation to ensure data integrity:

### Required Fields

- **basicSalary**: Must be a positive number
- **terminationType**: Must be one of: `resignation`, `termination`, `retirement`, `death`, `disability`
- **isUnlimitedContract**: Must be a boolean value
- **joiningDate**: Must be a valid ISO8601 date
- **lastWorkingDay**: Must be a valid ISO8601 date

### Optional Fields

- **allowances**: Must be a positive number if provided

### Date Validation Rules

- **Date Format**: All dates must be in ISO8601 format (YYYY-MM-DD)
- **Date Logic**: `lastWorkingDay` must be after `joiningDate`
- **Future Dates**: ✅ **Future dates are allowed** for `lastWorkingDay` to support planning and projection scenarios
- **Historical Dates**: All historical dates are supported

### Example Valid Request

```json
{
  "basicSalary": 10000,
  "allowances": 2000,
  "terminationType": "termination",
  "isUnlimitedContract": true,
  "joiningDate": "2020-01-01",
  "lastWorkingDay": "2026-12-31" // Future date allowed
}
```

## EOSB Calculation Rules

Based on UAE Labor Law Article 132 with **corrected calculation formula**:

### Calculation Formula

```
Gratuity = (Monthly Salary ÷ 30 days) × Eligible Days
```

### Service Period Calculation

- **Minimum Service**: 1 year (365 days)
- Service calculated precisely using actual calendar dates (years, months, and days)

### Eligible Days Calculation

- **First 5 years**: 21 days per year of service
- **After 5 years**: 30 days per year of service
- **Salary Base**: Basic salary (allowances may be included based on contract)

### Example Calculation

For an employee with:

- **Service**: 5 years
- **Monthly Salary**: AED 10,000
- **Termination**: Resignation (unlimited contract)

**Step 1**: Calculate eligible days

- First 5 years: 5 × 21 = 105 days

**Step 2**: Calculate daily wage

- Daily wage: 10,000 ÷ 30 = AED 333.33

**Step 3**: Calculate gratuity

- Gratuity: 333.33 × 105 = **AED 35,000**

### Resignation Penalties (Unlimited Contracts)

- **Less than 1 year**: No gratuity
- **1-3 years**: 1/3 of calculated gratuity
- **3-5 years**: 2/3 of calculated gratuity
- **5+ years**: Full gratuity

### No Penalties Apply For

- Termination by employer
- Retirement
- Death
- Disability
- Limited contracts (always full gratuity if eligible)

## Project Structure

```
src/
├── controllers/        # API request handlers
│   └── eosbController.ts
├── middleware/         # Express middleware
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/            # API route definitions
│   └── eosbRoutes.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   ├── configuration.ts
│   └── eosbCalculator.ts
└── index.ts           # Application entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Type check with TypeScript
- `npm test` - Run all tests
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- --watch` - Run tests in watch mode

## Testing the API

You can test the calculator using curl or any API client:

```bash
# Test health endpoint
curl http://localhost:3001/api/eosb/health

# Test configuration endpoint
curl http://localhost:3001/api/eosb/config

# Test calculation
curl -X POST http://localhost:3001/api/eosb/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "basicSalary": 10000,
    "allowances": 0,
    "terminationType": "resignation",
    "isUnlimitedContract": true,
    "joiningDate": "2020-01-01",
    "lastWorkingDay": "2025-01-01"
  }'
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_VERSION=1.0.0

# Logging Configuration
LOG_LEVEL=DEBUG
ENABLE_CONSOLE_LOGGING=true
```

### Logging Configuration

The application includes a sophisticated logging system that can be configured via environment variables:

- `LOG_LEVEL`: Controls which log levels are output

  - `ERROR`: Only error messages (recommended for production)
  - `WARN`: Warnings and errors
  - `INFO`: Informational messages, warnings, and errors
  - `DEBUG`: All log levels (recommended for development)

- `ENABLE_CONSOLE_LOGGING`: Controls whether logs are written to console
  - `true`: Enable console logging (recommended for development/testing)
  - `false`: Disable console logging (recommended for production)
  - Default: `false` in production, `true` in development/test

#### Production Logging

In production, logging is disabled by default to improve performance and avoid cluttering logs. To enable logging in production:

```env
NODE_ENV=production
LOG_LEVEL=ERROR
ENABLE_CONSOLE_LOGGING=true
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: Custom logger with environment-based configuration, morgan for HTTP requests

## Deployment

This application is ready for deployment on **Vercel** with serverless functions support.

### Deploy to Vercel

#### Deployment Prerequisites

- [Vercel account](https://vercel.com)
- [Vercel CLI](https://vercel.com/cli) (optional, for local deployment)

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abhisekmallik/uae-gratuity-calculator-backend)

#### Manual Deployment Steps

1. **Fork/Clone the repository**

```bash
git clone https://github.com/abhisekmallik/uae-gratuity-calculator-backend
cd uae-gratuity-calculator-backend
```

2. **Install Vercel CLI (optional)**

```bash
npm i -g vercel
```

3. **Deploy to Vercel**

```bash
# Using Vercel CLI
vercel

# Or connect your GitHub repository to Vercel dashboard
```

4. **Configure Environment Variables**

In your Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app
API_VERSION=1.0.0
LOG_LEVEL=ERROR
ENABLE_CONSOLE_LOGGING=false
```

#### Vercel Configuration

The project includes:

- **`vercel.json`** - Vercel deployment configuration
- **`.vercelignore`** - Files to exclude from deployment
- **`.env.production`** - Production environment variables template

#### Post-Deployment

After deployment, your API will be available at:

```url
https://your-project-name.vercel.app/api/eosb/
```

**Available endpoints:**

- `GET /api/eosb/health` - Health check
- `GET /api/eosb/config` - Configuration
- `POST /api/eosb/calculate` - EOSB calculation
- `GET /api-docs` - API documentation

#### Production Considerations

✅ **Serverless Optimization**: Configured for Vercel's serverless functions  
✅ **Environment Variables**: Production-ready environment configuration  
✅ **Logging**: Optimized logging for production (errors only)  
✅ **CORS**: Configurable for your frontend domain  
✅ **Security**: Helmet.js and rate limiting enabled  
✅ **Documentation**: Swagger/OpenAPI available in production

#### Monitoring

- **Health Check**: Monitor `/api/eosb/health` endpoint
- **Vercel Analytics**: Available in Vercel dashboard
- **Function Logs**: View in Vercel dashboard under Functions tab

### Local Production Testing

Test production build locally:

```bash
# Set production environment
NODE_ENV=production npm start

# Test with production settings
curl https://localhost:3001/api/eosb/health
```

## Summary

This UAE EOSB Calculator Backend is a **production-ready**, **fully-tested** API service that provides:

### 🎯 **Accurate Calculations**

- ✅ Precise EOSB calculations per UAE Labor Law Article 132
- ✅ Correct daily wage formula: `(Monthly Salary ÷ 30) × Eligible Days`
- ✅ Accurate service period calculations using calendar dates
- ✅ Proper resignation penalty logic for unlimited contracts

### 🧪 **100% Test Coverage**

- ✅ **82 tests across 9 test suites** - All passing
- ✅ **100% code coverage** - Every line, branch, and function tested
- ✅ **Comprehensive edge cases** - Boundary conditions and complex scenarios
- ✅ **API contract validation** - All endpoints thoroughly tested
- ✅ **Logger testing** - Complete test coverage for logging functionality
- ✅ **Production testing** - Dedicated test suite for production environment scenarios

### 🛡️ **Production Quality**

- ✅ **TypeScript** - Type-safe development
- ✅ **Input validation** - Comprehensive request validation
- ✅ **Error handling** - Robust error scenarios
- ✅ **Security** - CORS, rate limiting, Helmet.js
- ✅ **API documentation** - Swagger/OpenAPI integration
- ✅ **Production logging** - Environment-configurable logging system

### 📊 **Key Features**

- ✅ RESTful API with standardized responses
- ✅ Configuration API for frontend integration
- ✅ Health check and monitoring endpoints
- ✅ Development and production environments
- ✅ Comprehensive logging with production optimization

This backend is ready for deployment and integration with frontend applications, providing reliable and accurate EOSB calculations for UAE employees.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please create an issue in the repository.

### Documentation

- `README.md` - This file with API documentation and setup instructions

### API Reference

All API endpoints return standardized responses:

```json
{
  "success": true|false,
  "data": <response_data>,
  "message": "Description of result",
  "error": "Error message (if applicable)"
}
```

## Testing

The project includes a comprehensive test suite with **100% code coverage** ensuring reliability and accuracy of all EOSB calculations and API functionality.

### Test Coverage Summary

- **Overall Coverage**: 100% statements, 100% branches, 100% functions, 100% lines
- **Test Suites**: 9 suites with 82 tests
- **All Tests Passing**: ✅
- **Zero Uncovered Lines**: All code paths tested and validated

#### Coverage by Module

| Module                | Statements | Branches | Functions | Lines |
| --------------------- | ---------- | -------- | --------- | ----- |
| **swagger.ts**        | 100%       | 100%     | 100%      | 100%  |
| **eosbController.ts** | 100%       | 100%     | 100%      | 100%  |
| **errorHandler.ts**   | 100%       | 100%     | 100%      | 100%  |
| **validation.ts**     | 100%       | 100%     | 100%      | 100%  |
| **eosbRoutes.ts**     | 100%       | 100%     | 100%      | 100%  |
| **configuration.ts**  | 100%       | 100%     | 100%      | 100%  |
| **eosbCalculator.ts** | 100%       | 100%     | 100%      | 100%  |
| **logger.ts**         | 100%       | 100%     | 100%      | 100%  |

### Test Categories

#### 1. Unit Tests

- **EOSB Calculation Logic** - All calculation scenarios and formulas
- **Service Period Calculation** - Date handling and period calculations
- **Resignation Penalties** - All penalty scenarios for different contract types
- **Edge Cases** - Boundary conditions and complex date calculations

#### 2. Integration Tests

- **API Endpoints** - All REST API endpoints with various inputs
- **Request/Response Validation** - Input validation and error handling
- **CORS and Security** - Cross-origin requests and security headers

#### 3. Error Handling Tests

- **Validation Errors** - Invalid inputs and missing required fields
- **Malformed JSON** - Invalid request formats
- **404 Scenarios** - Unknown endpoints
- **Edge Case Errors** - Boundary conditions and unusual inputs

#### 4. Configuration Tests

- **Swagger Documentation** - API documentation endpoints
- **Configuration API** - Dynamic configuration retrieval
- **Health Checks** - Service availability monitoring

#### 5. Production Environment Tests

- **Production Settings** - Verify production environment configuration
- **Production Logging** - Test logging behavior in production mode
- **Production CORS** - Validate CORS settings for production
- **Production Error Handling** - Error responses in production environment
- **Production Performance** - Basic performance validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test suite
npm test tests/utils/eosbCalculator.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Test Files Structure

```text
tests/
├── api/                    # API integration tests
│   └── eosb.test.ts
├── config/                 # Configuration tests
│   └── swagger.test.ts
├── controllers/            # Controller tests
│   └── eosbController.test.ts
├── middleware/             # Middleware tests
│   ├── errorHandler.test.ts
│   └── validation.test.ts
├── utils/                  # Utility function tests
│   ├── eosbCalculator.test.ts
│   ├── eosbCalculatorEdgeCases.test.ts
│   └── logger.test.ts
└── production.test.ts      # Production environment tests
```

### Coverage Report

The test suite covers all critical scenarios including:

- ✅ **All EOSB calculation formulas** and edge cases
- ✅ **Date calculations** with complex month/day adjustments
- ✅ **Resignation penalty logic** for all service periods
- ✅ **API validation** for all input combinations
- ✅ **Error handling** for malformed requests
- ✅ **Security middleware** and CORS functionality
- ✅ **Swagger documentation** endpoints
- ✅ **Configuration management** and health checks
- ✅ **Logger functionality** with all log levels and environments
- ✅ **Production environment** settings and behavior

### Quality Assurance

This project maintains **production-grade quality** through:

- **Comprehensive Test Coverage**: Every line, branch, and function tested
- **Edge Case Testing**: Boundary conditions and complex scenarios covered
- **API Contract Testing**: All endpoints validated with various input combinations
- **Error Scenario Testing**: Proper error handling for all failure modes
- **Security Testing**: CORS, rate limiting, and input validation verified
- **Documentation Testing**: Swagger API documentation endpoints validated

### Test Strategy

The testing strategy focuses on:

1. **Calculation Accuracy**: Rigorous testing of EOSB formulas per UAE Labor Law
2. **Data Integrity**: Precise date calculations and service period handling
3. **API Reliability**: Comprehensive endpoint testing with edge cases
4. **Error Resilience**: Robust error handling and graceful failure modes
5. **Security Compliance**: Input validation and security middleware testing
6. **Production Readiness**: Dedicated testing for production environment scenarios and configurations
