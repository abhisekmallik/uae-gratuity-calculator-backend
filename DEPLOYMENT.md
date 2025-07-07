# Vercel Deployment Guide

This guide will walk you through deploying the UAE EOSB Calculator Backend to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- GitHub repository with your code
- Node.js 18+ locally (for testing)

## Quick Deploy (Recommended)

### 1. One-Click Deploy

Click the deploy button to automatically set up the project:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abhisekmallik/uae-gratuity-calculator-backend)

### 2. Configure Environment Variables

After deployment, add these environment variables in your Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable                 | Value                              | Description                           |
| ------------------------ | ---------------------------------- | ------------------------------------- |
| `NODE_ENV`               | `production`                       | Set environment to production         |
| `PORT`                   | `3000`                             | Port for the application              |
| `FRONTEND_URL`           | `https://your-frontend-domain.com` | Your frontend URL for CORS            |
| `API_VERSION`            | `1.0.0`                            | API version                           |
| `LOG_LEVEL`              | `ERROR`                            | Logging level for production          |
| `ENABLE_CONSOLE_LOGGING` | `false`                            | Disable console logging in production |

### 3. Redeploy

After adding environment variables, trigger a new deployment:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Select **Use existing Build Cache** and click **Redeploy**

## Manual Deploy

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# From your project directory
vercel

# For production deployment
vercel --prod
```

## Automatic Deployments (CI/CD)

### GitHub Actions Setup

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployments.

#### Required Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:

| Secret         | How to get                                                             |
| -------------- | ---------------------------------------------------------------------- |
| `VERCEL_TOKEN` | [Generate in Vercel Settings](https://vercel.com/account/tokens)       |
| `ORG_ID`       | Found in project settings or `.vercel/project.json` after first deploy |
| `PROJECT_ID`   | Found in project settings or `.vercel/project.json` after first deploy |

#### Getting ORG_ID and PROJECT_ID

1. Deploy manually once using `vercel` command
2. Check the `.vercel/project.json` file created in your project:

```json
{
  "projectId": "your-project-id",
  "orgId": "your-org-id"
}
```

## Post-Deployment

### 1. Test Your API

After deployment, test your endpoints:

```bash
# Health check
curl https://your-project-name.vercel.app/api/eosb/health

# Configuration
curl https://your-project-name.vercel.app/api/eosb/config

# Documentation
open https://your-project-name.vercel.app/api-docs
```

### 2. Update Frontend CORS

Update your frontend application to use the new API URL:

```javascript
const API_BASE_URL = "https://your-project-name.vercel.app/api/eosb";
```

### 3. Monitor Your Application

- **Vercel Dashboard**: Monitor function invocations and performance
- **Analytics**: Enable Vercel Analytics for usage insights
- **Logs**: View function logs in the Vercel dashboard

## Troubleshooting

### Common Issues

#### 1. CORS Errors

Make sure `FRONTEND_URL` environment variable is set correctly:

```bash
# Check in Vercel dashboard under Environment Variables
FRONTEND_URL=https://your-frontend-domain.com
```

#### 2. Function Timeout

The default timeout is 30 seconds. If you need more, upgrade your Vercel plan.

#### 3. Environment Variables Not Applied

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Redeploy the latest deployment
3. Ensure you're not using cached build

#### 4. Build Errors

Check the deployment logs in Vercel dashboard:

1. Go to **Deployments** tab
2. Click on the failed deployment
3. View the build logs

### Debug Locally

Test with production settings locally:

```bash
# Set production environment
export NODE_ENV=production
export LOG_LEVEL=ERROR
export ENABLE_CONSOLE_LOGGING=false

# Run the app
npm start
```

## Security Considerations

### Production Environment Variables

Never commit sensitive information. Use Vercel's environment variables for:

- API keys
- Database URLs
- Secret tokens
- Third-party service credentials

### CORS Configuration

Ensure `FRONTEND_URL` is set to your actual frontend domain, not a wildcard (`*`) in production.

### Rate Limiting

The API includes rate limiting. Monitor usage in Vercel dashboard and adjust limits if needed.

## Performance Optimization

### Cold Starts

Vercel functions may experience cold starts. The API is optimized to minimize this impact:

- Lightweight dependencies
- Efficient imports
- Optimized function size

### Monitoring

Monitor your API performance:

- Function execution time
- Memory usage
- Error rates
- Request volume

Use Vercel Analytics and consider upgrading to Pro plan for better performance monitoring.

## Support

If you encounter issues:

1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test locally with production environment variables
4. Contact support or create an issue in the repository
