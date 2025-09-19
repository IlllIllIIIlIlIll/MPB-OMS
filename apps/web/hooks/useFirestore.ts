import { useState, useEffect } from 'react';
import { firestoreService, Bus, Occupancy, OccupancyHistory } from '@/lib/firestore';

// Hook for getting all buses
export function useBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getBuses();
        setBuses(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  return { buses, loading, error };
}

// Hook for getting all occupancy data
export function useOccupancy() {
  const [occupancy, setOccupancy] = useState<Occupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getOccupancy();
        setOccupancy(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancy();
  }, []);

  return { occupancy, loading, error };
}

// Hook for getting buses with occupancy
export function useBusesWithOccupancy() {
  const [busesWithOccupancy, setBusesWithOccupancy] = useState<(Bus & { occupancy?: Occupancy })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getBusesWithOccupancy();
        setBusesWithOccupancy(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { busesWithOccupancy, loading, error };
}

// Hook for real-time occupancy updates
export function useRealtimeOccupancy() {
  const [occupancy, setOccupancy] = useState<Occupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = firestoreService.onOccupancyChange((data) => {
      setOccupancy(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { occupancy, loading, error };
}

// Hook for real-time buses updates
export function useRealtimeBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = firestoreService.onBusesChange((data) => {
      setBuses(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { buses, loading, error };
}

// Hook for getting occupancy history for a specific bus
export function useOccupancyHistory(busId: string, limitCount: number = 100) {
  const [history, setHistory] = useState<OccupancyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!busId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getOccupancyHistory(busId, limitCount);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [busId, limitCount]);

  return { history, loading, error };
}

// Hook for getting a specific bus
export function useBus(busId: string) {
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!busId) return;

    const fetchBus = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getBus(busId);
        setBus(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [busId]);

  return { bus, loading, error };
}

// Hook for getting occupancy for a specific bus
export function useBusOccupancy(busId: string) {
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!busId) return;

    const fetchOccupancy = async () => {
      try {
        setLoading(true);
        const data = await firestoreService.getBusOccupancy(busId);
        setOccupancy(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancy();
  }, [busId]);

  return { occupancy, loading, error };
}

// Hook for real-time bus occupancy updates
export function useRealtimeBusOccupancy(busId: string) {
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!busId) return;

    setLoading(true);
    
    const unsubscribe = firestoreService.onBusOccupancyChange(busId, (data) => {
      setOccupancy(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [busId]);

  return { occupancy, loading, error };
}
