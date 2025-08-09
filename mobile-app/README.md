# MPB OMS Mobile App

Mobile application for TransJakarta Bus Occupancy Management System.

## Features

1. **Authentication**: Simple login using email and password, connected to backend authentication system
2. **Main Menu**: Real-time bus route visualization with:
   - Live bus tracking across stops ("Halte")
   - Simulated bus movement every 3 seconds
   - Dynamic occupancy display (37/40 format)
   - Bus occupancy indicators with color coding
3. **Destination Selection**: 
   - Route planning interface
   - Popular destinations quick selection
   - Modal popup for route optimization suggestions
   - 5-second timeout for route optimization acceptance

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation (Windows)

1. Navigate to the mobile-app directory:
   ```cmd
   cd mobile-app
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Start the development server:
   ```cmd
   npm start
   ```

4. Run on device:
   - **Android**: `npm run android` or scan QR code with Expo Go app
   - **Web**: `npm run web`
   - **Note**: iOS development requires macOS

### Backend Configuration

Update the API base URL in `src/services/authService.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url:3001';
```

For local development with Android emulator, use:
```typescript
const API_BASE_URL = 'http://10.0.2.2:3001';
```

For local development with physical device, use your computer's IP:
```typescript
const API_BASE_URL = 'http://192.168.1.xxx:3001';
```

### Demo Credentials

- **Email**: admin@tj-oms.com
- **Password**: admin123

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── MainMenuScreen.tsx
│   │   └── DestinationScreen.tsx
│   ├── providers/         # Context providers
│   │   └── AuthProvider.tsx
│   ├── services/          # API services
│   │   ├── authService.ts
│   │   └── occupancyService.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── navigation.ts
│   │   └── api.ts
│   └── data/             # Mock data and constants
│       └── busStops.ts
├── App.tsx              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── README.md          # This file
```

## Key Features Implementation

### Bus Route Simulation
- Buses move between stops every 3 seconds
- Occupancy changes dynamically with each move
- Color-coded occupancy indicators (Green: comfortable, Yellow: moderate, Orange: crowded, Red: very crowded)

### Authentication Flow
- Secure JWT-based authentication
- Token storage using AsyncStorage
- Auto-login on app restart if token exists

### Destination Planning
- Modal popup on screen entry
- Popular destinations quick selection
- Route optimization suggestions with timeout
- Color-coded occupancy predictions

## Development Notes

- Built with React Native and Expo
- Uses React Navigation for screen transitions
- Implements AsyncStorage for data persistence
- Includes TypeScript for type safety
- Responsive design for various screen sizes

## Building for Production (Windows)

```cmd
# Build for Android
expo build:android
```

Note: iOS builds require macOS and Xcode

## Troubleshooting (Windows)

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Android connection issues**: Ensure backend URL uses `10.0.2.2` for emulator
3. **Windows Firewall**: Allow Node.js through Windows Firewall when prompted
4. **Authentication errors**: Verify backend is running on specified port
5. **PowerShell issues**: Use Command Prompt if PowerShell has execution policy restrictions
