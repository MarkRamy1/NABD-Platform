# Google Calendar Integration Setup Guide

This guide explains how to set up Google Calendar API integration for the appointment booking feature.

## Features Implemented

✓ **Gmail-only Registration** - Users must use @gmail.com accounts to register
✓ **Appointment Booking** - Patients can book appointments at hospitals
✓ **Google Calendar Integration** - Appointments are automatically saved to user's Google Calendar
✓ **Appointment Management** - View, manage, and cancel appointments

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `NABD Hospital Platform`
5. Click "CREATE"
6. Wait for the project to be created

## Step 2: Enable Google Calendar API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and select **ENABLE**
4. You should see "API enabled" confirmation

## Step 3: Create OAuth 2.0 Credentials

### For Web Application:

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Click "CONFIGURE CONSENT SCREEN"
   - Select "External" user type
   - Click "CREATE"
   - Fill in the form:
     - **App name:** NABD Hospital Platform
     - **User support email:** your-email@gmail.com
     - **Developer contact:** your-email@gmail.com
   - Click "SAVE AND CONTINUE"
   - Skip optional fields and click "SAVE AND CONTINUE"
   - On the summary page, click "BACK TO DASHBOARD"

4. Go back to **Credentials** and click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Web application**
6. Under "Authorized JavaScript origins," add:
   ```
   http://localhost:3000
   http://localhost:8000
   http://127.0.0.1:3000
   http://127.0.0.1:8000
   https://yourdomain.com (your production domain)
   ```

7. Under "Authorized redirect URIs," add:
   ```
   http://localhost:3000/callback
   http://localhost:8000/callback
   http://127.0.0.1:3000/callback
   http://127.0.0.1:8000/callback
   https://yourdomain.com/callback (your production domain)
   ```

8. Click "CREATE"
9. Copy your **Client ID** - you'll need this

## Step 4: Update Configuration

1. Open `google-calendar-integration.js` in your editor
2. Replace these lines at the top:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
   const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
   ```

3. With your actual credentials from the Google Cloud Console:
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your OAuth 2.0 Client ID
   - For API Key: Go to **Credentials**, click **+ CREATE CREDENTIALS** > **API Key**, copy the key

## Step 5: Configure User Consent

When users first try to book an appointment and save to Google Calendar:
1. They will see a Google sign-in button
2. They must sign in with their Gmail account
3. They'll be asked to grant permission to access their Google Calendar
4. Once authorized, their appointments will be saved to their calendar automatically

## Usage Flow

### For Patients:

1. **Register:** Use your Gmail address (@gmail.com)
2. **Login:** Enter your Gmail and password
3. **Browse Hospitals:** Find and view hospital details
4. **Book Appointment:** Click "Book Appointment" button
5. **Fill Details:**
   - Select preferred date and time
   - Choose specialization
   - Enter doctor name (optional)
   - Add notes about your visit
   - Check "Save to Google Calendar" (optional)
6. **Confirm:** Click "Confirm Booking"
7. **View Appointments:** Click "My Appointments" in user menu to see all bookings

### Managing Appointments:

- View all your appointments in the "My Appointments" modal
- Cancel appointments with the "Cancel" button
- Appointments are saved locally and to Google Calendar

## Troubleshooting

### "Only Gmail accounts are allowed"
- Make sure you're registering with an email ending in @gmail.com
- Example: `john.doe@gmail.com` ✓
- Example: `john@company.com` ✗

### Google Calendar not syncing
1. Make sure you're signed in with the same Gmail account
2. Check browser console for errors (F12 > Console)
3. Verify Google Calendar API is enabled in Cloud Console
4. Check that your Client ID is correctly entered

### OAuth Consent Screen issues
- Make sure you've configured the consent screen for External users
- Add your email as a test user if in development

### CORS Errors
- Make sure your localhost URL is added to "Authorized JavaScript origins"
- For production, add your domain URL

## Security Notes

⚠️ **Important Security Considerations:**

1. **Client ID vs API Key:**
   - Store Client ID securely (it's less sensitive than an API key)
   - API Keys should have restrictions (Calendar API only)

2. **Production Deployment:**
   - Never commit actual credentials to version control
   - Use environment variables for credentials
   - Use a backend server to handle token refresh
   - Implement proper HTTPS

3. **Token Management:**
   - Tokens are stored in localStorage (not ideal for production)
   - Consider using httpOnly cookies instead
   - Implement token refresh logic

## Environment Variables (Recommended for Production)

Create a `.env` file:
```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-api-key-here
```

Then update `google-calendar-integration.js`:
```javascript
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
```

## API Quotas

Google Calendar API has quotas:
- Free tier: 1 million queries per day
- Batch insert: Up to 50 events per batch
- Rate limits: Be mindful of rate limiting

## Testing

### Test Gmail-Only Registration:
1. Try registering with non-Gmail email → should be rejected ✓
2. Register with @gmail.com → should succeed ✓

### Test Appointment Booking:
1. Book an appointment
2. Check your Google Calendar → event should appear ✓
3. View in "My Appointments" → should be listed ✓
4. Cancel appointment → should be removed ✓

## Support & Documentation

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)

## Files Modified

1. ✓ `index.html` - Added appointment modal and "My Appointments" menu
2. ✓ `script.js` - Added appointment booking functions
3. ✓ `google-calendar-integration.js` - NEW - Google Calendar integration
4. ✓ `style.css` - Added appointment card styles

## Next Steps

1. Set up Google Cloud Project following steps above
2. Get your Client ID and API Key
3. Update credentials in `google-calendar-integration.js`
4. Test the registration with Gmail accounts
5. Test appointment booking and Google Calendar sync
6. Deploy to production with environment variables
