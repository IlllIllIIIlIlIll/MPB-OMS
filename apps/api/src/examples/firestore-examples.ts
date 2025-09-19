/**
 * Firestore Usage Examples for MPB-OMS Backend
 * 
 * This file demonstrates various ways to use Firestore in your application.
 * Copy and adapt these examples for your specific use cases.
 */

import { firestoreService, BusData, OccupancyData, DeviceData } from '../services/firestoreService';

// ===========================================
// BASIC CRUD OPERATIONS
// ===========================================

export async function basicCrudExamples() {
  console.log('=== BASIC CRUD OPERATIONS ===');

  // 1. Create a new bus
  const newBus: Omit<BusData, 'createdAt' | 'updatedAt'> = {
    busId: 'TEST-001',
    busCode: 'TEST-001',
    routeId: '1',
    routeName: '1',
    direction: 'Blok M',
    platform: 'A',
    capacity: 40,
    deviceId: 'device_test_001',
    providerName: 'TransJakarta',
    category: 'Regular'
  };

  try {
    await firestoreService.createBus(newBus);
    console.log('✅ Bus created successfully');
  } catch (error) {
    console.error('❌ Error creating bus:', error);
  }

  // 2. Get a specific bus
  try {
    const bus = await firestoreService.getBus('TEST-001');
    console.log('✅ Retrieved bus:', bus);
  } catch (error) {
    console.error('❌ Error getting bus:', error);
  }

  // 3. Update bus information
  try {
    await firestoreService.updateBus('TEST-001', {
      direction: 'Kota',
      platform: 'B'
    });
    console.log('✅ Bus updated successfully');
  } catch (error) {
    console.error('❌ Error updating bus:', error);
  }

  // 4. Get all buses
  try {
    const allBuses = await firestoreService.getAllBuses();
    console.log('✅ Retrieved all buses:', allBuses.length);
  } catch (error) {
    console.error('❌ Error getting all buses:', error);
  }
}

// ===========================================
// OCCUPANCY DATA OPERATIONS
// ===========================================

export async function occupancyDataExamples() {
  console.log('=== OCCUPANCY DATA OPERATIONS ===');

  // 1. Create occupancy data
  const occupancyData: Omit<OccupancyData, 'createdAt'> = {
    busId: 'TEST-001',
    occupancy: 25,
    capacity: 40,
    inCount: 15,
    outCount: 10,
    estimasi: '2 mnt',
    deviceId: 'device_test_001',
    routeId: '1',
    routeName: '1',
    direction: 'Blok M',
    platform: 'A',
    timestamp: new Date()
  };

  try {
    await firestoreService.createOccupancy(occupancyData);
    console.log('✅ Occupancy data created successfully');
  } catch (error) {
    console.error('❌ Error creating occupancy data:', error);
  }

  // 2. Get current occupancy for a bus
  try {
    const currentOccupancy = await firestoreService.getCurrentOccupancy('TEST-001');
    console.log('✅ Current occupancy:', currentOccupancy);
  } catch (error) {
    console.error('❌ Error getting current occupancy:', error);
  }

  // 3. Get all current occupancy data
  try {
    const allOccupancy = await firestoreService.getAllCurrentOccupancy();
    console.log('✅ All occupancy data:', allOccupancy.length);
  } catch (error) {
    console.error('❌ Error getting all occupancy data:', error);
  }

  // 4. Update occupancy data
  try {
    await firestoreService.updateOccupancy('TEST-001', {
      occupancy: 30,
      estimasi: '1 mnt'
    });
    console.log('✅ Occupancy data updated successfully');
  } catch (error) {
    console.error('❌ Error updating occupancy data:', error);
  }
}

// ===========================================
// HISTORY AND ANALYTICS
// ===========================================

export async function historyAndAnalyticsExamples() {
  console.log('=== HISTORY AND ANALYTICS ===');

  // 1. Add occupancy history
  try {
    await firestoreService.addOccupancyHistory({
      busId: 'TEST-001',
      occupancy: 28,
      capacity: 40,
      deviceId: 'device_test_001',
      routeId: '1',
      routeName: '1'
    });
    console.log('✅ History entry added successfully');
  } catch (error) {
    console.error('❌ Error adding history entry:', error);
  }

  // 2. Get occupancy history for a bus
  try {
    const history = await firestoreService.getOccupancyHistory('TEST-001', 50);
    console.log('✅ Retrieved history:', history.length, 'entries');
  } catch (error) {
    console.error('❌ Error getting history:', error);
  }

  // 3. Get buses with their current occupancy
  try {
    const busesWithOccupancy = await firestoreService.getBusesWithOccupancy();
    console.log('✅ Buses with occupancy:', busesWithOccupancy.length);
    
    busesWithOccupancy.forEach(bus => {
      console.log(`Bus ${bus.busId}: ${bus.occupancy?.occupancy || 0}/${bus.capacity} passengers`);
    });
  } catch (error) {
    console.error('❌ Error getting buses with occupancy:', error);
  }
}

// ===========================================
// DEVICE MANAGEMENT
// ===========================================

