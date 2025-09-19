export type RootStackParamList = {
  Login: undefined;
  MainMenu: undefined;
  Destination: {
    from?: string;
    to?: string;
  };
};

export type BusStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
};

export type Bus = {
  id: string;
  name: string;
  currentStopId: string;
  occupancy: number;
  capacity: number;
  route: BusStop[];
  isMoving: boolean;
  direction: number; // 0 = ascending, 1 = descending
  speed: number; // Individual bus speed
  busType?: string; // 'orange', 'red', 'cyan' for different routes
  routePath?: number[]; // Array of station numbers for the route
  routeColor?: string; // Color for track code background
  forecastChange?: number; // Expected passenger change at next station
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

export type RouteOptimizationSuggestion = {
  routeId: string;
  routeName: string;
  estimatedOccupancy: number;
  estimatedTime: number;
  reason: string;
};
