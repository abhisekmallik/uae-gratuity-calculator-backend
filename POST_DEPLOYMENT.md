# Vercel Deployment Instructions

## Pre-deployment Testing Configuration

### Method 1: Vercel Build Command (Recommended)

The project is configured to run tests automatically before deployment using Vercel's build command:

```json
{
  "scripts": {
    "vercel-build": "npm run lint && npm run test:ci && npm run build"
  }
}
```

**How it works:**

1. Vercel runs `npm run vercel-build` during deployment
2. This command runs linting, then tests, then builds the project
3. If any step fails, deployment is cancelled
4. Only successful builds are deployed

### Method 2: GitHub Actions (Already Configured)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **Runs on every push/PR to main/master**
2. **Tests multiple Node.js versions** (18.x, 20.x)
3. **Runs linting and tests**
4. **Only deploys if tests pass**
5. **Uploads coverage reports**

**Required GitHub Secrets:**

- `VERCEL_TOKEN` - Your Vercel access token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

### Method 3: Vercel Git Integration

If using Vercel's Git integration:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically run the `vercel-build` command
3. Tests must pass for deployment to succeed

## After Deployment

1. **Update Swagger Server URL:**

   - Once deployed, update the production server URL in `src/config/swagger.ts`
   - Replace `https://uae-gratuity-calculator.vercel.app` with your actual Vercel URL

2. **Set Environment Variables in Vercel:**

   ```bash
   NODE_ENV=production
   FRONTEND_URL=https://uae-gratuity-calculator.vercel.app
   API_VERSION=1.0.0
   LOG_LEVEL=ERROR
   ENABLE_CONSOLE_LOGGING=false
   ```

   **For Testing (Optional):**

   ```bash
   # These are only needed if tests require specific environment variables
   NODE_ENV=test
   LOG_LEVEL=debug
   ENABLE_CONSOLE_LOGGING=true
   ```

3. **Test Your Deployment:**
   - Health Check: `https://uae-gratuity-calculator-backend.vercel.app/api/eosb/health`
   - API Docs: `https://uae-gratuity-calculator-backend.vercel.app/api-docs`
   - Configuration: `https://uae-gratuity-calculator-backend.vercel.app/api/eosb/config`

## Fixed Issues

✅ **CORS Configuration:** Updated to allow Swagger UI to work properly  
✅ **Swagger Setup:** Fixed CORS headers for API documentation  
✅ **Content Security Policy:** Helmet.js configured to allow Swagger UI assets from CDN  
✅ **Server URLs:** Template for updating production URLs  
✅ **TypeScript Compilation:** All type errors resolved  
✅ **CDN Assets:** Swagger UI loads from external CDN to avoid local asset issues

## API Documentation

Your Swagger UI will be available at: `https://uae-gratuity-calculator-backend.vercel.app/api-docs`

The API documentation will work properly with the updated CORS configuration.
