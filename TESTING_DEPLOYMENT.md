# Testing Configuration for Vercel Deployment

This guide explains how to configure Vercel to run tests before deployment, ensuring only tested code reaches production.

## 🎯 Overview

The UAE EOSB Calculator Backend is configured with multiple layers of testing before deployment:

1. **Local Development**: Tests run during development
2. **Pre-deployment**: Vercel runs tests before building
3. **CI/CD Pipeline**: GitHub Actions runs tests on every push
4. **Coverage Reporting**: Automatic test coverage reports

## 🚀 Configuration Methods

### Method 1: Vercel Build Command (Primary)

**File: `package.json`**

```json
{
  "scripts": {
    "vercel-build": "npm run lint && npm run test:ci && npm run build"
  }
}
```

**File: `vercel.json`**

```json
{
  "buildCommand": "npm run vercel-build",
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

**What happens:**

1. Vercel runs `npm run vercel-build`
2. TypeScript linting checks for errors
3. All 82 tests must pass (100% test coverage)
4. Only if tests pass, the build proceeds
5. Failed tests = **deployment cancelled**

### Method 2: GitHub Actions (Secondary)

**File: `.github/workflows/deploy.yml`**

The workflow includes:

- **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
- **Dependency Caching**: Faster builds with npm cache
- **Test Coverage**: Uploads coverage reports to Codecov
- **Conditional Deployment**: Only deploys if tests pass

**Required GitHub Secrets:**

```bash
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
```

## 🧪 Test Configuration Details

### Test Scripts Available

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Run with coverage report
npm run test:ci       # CI mode (no watch, coverage)
```

### Test Coverage Requirements

- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 100%
- **Statements**: 100%

**Total: 82 tests across 9 test suites**

### Test Environment Variables

**File: `.env.test`**

```bash
NODE_ENV=test
PORT=3001
LOG_LEVEL=debug
ENABLE_CONSOLE_LOGGING=false
```

## 🔧 Setting Up Vercel for Testing

### Option A: Vercel CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy with automatic testing
vercel --prod
```

### Option B: Git Integration

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**: Vercel automatically uses `vercel-build` script
3. **Set Environment Variables**: Configure production variables
4. **Auto-Deploy**: Pushes to main/master trigger deployment

### Option C: Manual Configuration

In Vercel Dashboard:

1. **Project Settings** → **General**
2. **Build & Development Settings**:
   - Build Command: `npm run vercel-build`
   - Output Directory: `public`
   - Install Command: `npm ci`

## 🎛️ Environment Variables for Testing

### Production Variables (Vercel Dashboard)

```bash
NODE_ENV=production
FRONTEND_URL=https://uae-gratuity-calculator.vercel.app
LOG_LEVEL=ERROR
ENABLE_CONSOLE_LOGGING=false
```

### Development Variables (Local)

```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
ENABLE_CONSOLE_LOGGING=true
```

## 🚨 Troubleshooting Test Failures

### Common Issues

1. **Environment Variables Missing**

   ```bash
   # Solution: Add to .env.test
   NODE_ENV=test
   ```

2. **CORS Test Failures**

   ```bash
   # Solution: Tests include proper Origin headers
   .set("Origin", "http://localhost:3000")
   ```

3. **TypeScript Errors**

   ```bash
   # Run linting to check
   npm run lint
   ```

4. **Memory Issues in CI**
   ```bash
   # Use CI-optimized test script
   npm run test:ci
   ```

### Debugging Failed Deployments

```bash
# Check build logs in Vercel dashboard
# Or run locally to reproduce:
npm run vercel-build

# Run specific test that failed
npm test -- --testNamePattern="specific test name"
```

## 📊 Monitoring Test Success

### Vercel Dashboard

- **Functions** → **View Function Logs**
- **Deployments** → **View Build Logs**
- Look for test results in build output

### GitHub Actions

- **Actions** tab in your repository
- View test results and coverage reports
- Failed tests prevent deployment

### Local Testing

```bash
# Run full test suite with coverage
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

## ✅ Verification Checklist

Before deployment, ensure:

- [ ] All 82 tests pass locally
- [ ] TypeScript compilation succeeds
- [ ] Coverage remains at 100%
- [ ] Environment variables configured
- [ ] Vercel build command configured
- [ ] GitHub Actions secrets set (if using)

## 🎉 Benefits of This Configuration

1. **Quality Assurance**: No broken code reaches production
2. **Automatic Testing**: Tests run on every deployment attempt
3. **Fast Feedback**: Failed tests stop deployment immediately
4. **Coverage Tracking**: Maintains 100% test coverage
5. **Multi-Environment**: Tests work locally and in CI/CD
6. **Zero Downtime**: Failed deployments don't affect production

---

**Your UAE EOSB Calculator Backend is now configured for robust, test-driven deployments!** 🚀
