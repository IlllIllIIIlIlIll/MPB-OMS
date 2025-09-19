#!/usr/bin/env tsx

/**
 * Test script for Firestore integration
 * Run with: npx tsx src/scripts/test-firestore.ts
 */

import { initializeFirestore, firestoreService } from '../services/firestoreService';

async function testFirestoreConnection() {
  console.log('🔥 Testing Firestore connection...\n');

  try {
    // Initialize Firestore
    await initializeFirestore();
    console.log('✅ Firestore initialized successfully\n');

    // Test basic operations
    console.log('📝 Testing basic operations...');
    
    // Create a test bus
    const testBus = {
      busId: 'TEST-FIRESTORE-001',
      busCode: 'TEST-001',
      routeId: 'TEST',
      routeName: 'Test Route',
      direction: 'Test Direction',
      platform: 'A',
      capacity: 40,
      deviceId: 'device_test_001',
      providerName: 'Test Provider',
      category: 'Test'
    };

    await firestoreService.createBus(testBus);
    console.log('✅ Test bus created');

    // Create occupancy data
    const testOccupancy = {
      busId: 'TEST-FIRESTORE-001',
      occupancy: 25,
      capacity: 40,
      inCount: 15,
      outCount: 10,
      estimasi: '2 mnt',
      deviceId: 'device_test_001',
      routeId: 'TEST',
      routeName: 'Test Route',
      direction: 'Test Direction',
      platform: 'A',
      timestamp: new Date()
    };

    await firestoreService.createOccupancy(testOccupancy);
    console.log('✅ Test occupancy data created');

    // Retrieve and display data
    const retrievedBus = await firestoreService.getBus('TEST-FIRESTORE-001');
    const retrievedOccupancy = await firestoreService.getCurrentOccupancy('TEST-FIRESTORE-001');

    console.log('\n📊 Retrieved data:');
    console.log('Bus:', retrievedBus);
    console.log('Occupancy:', retrievedOccupancy);

    // Test buses with occupancy
    const busesWithOccupancy = await firestoreService.getBusesWithOccupancy();
    console.log(`\n🚌 Total buses with occupancy: ${busesWithOccupancy.length}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    // Note: In a real scenario, you'd want to delete the test documents
    // For now, we'll just log that cleanup would happen here
    
    console.log('\n✅ All tests passed! Firestore is working correctly.');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFirestoreConnection()
    .then(() => {
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testFirestoreConnection };
