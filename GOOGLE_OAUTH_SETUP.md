# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for the Raki application.

## Prerequisites

- A Google Cloud Platform account
- Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "Raki Authentication")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Raki"
     - User support email: Your email
     - Developer contact information: Your email
   - Add your domain to authorized domains
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)

4. For the OAuth client:
   - Application type: "Web application"
   - Name: "Raki Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)

5. Click "Create" and copy the Client ID

## Step 4: Configure Environment Variables

### Backend Configuration

Create or update your `.env.local` file in the `projects/llm_backend/` directory:

```env
# Google OAuth Configuration
# Only CLIENT_ID is needed for ID token verification (more secure)
GOOGLE_CLIENT_ID=your-google-client-id-here
# GOOGLE_CLIENT_SECRET is NOT needed for ID token flow
```

### Frontend Configuration

Create or update your `.env.local` file in the `projects/frontend/` directory:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Step 5: Install Dependencies

The Google OAuth implementation uses the Google Identity Services library which is loaded via CDN, so no additional npm packages are required.

## Why Both Frontend and Backend Need the Client ID

### **Frontend Usage (NEXT_PUBLIC_GOOGLE_CLIENT_ID)**
- **Purpose**: Initialize Google Identity Services and render the sign-in button
- **Security**: Safe to expose publicly (it's in the URL anyway)
- **Usage**: Google's JavaScript library needs this to start the OAuth flow

### **Backend Usage (GOOGLE_CLIENT_ID)**
- **Purpose**: Verify that ID tokens were issued for your application
- **Security**: Should be kept private (not exposed to frontend)
- **Usage**: Validates the `aud` (audience) claim in the ID token

### **Why No Client Secret?**
This implementation uses **ID tokens** instead of **access tokens**:
- **ID Token**: Self-contained JWT that can be verified without a secret
- **Access Token**: Requires client secret to call Google APIs
- **More Secure**: ID tokens are designed for authentication, access tokens for authorization

## Step 6: Test the Configuration

1. Start the backend server:
   ```bash
   cd projects/llm_backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend server:
   ```bash
   cd projects/frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/auth`
4. You should see a Google sign-in button instead of the "not configured" message
5. Click the Google button to test the authentication flow

## Troubleshooting

### Common Issues

1. **"Google authentication is not configured" message**
   - Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in your frontend `.env.local`
   - Make sure the environment variable is prefixed with `NEXT_PUBLIC_`

2. **"Invalid client" error**
   - Verify the Client ID is correct
   - Check that the authorized JavaScript origins include your domain
   - Ensure the OAuth consent screen is properly configured

3. **"Access blocked" error**
   - Make sure your domain is added to authorized domains in the OAuth consent screen
   - For development, add `localhost:3000` to authorized domains
   - Check that the app is not in "Testing" mode with restricted users

4. **Backend authentication fails**
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the backend `.env.local`
   - Check that the backend can reach Google's OAuth endpoints

### Development vs Production

- **Development**: Use `http://localhost:3000` and `http://localhost:8000`
- **Production**: Update the authorized origins and redirect URIs to your production domains
- **Testing**: Add test users in the OAuth consent screen for development

## Security Notes

- Never commit your `.env.local` files to version control
- Use different Client IDs for development and production
- Regularly rotate your Client Secret
- Monitor your OAuth usage in the Google Cloud Console

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Google Cloud Console](https://console.cloud.google.com/)
