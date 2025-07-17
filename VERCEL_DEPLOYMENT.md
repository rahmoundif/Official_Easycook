# EasyCook Vercel Deployment Guide

This document provides instructions for deploying the EasyCook application to Vercel with Supabase as the database.

## Prerequisites

- Vercel account
- Supabase account
- Node.js and npm installed on your machine
- Git repository (GitHub, GitLab, or Bitbucket)

## Setting up Supabase

1. Create a new project in Supabase
2. Copy the project URL and anon key from the API settings
3. Create the necessary tables in Supabase based on your database schema

## Deployment Steps

### 1. Deploy the Server

1. Login to Vercel CLI (optional, you can also deploy through the Vercel dashboard):
   ```bash
   npm i -g vercel
   vercel login
   ```

2. Navigate to the server directory and deploy:
   ```bash
   cd server
   vercel
   ```

3. Follow the prompts to connect to your Vercel project

4. Set up the following environment variables in the Vercel dashboard for your server project:
   - `JWT_SECRET`: Your JWT secret for authentication
   - `DB_HOST`: Your Supabase database host
   - `DB_PORT`: Usually 5432 for PostgreSQL
   - `DB_USER`: Database username (usually postgres for Supabase)
   - `DB_PASSWORD`: Your database password
   - `DB_NAME`: Database name (usually postgres for Supabase)
   - `CLIENT_URL`: The URL of your client deployment (add this after client is deployed)

### 2. Deploy the Client

1. Take note of your server deployment URL

2. Update the `.env.production` file in your client directory with the server URL:
   ```
   VITE_API_URL=https://your-server-deployment-url.vercel.app
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Navigate to the client directory and deploy:
   ```bash
   cd client
   vercel
   ```

4. Follow the prompts to connect to your Vercel project

5. Set up the following environment variables in the Vercel dashboard for your client project:
   - `VITE_API_URL`: Your server deployment URL
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Update CORS Configuration

1. Go back to your server project in the Vercel dashboard
2. Update the `CLIENT_URL` environment variable with your client deployment URL
3. Trigger a redeployment of your server

## Connecting Client to Server

Your client application is already configured to use the environment variable `VITE_API_URL` for API calls. Make sure this is set correctly in your Vercel deployment settings to point to your server URL.

Example of how your client code uses this variable:
```typescript
fetch(`${import.meta.env.VITE_API_URL}recipe/detail/${recipeId}`)
```

## Automatic Deployments

To enable automatic deployments when you push to your Git repository:

1. Connect your repository to Vercel through the dashboard
2. Configure the build settings for both client and server projects
3. Vercel will automatically deploy when you push changes to your repository

## Troubleshooting

- If your API calls are failing, check the CORS configuration on your server
- Verify that all environment variables are correctly set in the Vercel dashboard
- Check the logs in the Vercel dashboard for any build or runtime errors
