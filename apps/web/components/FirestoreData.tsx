'use client';

import React from 'react';
import { useBusesWithOccupancy, useRealtimeOccupancy, useBus, useBusOccupancy } from '@/hooks/useFirestore';
import { Card } from '@/components/ui/Card';
import OccupancyIndicator from '@/components/ui/OccupancyIndicator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FirestoreDataProps {
  useRealtime?: boolean;
}

export function FirestoreData({ useRealtime = false }: FirestoreDataProps) {
  const { busesWithOccupancy, loading, error } = useBusesWithOccupancy();
  const { occupancy: realtimeOccupancy, loading: realtimeLoading, error: realtimeError } = useRealtimeOccupancy();

  if (loading || realtimeLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading Firestore data...</span>
      </div>
    );
  }

  if (error || realtimeError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Error loading data:</h3>
        <p>{error?.message || realtimeError?.message}</p>
      </div>
    );
  }

  const dataToShow = useRealtime ? realtimeOccupancy : busesWithOccupancy;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {useRealtime ? 'Real-time' : 'Static'} Firestore Data
        </h2>
        <div className="text-sm text-gray-500">
          {useRealtime ? 'Live updates' : 'One-time fetch'}
        </div>
      </div>

      {useRealtime ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {realtimeOccupancy.map((occ) => (
            <Card key={occ.id} className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{occ.busId}</h3>
                <div className="text-sm text-gray-600">
                  <p>Route: {occ.routeName || 'Unknown'}</p>
                  <p>Direction: {occ.direction || 'Unknown'}</p>
                  <p>Platform: {occ.platform || 'Unknown'}</p>
                </div>
                <OccupancyIndicator
                  current={occ.occupancy}
                  capacity={occ.capacity}
                />
                <div className="text-sm">
                  <p>In: {occ.inCount} | Out: {occ.outCount}</p>
                  <p>Estimasi: {occ.estimasi}</p>
                </div>
                <div className="text-xs text-gray-400">
                  Updated: {new Date(occ.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {busesWithOccupancy.map((bus) => (
            <Card key={bus.id} className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{bus.busCode}</h3>
                <div className="text-sm text-gray-600">
                  <p>Route: {bus.routeName}</p>
                  <p>Direction: {bus.direction}</p>
                  <p>Platform: {bus.platform}</p>
                </div>
                {bus.occupancy ? (
                  <>
                    <OccupancyIndicator 
                      current={bus.occupancy.occupancy} 
                      capacity={bus.capacity} 
                    />
                    <div className="text-sm">
                      <p>In: {bus.occupancy.inCount} | Out: {bus.occupancy.outCount}</p>
                      <p>Estimasi: {bus.occupancy.estimasi}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Updated: {new Date(bus.occupancy.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No occupancy data available
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {dataToShow.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available. Make sure your backend is running and has data in Firestore.
        </div>
      )}
    </div>
  );
}

// Example component showing how to use individual hooks
export function BusDetails({ busId }: { busId: string }) {
  const { bus, loading, error } = useBus(busId);
  const { occupancy, loading: occupancyLoading } = useBusOccupancy(busId);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!bus) return <div>Bus not found</div>;

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg">{bus.busCode}</h3>
      <p>Route: {bus.routeName}</p>
      <p>Direction: {bus.direction}</p>
      <p>Platform: {bus.platform}</p>
      <p>Capacity: {bus.capacity}</p>
      
      {occupancyLoading ? (
        <LoadingSpinner />
      ) : occupancy ? (
        <div className="mt-2">
          <OccupancyIndicator current={occupancy.occupancy} capacity={bus.capacity} />
          <p>Current: {occupancy.occupancy}/{bus.capacity}</p>
        </div>
      ) : (
        <p className="text-gray-500">No occupancy data</p>
      )}
    </Card>
  );
}
