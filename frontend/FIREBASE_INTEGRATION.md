# Firebase Integration for Frontend

This document explains how to use Firebase Firestore in your TransJakarta OMS frontend application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Configure Environment Variables
Copy `env.example` to `.env.local` and update the Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3. Test the Connection
```bash
node scripts/test-firebase.js
```

## 📁 File Structure

```
frontend/
├── lib/
│   ├── firebase.ts          # Firebase configuration and initialization
│   └── firestore.ts         # Firestore service with CRUD operations
├── hooks/
│   └── useFirestore.ts      # React hooks for Firestore data
├── components/
│   └── FirestoreData.tsx    # Example components using Firestore
├── app/
│   └── firestore-demo/      # Demo page showing Firestore usage
└── scripts/
    └── test-firebase.js     # Test script for Firebase connection
```

## 🔧 Usage Examples

### Basic Data Fetching

```tsx
import { useBusesWithOccupancy } from '@/hooks/useFirestore';

function BusList() {
  const { busesWithOccupancy, loading, error } = useBusesWithOccupancy();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {busesWithOccupancy.map(bus => (
        <div key={bus.busId}>
          <h3>{bus.busCode}</h3>
          <p>Route: {bus.routeName}</p>
          <p>Occupancy: {bus.occupancy?.occupancy || 0}/{bus.capacity}</p>
        </div>
      ))}
    </div>
  );
}
```

### Real-time Updates

```tsx
import { useRealtimeOccupancy } from '@/hooks/useFirestore';

function LiveOccupancy() {
  const { occupancy, loading, error } = useRealtimeOccupancy();

  // Data updates automatically when Firestore changes
  return (
    <div>
      {occupancy.map(occ => (
        <div key={occ.id}>
          {occ.busId}: {occ.occupancy}/{occ.capacity}
        </div>
      ))}
    </div>
  );
}
```

### Direct Firestore Operations

```tsx
import { firestoreService } from '@/lib/firestore';

// Add new bus
const addBus = async () => {
  try {
    const busId = await firestoreService.addBus({
      busId: 'NEW-001',
      busCode: 'NEW-001',
      routeId: '1',
      routeName: '1',
      direction: 'Blok M',
      platform: 'A',
      capacity: 40,
      deviceId: 'device_new_001',
      providerName: 'TransJakarta',
      category: 'Regular'
    });
    console.log('Bus added with ID:', busId);
  } catch (error) {
    console.error('Error adding bus:', error);
  }
};

// Get specific bus
const getBus = async (busId: string) => {
  try {
    const bus = await firestoreService.getBus(busId);
    console.log('Bus data:', bus);
  } catch (error) {
    console.error('Error getting bus:', error);
  }
};
```

## 🎣 Available Hooks

### Data Fetching Hooks
- `useBuses()` - Get all buses
- `useOccupancy()` - Get all occupancy data
- `useBusesWithOccupancy()` - Get buses with their occupancy data
- `useBus(busId)` - Get specific bus
- `useBusOccupancy(busId)` - Get occupancy for specific bus
- `useOccupancyHistory(busId, limit)` - Get occupancy history for a bus

### Real-time Hooks
- `useRealtimeOccupancy()` - Real-time occupancy updates
- `useRealtimeBuses()` - Real-time bus updates
- `useRealtimeBusOccupancy(busId)` - Real-time updates for specific bus

## 🔄 Firestore Service Methods

### Bus Operations
```typescript
// Get all buses
const buses = await firestoreService.getBuses();

// Get specific bus
const bus = await firestoreService.getBus('DMR-727');

// Add new bus
const busId = await firestoreService.addBus(busData);

// Update bus
await firestoreService.updateBus('DMR-727', { direction: 'New Direction' });

// Delete bus
await firestoreService.deleteBus('DMR-727');
```

### Occupancy Operations
```typescript
// Get all occupancy data
const occupancy = await firestoreService.getOccupancy();

// Get specific bus occupancy
const busOccupancy = await firestoreService.getBusOccupancy('DMR-727');

// Add occupancy data
const occupancyId = await firestoreService.addOccupancy(occupancyData);

// Update occupancy
await firestoreService.updateOccupancy('DMR-727', { occupancy: 25 });
```

### History Operations
```typescript
// Get occupancy history
const history = await firestoreService.getOccupancyHistory('DMR-727', 50);

// Add history entry
const historyId = await firestoreService.addOccupancyHistory(historyData);
```

### Real-time Listeners
```typescript
// Listen to all occupancy changes
const unsubscribe = firestoreService.onOccupancyChange((data) => {
  console.log('Occupancy updated:', data);
});

// Listen to specific bus occupancy
const unsubscribeBus = firestoreService.onBusOccupancyChange('DMR-727', (data) => {
  console.log('Bus occupancy updated:', data);
});

// Clean up listeners
unsubscribe();
unsubscribeBus();
```

## 🎨 Demo Page

Visit `/firestore-demo` to see a working example of:
- Static data fetching
- Real-time data updates
- Individual bus details
- Code examples
- Setup instructions

## 🔒 Security Rules

Make sure your Firestore security rules allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

For production, implement proper authentication and authorization.

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check that your environment variables are set correctly
   - Verify the Firebase configuration

2. **Permission denied errors**
   - Check Firestore security rules
   - Ensure your project has the correct permissions

3. **No data showing**
   - Make sure your backend is running and has data
   - Check the Firebase Console to verify data exists
   - Run the test script to verify connection

4. **Real-time updates not working**
   - Check that you're using the real-time hooks
   - Verify the Firestore connection is active
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding this to your component:

```tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Firestore data:', data);
  }
}, [data]);
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)
- [React Hooks for Firebase](https://firebase.google.com/docs/web/learn-more#modular-version)

## 🚀 Next Steps

1. **Set up authentication** using Firebase Auth
2. **Implement real-time notifications** using Firebase Cloud Messaging
3. **Add data validation** using Firebase Security Rules
4. **Optimize queries** with proper indexing
5. **Add offline support** using Firestore offline persistence
