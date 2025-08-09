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
