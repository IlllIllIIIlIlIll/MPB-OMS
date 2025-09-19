import admin from 'firebase-admin';
import { getFirestore, Firestore, DocumentData, QuerySnapshot, WriteResult } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let firestore: Firestore;

export const initializeFirestore = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Check if Firebase credentials are properly configured
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      
      if (!projectId || projectId === 'your-firebase-project-id' || 
          !privateKey || privateKey === '-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n' ||
          !clientEmail || clientEmail === 'your-service-account@your-project.iam.gserviceaccount.com') {
        throw new Error('Firebase credentials not configured. Please set up your Firebase environment variables.');
      }

      // Initialize with service account key from environment
      const serviceAccount = {
        type: "service_account",
        project_id: projectId,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: projectId
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
export const getFirestoreInstance = (): Firestore | null => {
  if (!firestore) {
    console.warn('Firestore not initialized. Firebase features will be disabled.');
    return null;
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
  private db: Firestore | null;

  constructor() {
    this.db = getFirestoreInstance();
  }

  private checkFirestore(): Firestore {
    if (!this.db) {
      throw new Error('Firestore not available. Please configure Firebase credentials.');
    }
    return this.db;
  }

  // Bus operations
  async createBus(busData: Omit<BusData, 'createdAt' | 'updatedAt'>): Promise<WriteResult> {
    const db = this.checkFirestore();
    const now = new Date();
    const data: BusData = {
      ...busData,
      createdAt: now,
      updatedAt: now
    };

    return await db.collection(COLLECTIONS.BUSES).doc(busData.busId).set(data);
  }

  async getBus(busId: string): Promise<BusData | null> {
    const db = this.checkFirestore();
    const doc = await db.collection(COLLECTIONS.BUSES).doc(busId).get();
    return doc.exists ? (doc.data() as BusData) : null;
  }

  async getAllBuses(): Promise<BusData[]> {
    const db = this.checkFirestore();
    const snapshot = await db.collection(COLLECTIONS.BUSES).get();
    return snapshot.docs.map(doc => doc.data() as BusData);
  }

  async updateBus(busId: string, updateData: Partial<BusData>): Promise<WriteResult> {
    const db = this.checkFirestore();
    return await db.collection(COLLECTIONS.BUSES).doc(busId).update({
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

    const db = this.checkFirestore();
    return await db.collection(COLLECTIONS.OCCUPANCY).doc(occupancyData.busId).set(data);
  }

  async getCurrentOccupancy(busId: string): Promise<OccupancyData | null> {
    const db = this.checkFirestore();
    const doc = await db.collection(COLLECTIONS.OCCUPANCY).doc(busId).get();
    return doc.exists ? (doc.data() as OccupancyData) : null;
  }

  async getAllCurrentOccupancy(): Promise<OccupancyData[]> {
    const db = this.checkFirestore();
    const snapshot = await db.collection(COLLECTIONS.OCCUPANCY).get();
    return snapshot.docs.map(doc => doc.data() as OccupancyData);
  }

  async updateOccupancy(busId: string, occupancyData: Partial<OccupancyData>): Promise<WriteResult> {
    const db = this.checkFirestore();
    return await db.collection(COLLECTIONS.OCCUPANCY).doc(busId).update(occupancyData);
  }

  // History operations
  async addOccupancyHistory(historyData: Omit<OccupancyHistory, 'timestamp'>): Promise<void> {
    const db = this.checkFirestore();
    const data: OccupancyHistory = {
      ...historyData,
      timestamp: new Date()
    };

    await db.collection(COLLECTIONS.HISTORY).add(data);
  }

  async getOccupancyHistory(busId: string, limit: number = 100): Promise<OccupancyHistory[]> {
    const db = this.checkFirestore();
    const snapshot = await db
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

    const db = this.checkFirestore();
    return await db.collection(COLLECTIONS.DEVICES).doc(deviceData.deviceId).set(data);
  }

  async updateDevice(deviceId: string, updateData: Partial<DeviceData>): Promise<WriteResult> {
    const db = this.checkFirestore();
    return await db.collection(COLLECTIONS.DEVICES).doc(deviceId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  async getDevice(deviceId: string): Promise<DeviceData | null> {
    const db = this.checkFirestore();
    const doc = await db.collection(COLLECTIONS.DEVICES).doc(deviceId).get();
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
    const db = this.checkFirestore();
    const batch = db.batch();
    const now = new Date();

    occupancyDataArray.forEach(data => {
      const docRef = db.collection(COLLECTIONS.OCCUPANCY).doc(data.busId);
      batch.set(docRef, {
        ...data,
        createdAt: now
      });
    });

    await batch.commit();
  }

  // Real-time listeners
  onOccupancyChange(busId: string, callback: (data: OccupancyData | null) => void): () => void {
    const db = this.checkFirestore();
    return db.collection(COLLECTIONS.OCCUPANCY).doc(busId).onSnapshot((doc) => {
      callback(doc.exists ? (doc.data() as OccupancyData) : null);
    });
  }

  onAllOccupancyChange(callback: (data: OccupancyData[]) => void): () => void {
    const db = this.checkFirestore();
    return db.collection(COLLECTIONS.OCCUPANCY).onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as OccupancyData);
      callback(data);
    });
  }
}

// Export singleton instance (lazy-loaded)
let firestoreServiceInstance: FirestoreService | null = null;

export const getFirestoreService = (): FirestoreService => {
  if (!firestoreServiceInstance) {
    firestoreServiceInstance = new FirestoreService();
  }
  return firestoreServiceInstance;
};

// For backward compatibility
export const firestoreService = getFirestoreService();
