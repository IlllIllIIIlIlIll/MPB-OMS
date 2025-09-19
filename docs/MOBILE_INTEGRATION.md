# Mobile App Integration with start-all.ps1

## ✅ **MOBILE APP IS BACK!** 

The mobile app has been re-added to the `start-all.ps1` script and will now start automatically with all other services.

## Overview
The mobile app is now fully integrated with the `start-all.ps1` script and will automatically start alongside the backend, frontend, and YOLO modelling services.

## What Happens When You Run `.\start-all.ps1`

1. **Backend** starts on port 3001
2. **Frontend** starts on port 3002  
3. **YOLO Modelling Service** starts on port 8081
4. **Mobile App** starts with Expo Metro bundler ✅ **AUTOMATICALLY!**

## Mobile App Configuration

### API Connections
- **Backend API**: `http://localhost:3001` (real data)
- **YOLO Service**: `http://localhost:8081` (real-time occupancy updates)

### Data Sources
- ✅ **Real occupancy data** from backend API
- ✅ **Live camera detection** from YOLO service
- ✅ **Real-time updates** via WebSocket connections
- ✅ **Actual bus locations** and status information
- ✅ **Interactive map** with clickable stations and buses

### No Hardcoded Data
The mobile app now uses:
- Live API calls to `localhost:3001`
- Real-time occupancy updates
- Actual bus data from your backend
- Live camera detection results

## How to Access the Mobile App

### Option 1: Expo Go App (Recommended) ✅ **AUTOMATIC**
1. Install "Expo Go" from Google Play Store or App Store
2. Run `.\start-all.ps1` 
3. **Mobile app starts automatically!**
4. Scan the QR code that appears in the terminal
5. App loads on your phone with real data

### Option 2: Android Emulator
1. Ensure Android Studio emulator is running
2. Run `.\start-all.ps1` (mobile app starts automatically)
3. In a separate terminal: `cd mobile-app && npm run android`

### Option 3: Web Version
1. Run `.\start-all.ps1` (mobile app starts automatically)
2. In a separate terminal: `cd mobile-app && npm run web`
3. Open browser to see mobile app interface

## Integration Benefits

- **Single Command**: Just run `.\start-all.ps1` to start everything including mobile app
- **Real Data**: No more hardcoded/mock data
- **Live Updates**: Real-time occupancy changes from camera
- **Unified System**: All services work together seamlessly
- **Easy Development**: Test mobile app with live backend data
- **Interactive Map**: Clickable stations and buses with real-time data

## Troubleshooting

### Mobile App Won't Start
- Check if `node_modules` exists in `mobile-app/` folder
- The script will automatically run `npm install` if needed
- Ensure Expo CLI is installed globally: `npm install -g @expo/cli`

### Can't Connect to Backend
- Verify backend is running on port 3001
- Check if `localhost:3001/api/occupancy/now` responds
- Ensure no firewall blocking localhost connections

### QR Code Not Working
- Make sure phone and computer are on same network
- Try using the web version instead: `npm run web`
- Check Expo Go app is up to date

## File Changes Made

1. **`start-all.ps1`** - ✅ **RE-ADDED** mobile app startup and monitoring
2. **`mobile-app/src/services/authService.ts`** - Updated API endpoint to localhost
3. **`mobile-app/src/screens/MainMenuScreen.tsx`** - Added interactive map with clickable points
4. **`MOBILE_INTEGRATION.md`** - This documentation file

## Next Steps

1. **Run `.\start-all.ps1`** to start all services including mobile app
2. **Install Expo Go** on your phone
3. **Scan QR code** to test the mobile app
4. **Verify real data** is flowing from backend to mobile app
5. **Test the interactive map** with clickable stations and buses

## 🎉 **Status: FULLY INTEGRATED!**

The mobile app is now back in `start-all.ps1` and will start automatically with all your services. You'll get:
- ✅ Backend API on port 3001
- ✅ Frontend web on port 3002  
- ✅ YOLO service on port 8081
- ✅ **Mobile app with Expo Metro bundler**
- ✅ **Interactive map with real-time data**
- ✅ **All services running from one command!**

Just run `.\start-all.ps1` and everything will start automatically! 🚌📱✨
