# Firestore Setup Guide for MPB-OMS Backend

This guide will help you set up Firestore for your TransJakarta Occupancy Management System backend.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A Firebase project
3. Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "mpb-oms")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 3: Create a Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "IAM & Admin" > "Service Accounts"
4. Click "Create Service Account"
5. Enter a name (e.g., "mpb-oms-backend")
6. Add a description (e.g., "Service account for MPB-OMS backend")
7. Click "Create and Continue"
8. For roles, add "Firebase Admin SDK Administrator Service Agent"
9. Click "Continue" and then "Done"

## Step 4: Generate Service Account Key

1. Find your newly created service account in the list
2. Click on the service account name
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. The JSON file will be downloaded automatically

## Step 5: Configure Environment Variables

1. Open your downloaded JSON file
2. Copy the following values to your `.env` file:

```env
# Firebase/Firestore Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

**Important Notes:**
- Replace `your-project-id` with your actual project ID
- The `FIREBASE_PRIVATE_KEY` should include the full private key with newlines escaped as `\n`
- Make sure to wrap the private key in quotes in your `.env` file

## Step 6: Install Dependencies

The required dependencies are already in your `package.json`:

```bash
npm install firebase-admin
```

## Step 7: Test the Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Check the console for Firestore initialization message:
   ```
   ✅ Firestore initialized successfully
   ```

3. Test the API endpoints:
   ```bash
   # Get all occupancy data
   curl http://localhost:3001/api/occupancy/now
   
   # Initialize dummy data
   curl -X POST http://localhost:3001/api/occupancy/init-dummy-data
   ```

## Step 8: Security Rules (Production)

For production, update your Firestore security rules:

1. Go to Firestore Database > Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Or for more specific rules:
    match /buses/{busId} {
      allow read, write: if request.auth != null;
    }
    
    match /occupancy/{busId} {
      allow read, write: if request.auth != null;
    }
    
    match /devices/{deviceId} {
      allow read, write: if request.auth != null;
    }
    
    match /occupancy_history/{historyId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Data Structure

Your Firestore database will have the following collections:

### `buses`
- Document ID: `busId`
- Fields: `busId`, `busCode`, `routeId`, `routeName`, `direction`, `platform`, `capacity`, `deviceId`, `providerName`, `category`, `createdAt`, `updatedAt`

### `occupancy`
- Document ID: `busId`
- Fields: `busId`, `occupancy`, `capacity`, `inCount`, `outCount`, `estimasi`, `deviceId`, `routeId`, `routeName`, `direction`, `platform`, `timestamp`, `createdAt`

### `devices`
- Document ID: `deviceId`
- Fields: `deviceId`, `busId`, `status`, `lastPing`, `createdAt`, `updatedAt`

### `occupancy_history`
- Document ID: Auto-generated
- Fields: `busId`, `occupancy`, `capacity`, `timestamp`, `deviceId`, `routeId`, `routeName`

## API Endpoints

The following endpoints are available for Firestore integration:

- `GET /api/occupancy/now` - Get current occupancy for all buses
- `GET /api/occupancy/:busId` - Get occupancy for a specific bus
- `GET /api/occupancy/:busId/history` - Get occupancy history for a bus
- `POST /api/occupancy/ingest` - Ingest new occupancy data
- `GET /api/occupancy/formatted` - Get formatted bus information
- `POST /api/occupancy/init-dummy-data` - Initialize dummy data

## Troubleshooting

### Common Issues

1. **"Firestore not initialized" error**
   - Check that your environment variables are correctly set
   - Verify the service account JSON file is valid

2. **Permission denied errors**
   - Ensure your service account has the correct roles
   - Check Firestore security rules

3. **Connection timeout**
   - Verify your internet connection
   - Check if your firewall allows outbound connections to Google Cloud

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=firebase:*
```

## Next Steps

1. **Monitor Usage**: Use the Firebase Console to monitor your database usage
2. **Set up Alerts**: Configure alerts for high usage or errors
3. **Backup Strategy**: Set up regular backups of your Firestore data
4. **Performance Tuning**: Monitor query performance and add indexes as needed

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