export async function deviceManagementExamples() {
  console.log('=== DEVICE MANAGEMENT ===');

  // 1. Create a device
  const deviceData: Omit<DeviceData, 'createdAt' | 'updatedAt'> = {
    deviceId: 'device_test_001',
    busId: 'TEST-001',
    status: 'online',
    lastPing: new Date()
  };

  try {
    await firestoreService.createDevice(deviceData);
    console.log('✅ Device created successfully');
  } catch (error) {
    console.error('❌ Error creating device:', error);
  }

  // 2. Update device status
  try {
    await firestoreService.updateDevice('device_test_001', {
      status: 'offline',
      lastPing: new Date()
    });
    console.log('✅ Device status updated successfully');
  } catch (error) {
    console.error('❌ Error updating device status:', error);
  }

  // 3. Get device information
  try {
    const device = await firestoreService.getDevice('device_test_001');
    console.log('✅ Retrieved device:', device);
  } catch (error) {
    console.error('❌ Error getting device:', error);
  }
}

// ===========================================
// REAL-TIME LISTENERS
// ===========================================

export async function realTimeListenerExamples() {
  console.log('=== REAL-TIME LISTENERS ===');

  // 1. Listen to occupancy changes for a specific bus
  const unsubscribeBus = firestoreService.onOccupancyChange('TEST-001', (data) => {
    if (data) {
      console.log(`🚌 Bus TEST-001 occupancy changed: ${data.occupancy}/${data.capacity}`);
    } else {
      console.log('🚌 Bus TEST-001 occupancy data removed');
    }
  });

  // 2. Listen to all occupancy changes
  const unsubscribeAll = firestoreService.onAllOccupancyChange((data) => {
    console.log(`📊 Total buses with occupancy data: ${data.length}`);
    data.forEach(occ => {
      console.log(`  - ${occ.busId}: ${occ.occupancy}/${occ.capacity}`);
    });
  });

  // 3. Clean up listeners (call these when you're done)
  setTimeout(() => {
    unsubscribeBus();
    unsubscribeAll();
    console.log('✅ Real-time listeners cleaned up');
  }, 30000); // Clean up after 30 seconds
}

// ===========================================
// BATCH OPERATIONS
// ===========================================

export async function batchOperationsExamples() {
  console.log('=== BATCH OPERATIONS ===');

  // 1. Create multiple occupancy records at once
  const multipleOccupancyData: Omit<OccupancyData, 'createdAt'>[] = [
    {
      busId: 'BATCH-001',
      occupancy: 20,
      capacity: 40,
      inCount: 12,
      outCount: 8,
      estimasi: '3 mnt',
      deviceId: 'device_batch_001',
      routeId: '2',
      routeName: '2',
      direction: 'Pulo Gadung',
      platform: 'A',
      timestamp: new Date()
    },
    {
      busId: 'BATCH-002',
      occupancy: 35,
      capacity: 40,
      inCount: 20,
      outCount: 15,
      estimasi: '1 mnt',
      deviceId: 'device_batch_002',
      routeId: '3',
      routeName: '3',
      direction: 'Kalideres',
      platform: 'B',
      timestamp: new Date()
    }
  ];

  try {
    await firestoreService.batchCreateOccupancy(multipleOccupancyData);
    console.log('✅ Batch occupancy data created successfully');
  } catch (error) {
    console.error('❌ Error creating batch occupancy data:', error);
  }
}

// ===========================================
// ERROR HANDLING AND BEST PRACTICES
// ===========================================

export async function errorHandlingExamples() {
  console.log('=== ERROR HANDLING AND BEST PRACTICES ===');

  try {
    // Always wrap Firestore operations in try-catch
    const bus = await firestoreService.getBus('NONEXISTENT-BUS');
    if (bus) {
      console.log('Bus found:', bus);
    } else {
      console.log('Bus not found - this is expected for nonexistent bus');
    }
  } catch (error) {
    console.error('❌ Error handled gracefully:', error);
  }

  // Example of handling validation errors
  try {
    // This would fail validation if the data is invalid
    await firestoreService.createOccupancy({
      busId: '', // Invalid: empty string
      occupancy: -1, // Invalid: negative occupancy
      capacity: 40,
      inCount: 0,
      outCount: 0,
      estimasi: '1 mnt',
      deviceId: 'device_test',
      timestamp: new Date()
    });
  } catch (error) {
    console.log('✅ Validation error caught:', error);
  }
}

// ===========================================
// RUN ALL EXAMPLES
// ===========================================

export async function runAllExamples() {
  console.log('🚀 Starting Firestore examples...\n');

  try {
    await basicCrudExamples();
    console.log('\n');
    
    await occupancyDataExamples();
    console.log('\n');
    
    await historyAndAnalyticsExamples();
    console.log('\n');
    
    await deviceManagementExamples();
    console.log('\n');
    
    await batchOperationsExamples();
    console.log('\n');
    
    await errorHandlingExamples();
    console.log('\n');
    
    // Uncomment to test real-time listeners
    // await realTimeListenerExamples();
    
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Individual functions are already exported above
