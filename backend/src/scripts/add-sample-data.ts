#!/usr/bin/env tsx

/**
 * Script to add sample data to Firestore
 * Run with: npx tsx src/scripts/add-sample-data.ts
 */

import { initializeFirestore, firestoreService } from '../services/firestoreService';

async function addSampleData() {
  console.log('🚀 Adding sample data to Firestore...\n');

  try {
    // Initialize Firestore
    await initializeFirestore();
    console.log('✅ Firestore initialized\n');

    // Sample buses data
    const sampleBuses = [
      {
        busId: 'DMR-727',
        busCode: 'DMR-727',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'A',
        capacity: 40,
        deviceId: 'device_dmr_727',
        providerName: 'TransJakarta',
        category: 'Regular'
      },
      {
        busId: 'MYS-19222',
        busCode: 'MYS-19222',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        capacity: 40,
        deviceId: 'device_mys_19222',
        providerName: 'TransJakarta',
        category: 'Regular'
      },
      {
        busId: 'DMR-710',
        busCode: 'DMR-710',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'C',
        capacity: 40,
        deviceId: 'device_dmr_710',
        providerName: 'TransJakarta',
        category: 'Regular'
      },
      {
        busId: 'DMR-240133',
        busCode: 'DMR-240133',
        routeId: '2A',
        routeName: '2A',
        direction: 'Senayan',
        platform: 'B',
        capacity: 40,
        deviceId: 'device_dmr_240133',
        providerName: 'TransJakarta',
        category: 'Regular'
      },
      {
        busId: 'MYS-17168',
        busCode: 'MYS-17168',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        capacity: 40,
        deviceId: 'device_mys_17168',
        providerName: 'TransJakarta',
        category: 'Regular'
      }
    ];

    // Sample occupancy data
    const sampleOccupancy = [
      {
        busId: 'DMR-727',
        occupancy: 32,
        capacity: 40,
        inCount: 23,
        outCount: 16,
        estimasi: '1 mnt',
        deviceId: 'device_dmr_727',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'A',
        timestamp: new Date()
      },
      {
        busId: 'MYS-19222',
        occupancy: 25,
        capacity: 40,
        inCount: 18,
        outCount: 12,
        estimasi: '1 mnt',
        deviceId: 'device_mys_19222',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        timestamp: new Date()
      },
      {
        busId: 'DMR-710',
        occupancy: 30,
        capacity: 40,
        inCount: 21,
        outCount: 14,
        estimasi: '2 mnt',
        deviceId: 'device_dmr_710',
        routeId: '2',
        routeName: '2',
        direction: 'Pulo Gadung',
        platform: 'C',
        timestamp: new Date()
      },
      {
        busId: 'DMR-240133',
        occupancy: 15,
        capacity: 40,
        inCount: 12,
        outCount: 8,
        estimasi: '3 mnt',
        deviceId: 'device_dmr_240133',
        routeId: '2A',
        routeName: '2A',
        direction: 'Senayan',
        platform: 'B',
        timestamp: new Date()
      },
      {
        busId: 'MYS-17168',
        occupancy: 2,
        capacity: 40,
        inCount: 3,
        outCount: 2,
        estimasi: '3 mnt',
        deviceId: 'device_mys_17168',
        routeId: '7F',
        routeName: '7F',
        direction: 'Jakarta Kota',
        platform: 'A',
        timestamp: new Date()
      }
    ];

    // Add buses
    console.log('📝 Adding buses...');
    for (const bus of sampleBuses) {
      await firestoreService.createBus(bus);
      console.log(`  ✅ Added bus: ${bus.busId}`);
    }

    // Add occupancy data
    console.log('\n📊 Adding occupancy data...');
    for (const occupancy of sampleOccupancy) {
      await firestoreService.createOccupancy(occupancy);
      console.log(`  ✅ Added occupancy for bus: ${occupancy.busId}`);
    }

    // Add some history data
    console.log('\n📈 Adding history data...');
    for (let i = 0; i < 5; i++) {
      for (const bus of sampleBuses) {
        await firestoreService.addOccupancyHistory({
          busId: bus.busId,
          occupancy: Math.floor(Math.random() * 40),
          capacity: 40,
          deviceId: bus.deviceId,
          routeId: bus.routeId,
          routeName: bus.routeName
        });
      }
    }
    console.log('  ✅ Added history data for all buses');

    // Add device data
    console.log('\n📱 Adding device data...');
    for (const bus of sampleBuses) {
      await firestoreService.createDevice({
        deviceId: bus.deviceId,
        busId: bus.busId,
        status: 'online',
        lastPing: new Date()
      });
      console.log(`  ✅ Added device: ${bus.deviceId}`);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - ${sampleBuses.length} buses added`);
    console.log(`  - ${sampleOccupancy.length} occupancy records added`);
    console.log(`  - ${sampleBuses.length} devices added`);
    console.log(`  - ${5 * sampleBuses.length} history records added`);

    console.log('\n🔗 You can now:');
    console.log('  - View data in Firebase Console: https://console.firebase.google.com/');
    console.log('  - Use the admin panel: http://localhost:3001/api/admin');
    console.log('  - Check API endpoints: http://localhost:3001/api/occupancy/now');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addSampleData()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { addSampleData };
