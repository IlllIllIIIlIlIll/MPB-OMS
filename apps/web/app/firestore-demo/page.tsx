'use client';

import React, { useState } from 'react';
import { FirestoreData, BusDetails } from '@/components/FirestoreData';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function FirestoreDemoPage() {
  const [showRealtime, setShowRealtime] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState('DMR-727');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🔥 Firestore Integration Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates how to use Firebase Firestore with your TransJakarta OMS frontend.
        </p>
      </div>

      {/* Toggle between static and real-time data */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Data Display Mode</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowRealtime(false)}
              variant={!showRealtime ? 'primary' : 'secondary'}
            >
              Static Data
            </Button>
            <Button
              onClick={() => setShowRealtime(true)}
              variant={showRealtime ? 'primary' : 'secondary'}
            >
              Real-time Data
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {showRealtime 
            ? 'Real-time mode: Data updates automatically when changes occur in Firestore'
            : 'Static mode: Data is fetched once when the component mounts'
          }
        </p>
      </Card>

      {/* Main data display */}
      <FirestoreData useRealtime={showRealtime} />

      {/* Individual bus details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Individual Bus Details</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Bus ID:
          </label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="DMR-727">DMR-727</option>
            <option value="MYS-19222">MYS-19222</option>
            <option value="DMR-710">DMR-710</option>
            <option value="DMR-240133">DMR-240133</option>
            <option value="MYS-17168">MYS-17168</option>
          </select>
        </div>
        <BusDetails busId={selectedBusId} />
      </Card>

      {/* Usage instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium">1. Static Data Fetching:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { useBusesWithOccupancy } from '@/hooks/useFirestore';

function MyComponent() {
  const { busesWithOccupancy, loading, error } = useBusesWithOccupancy();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {busesWithOccupancy.map(bus => (
        <div key={bus.busId}>
          {bus.busCode} - {bus.occupancy?.occupancy || 0}/{bus.capacity}
        </div>
      ))}
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium">2. Real-time Data:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { useRealtimeOccupancy } from '@/hooks/useFirestore';

function MyComponent() {
  const { occupancy, loading, error } = useRealtimeOccupancy();
  
  // Data updates automatically when Firestore changes
  return (
    <div>
      {occupancy.map(occ => (
        <div key={occ.id}>
          {occ.busId} - {occ.occupancy}/{occ.capacity}
        </div>
      ))}
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium">3. Direct Firestore Service:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { firestoreService } from '@/lib/firestore';

// Add new bus
await firestoreService.addBus({
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

// Get specific bus
const bus = await firestoreService.getBus('NEW-001');`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Setup instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
        <div className="space-y-2 text-sm">
          <p>1. <strong>Install Firebase:</strong> <code>npm install firebase</code> (already done)</p>
          <p>2. <strong>Configure environment:</strong> Copy <code>env.example</code> to <code>.env.local</code></p>
          <p>3. <strong>Start backend:</strong> Make sure your backend is running with Firestore enabled</p>
          <p>4. <strong>Add sample data:</strong> Use the backend admin panel or scripts to add data</p>
          <p>5. <strong>View data:</strong> Check Firebase Console or use the admin panel</p>
        </div>
      </Card>
    </div>
  );
}
