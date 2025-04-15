# Deployment Guide for Project Manager

This guide will help you deploy the Project Manager application on [Render](https://render.com).

## Prerequisites

1. A Render account
2. A MongoDB Atlas account (or any MongoDB provider)
3. Your project code in a Git repository (GitHub, GitLab, etc.)

## MongoDB Setup

1. Create a MongoDB Atlas cluster:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in
   - Create a new project
   - Build a new cluster (you can use the free tier)
   - Create a database user with read/write privileges
   - Add your connection IP to the IP access list (or use 0.0.0.0/0 for development)
   - Get your connection string from the "Connect" button

2. Note your MongoDB connection string. It should look like this:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

## Environment Variables Setup

The application requires the following environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `NEXT_PUBLIC_API_URL`: The URL of your deployed application (used for client-side API calls)

## Deploying on Render

1. **Create a Web Service**:
   - Log in to your Render dashboard
   - Click the "New +" button and select "Web Service"
   - Connect your Git repository
   - Fill in the following details:
     - **Name**: project-manager (or your preferred name)
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (for testing) or select a paid plan for production

2. **Add Environment Variables**:
   - In the web service configuration, find the "Environment" section
   - Add the environment variables mentioned above
   - Example:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your_secure_random_string
     NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com
     ```

3. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Once deployment is complete, your app will be available at the provided URL

## Verifying Deployment

1. Visit your deployed application at the Render-provided URL
2. Test the authentication system by creating a new account
3. Verify that you can create projects and tasks

## Troubleshooting

If you encounter issues during deployment:

1. Check Render logs for any errors
2. Verify that all environment variables are correctly set
3. Ensure your MongoDB connection string is correct and the database is accessible
4. Check that your JWT_SECRET is properly configured

## Production Considerations

For a production deployment, consider:

1. Using a paid plan on Render for better performance and uptime
2. Setting up proper MongoDB backup and scaling plans
3. Configuring a custom domain with HTTPS
4. Implementing rate limiting and other security measures

## Updating Your Deployment

When you push changes to your repository, Render will automatically detect them and redeploy your application. You can also manually trigger a deployment from the Render dashboard.

## Monitoring and Maintenance

Render provides basic monitoring tools in the dashboard. For more advanced monitoring, consider using additional services like MongoDB Atlas monitoring or third-party application monitoring tools. 