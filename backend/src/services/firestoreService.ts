import admin from 'firebase-admin';
import { getFirestore, Firestore, DocumentData, QuerySnapshot, WriteResult } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let firestore: Firestore;

export const initializeFirestore = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account key from environment
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }

    firestore = getFirestore();
    console.log('✅ Firestore initialized successfully');
    return firestore;
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
};

// Get Firestore instance
export const getFirestoreInstance = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore not initialized. Call initializeFirestore() first.');
  }
  return firestore;
};

// Collection names
export const COLLECTIONS = {
  BUSES: 'buses',
  OCCUPANCY: 'occupancy',
  DEVICES: 'devices',
  ROUTES: 'routes',
  HISTORY: 'occupancy_history'
} as const;

// Data interfaces
export interface BusData {
  busId: string;
  busCode: string;
  routeId: string;
  routeName: string;
  direction: string;
  platform: string;
  capacity: number;
  deviceId?: string;
  providerName: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OccupancyData {
  busId: string;
  occupancy: number;
  capacity: number;
  inCount: number;
  outCount: number;
  estimasi: string;
  deviceId: string;
  routeId?: string;
  routeName?: string;
  direction?: string;
  platform?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface DeviceData {
  deviceId: string;
  busId: string;
  status: 'online' | 'offline';
  lastPing: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OccupancyHistory {
  busId: string;
  occupancy: number;
  capacity: number;
  timestamp: Date;
  deviceId: string;
  routeId?: string;
  routeName?: string;
}

// Firestore service class
export class FirestoreService {
  private db: Firestore;

  constructor() {
    this.db = getFirestoreInstance();
  }

  // Bus operations
  async createBus(busData: Omit<BusData, 'createdAt' | 'updatedAt'>): Promise<WriteResult> {
    const now = new Date();
    const data: BusData = {
      ...busData,
      createdAt: now,
      updatedAt: now
    };

    return await this.db.collection(COLLECTIONS.BUSES).doc(busData.busId).set(data);
  }

  async getBus(busId: string): Promise<BusData | null> {
    const doc = await this.db.collection(COLLECTIONS.BUSES).doc(busId).get();
    return doc.exists ? (doc.data() as BusData) : null;
  }

  async getAllBuses(): Promise<BusData[]> {
    const snapshot = await this.db.collection(COLLECTIONS.BUSES).get();
    return snapshot.docs.map(doc => doc.data() as BusData);
  }

  async updateBus(busId: string, updateData: Partial<BusData>): Promise<WriteResult> {
    return await this.db.collection(COLLECTIONS.BUSES).doc(busId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  // Occupancy operations
  async createOccupancy(occupancyData: Omit<OccupancyData, 'createdAt'>): Promise<WriteResult> {
    const now = new Date();
    const data: OccupancyData = {
      ...occupancyData,
      createdAt: now
    };

    return await this.db.collection(COLLECTIONS.OCCUPANCY).doc(occupancyData.busId).set(data);
  }

  async getCurrentOccupancy(busId: string): Promise<OccupancyData | null> {
    const doc = await this.db.collection(COLLECTIONS.OCCUPANCY).doc(busId).get();
    return doc.exists ? (doc.data() as OccupancyData) : null;
  }

  async getAllCurrentOccupancy(): Promise<OccupancyData[]> {
    const snapshot = await this.db.collection(COLLECTIONS.OCCUPANCY).get();
    return snapshot.docs.map(doc => doc.data() as OccupancyData);
  }

  async updateOccupancy(busId: string, occupancyData: Partial<OccupancyData>): Promise<WriteResult> {
    return await this.db.collection(COLLECTIONS.OCCUPANCY).doc(busId).update(occupancyData);
  }

  // History operations
  async addOccupancyHistory(historyData: Omit<OccupancyHistory, 'timestamp'>): Promise<void> {
    const data: OccupancyHistory = {
      ...historyData,
      timestamp: new Date()
    };

    await this.db.collection(COLLECTIONS.HISTORY).add(data);
  }

  async getOccupancyHistory(busId: string, limit: number = 100): Promise<OccupancyHistory[]> {
    const snapshot = await this.db
      .collection(COLLECTIONS.HISTORY)
      .where('busId', '==', busId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as OccupancyHistory);
  }

  // Device operations
  async createDevice(deviceData: Omit<DeviceData, 'createdAt' | 'updatedAt'>): Promise<WriteResult> {
    const now = new Date();
    const data: DeviceData = {
      ...deviceData,
      createdAt: now,
      updatedAt: now
    };

    return await this.db.collection(COLLECTIONS.DEVICES).doc(deviceData.deviceId).set(data);
  }

  async updateDevice(deviceId: string, updateData: Partial<DeviceData>): Promise<WriteResult> {
    return await this.db.collection(COLLECTIONS.DEVICES).doc(deviceId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  async getDevice(deviceId: string): Promise<DeviceData | null> {
    const doc = await this.db.collection(COLLECTIONS.DEVICES).doc(deviceId).get();
    return doc.exists ? (doc.data() as DeviceData) : null;
  }

  // Utility methods
  async getBusesWithOccupancy(): Promise<(BusData & { occupancy?: OccupancyData })[]> {
    const buses = await this.getAllBuses();
    const occupancyData = await this.getAllCurrentOccupancy();
    
    return buses.map(bus => {
      const occupancy = occupancyData.find(occ => occ.busId === bus.busId);
      return {
        ...bus,
        occupancy
      };
    });
  }

  // Batch operations for better performance
  async batchCreateOccupancy(occupancyDataArray: Omit<OccupancyData, 'createdAt'>[]): Promise<void> {
    const batch = this.db.batch();
    const now = new Date();

    occupancyDataArray.forEach(data => {
      const docRef = this.db.collection(COLLECTIONS.OCCUPANCY).doc(data.busId);
      batch.set(docRef, {
        ...data,
        createdAt: now
      });
    });

    await batch.commit();
  }

  // Real-time listeners
  onOccupancyChange(busId: string, callback: (data: OccupancyData | null) => void): () => void {
    return this.db.collection(COLLECTIONS.OCCUPANCY).doc(busId).onSnapshot((doc) => {
      callback(doc.exists ? (doc.data() as OccupancyData) : null);
    });
  }

  onAllOccupancyChange(callback: (data: OccupancyData[]) => void): () => void {
    return this.db.collection(COLLECTIONS.OCCUPANCY).onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as OccupancyData);
      callback(data);
    });
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
