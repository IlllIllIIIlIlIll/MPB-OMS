import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@transjakarta.com' },
    update: {},
    create: {
      email: 'admin@transjakarta.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN'
    }
  });

  // Create platform guard user
  const guardPassword = await bcrypt.hash('guard123', 12);
  const guardUser = await prisma.user.upsert({
    where: { email: 'guard@transjakarta.com' },
    update: {},
    create: {
      email: 'guard@transjakarta.com',
      password: guardPassword,
      name: 'Platform Guard',
      role: 'PLATFORM_GUARD'
    }
  });

  console.log('✅ Users created');

  // Create routes
  const routes = await Promise.all([
    prisma.route.upsert({
      where: { routeNumber: '1' },
      update: {},
      create: {
        routeNumber: '1',
        name: 'Blok M - Kota',
        description: 'Main corridor connecting Blok M to Kota'
      }
    }),
    prisma.route.upsert({
      where: { routeNumber: '2' },
      update: {},
      create: {
        routeNumber: '2',
        name: 'Pulogadung - Harmoni',
        description: 'East-West corridor'
      }
    }),
    prisma.route.upsert({
      where: { routeNumber: '3' },
      update: {},
      create: {
        routeNumber: '3',
        name: 'Kalideres - Monas',
        description: 'West-Central corridor'
      }
    }),
    prisma.route.upsert({
      where: { routeNumber: '4' },
      update: {},
      create: {
        routeNumber: '4',
        name: 'Pulogadung - Dukuh Atas',
        description: 'East-Central corridor'
      }
    }),
    prisma.route.upsert({
      where: { routeNumber: '5' },
      update: {},
      create: {
        routeNumber: '5',
        name: 'Kampung Melayu - Ancol',
        description: 'South-North corridor'
      }
    })
  ]);

  console.log('✅ Routes created');

  // Create stations
  const stations = await Promise.all([
    prisma.station.upsert({
      where: { code: 'BLK' },
      update: {},
      create: {
        name: 'Blok M',
        code: 'BLK',
        address: 'Jl. Sisingamangaraja, Jakarta Selatan',
        latitude: -6.2434,
        longitude: 106.7999
      }
    }),
    prisma.station.upsert({
      where: { code: 'KOT' },
      update: {},
      create: {
        name: 'Kota',
        code: 'KOT',
        address: 'Jl. Pintu Besar Utara, Jakarta Barat',
        latitude: -6.1374,
        longitude: 106.8143
      }
    }),
    prisma.station.upsert({
      where: { code: 'PLG' },
      update: {},
      create: {
        name: 'Pulogadung',
        code: 'PLG',
        address: 'Jl. Bekasi Raya, Jakarta Timur',
        latitude: -6.1894,
        longitude: 106.9189
      }
    }),
    prisma.station.upsert({
      where: { code: 'HRM' },
      update: {},
      create: {
        name: 'Harmoni',
        code: 'HRM',
        address: 'Jl. Gajah Mada, Jakarta Pusat',
        latitude: -6.1754,
        longitude: 106.8272
      }
    }),
    prisma.station.upsert({
      where: { code: 'KLD' },
      update: {},
      create: {
        name: 'Kalideres',
        code: 'KLD',
        address: 'Jl. Daan Mogot, Jakarta Barat',
        latitude: -6.1584,
        longitude: 106.7089
      }
    }),
    prisma.station.upsert({
      where: { code: 'MNS' },
      update: {},
      create: {
        name: 'Monas',
        code: 'MNS',
        address: 'Jl. Medan Merdeka, Jakarta Pusat',
        latitude: -6.1754,
        longitude: 106.8272
      }
    }),
    prisma.station.upsert({
      where: { code: 'DKA' },
      update: {},
      create: {
        name: 'Dukuh Atas',
        code: 'DKA',
        address: 'Jl. Sudirman, Jakarta Pusat',
        latitude: -6.2088,
        longitude: 106.8456
      }
    }),
    prisma.station.upsert({
      where: { code: 'KML' },
      update: {},
      create: {
        name: 'Kampung Melayu',
        code: 'KML',
        address: 'Jl. Jatinegara Timur, Jakarta Timur',
        latitude: -6.2088,
        longitude: 106.8456
      }
    }),
    prisma.station.upsert({
      where: { code: 'ANC' },
      update: {},
      create: {
        name: 'Ancol',
        code: 'ANC',
        address: 'Jl. Lodan Timur, Jakarta Utara',
        latitude: -6.1374,
        longitude: 106.8143
      }
    })
  ]);

  console.log('✅ Stations created');

  // Create route stops
  const routeStops = [
    // Route 1: Blok M - Kota
    { routeId: routes[0].id, stationId: stations[0].id, order: 1 },
    { routeId: routes[0].id, stationId: stations[2].id, order: 2 },
    { routeId: routes[0].id, stationId: stations[3].id, order: 3 },
    { routeId: routes[0].id, stationId: stations[1].id, order: 4 },
    
    // Route 2: Pulogadung - Harmoni
    { routeId: routes[1].id, stationId: stations[2].id, order: 1 },
    { routeId: routes[1].id, stationId: stations[3].id, order: 2 },
    
    // Route 3: Kalideres - Monas
    { routeId: routes[2].id, stationId: stations[4].id, order: 1 },
    { routeId: routes[2].id, stationId: stations[5].id, order: 2 },
    
    // Route 4: Pulogadung - Dukuh Atas
    { routeId: routes[3].id, stationId: stations[2].id, order: 1 },
    { routeId: routes[3].id, stationId: stations[6].id, order: 2 },
    
    // Route 5: Kampung Melayu - Ancol
    { routeId: routes[4].id, stationId: stations[7].id, order: 1 },
    { routeId: routes[4].id, stationId: stations[8].id, order: 2 }
  ];

  for (const stop of routeStops) {
    await prisma.routeStop.upsert({
      where: {
        routeId_stationId: {
          routeId: stop.routeId,
          stationId: stop.stationId
        }
      },
      update: { order: stop.order },
      create: stop
    });
  }

  console.log('✅ Route stops created');

  // Create buses
  const buses = await Promise.all([
    prisma.bus.upsert({
      where: { busNumber: 'TJ001' },
      update: {},
      create: {
        busNumber: 'TJ001',
        plateNumber: 'B 1234 TJ',
        routeId: routes[0].id,
        capacity: 50,
        currentLat: -6.2434,
        currentLng: 106.7999
      }
    }),
    prisma.bus.upsert({
      where: { busNumber: 'TJ002' },
      update: {},
      create: {
        busNumber: 'TJ002',
        plateNumber: 'B 1235 TJ',
        routeId: routes[0].id,
        capacity: 50,
        currentLat: -6.1894,
        currentLng: 106.9189
      }
    }),
    prisma.bus.upsert({
      where: { busNumber: 'TJ003' },
      update: {},
      create: {
        busNumber: 'TJ003',
        plateNumber: 'B 1236 TJ',
        routeId: routes[1].id,
        capacity: 50,
        currentLat: -6.1754,
        currentLng: 106.8272
      }
    }),
    prisma.bus.upsert({
      where: { busNumber: 'TJ004' },
      update: {},
      create: {
        busNumber: 'TJ004',
        plateNumber: 'B 1237 TJ',
        routeId: routes[2].id,
        capacity: 50,
        currentLat: -6.1584,
        currentLng: 106.7089
      }
    }),
    prisma.bus.upsert({
      where: { busNumber: 'TJ005' },
      update: {},
      create: {
        busNumber: 'TJ005',
        plateNumber: 'B 1238 TJ',
        routeId: routes[3].id,
        capacity: 50,
        currentLat: -6.2088,
        currentLng: 106.8456
      }
    })
  ]);

  console.log('✅ Buses created');

  // Create cameras
  const cameras = await Promise.all([
    prisma.camera.upsert({
      where: { deviceId: 'CAM001' },
      update: {},
      create: {
        busId: buses[0].id,
        deviceId: 'CAM001',
        location: 'front_door',
        lastPing: new Date()
      }
    }),
    prisma.camera.upsert({
      where: { deviceId: 'CAM002' },
      update: {},
      create: {
        busId: buses[0].id,
        deviceId: 'CAM002',
        location: 'back_door',
        lastPing: new Date()
      }
    }),
    prisma.camera.upsert({
      where: { deviceId: 'CAM003' },
      update: {},
      create: {
        busId: buses[1].id,
        deviceId: 'CAM003',
        location: 'front_door',
        lastPing: new Date()
      }
    }),
    prisma.camera.upsert({
      where: { deviceId: 'CAM004' },
      update: {},
      create: {
        busId: buses[2].id,
        deviceId: 'CAM004',
        location: 'front_door',
        lastPing: new Date()
      }
    }),
    prisma.camera.upsert({
      where: { deviceId: 'CAM005' },
      update: {},
      create: {
        busId: buses[3].id,
        deviceId: 'CAM005',
        location: 'front_door',
        lastPing: new Date()
      }
    })
  ]);

  console.log('✅ Cameras created');

  // Create sample occupancy data
  const occupancyData = [
    { busId: buses[0].id, count: 35, source: 'camera' },
    { busId: buses[1].id, count: 42, source: 'camera' },
    { busId: buses[2].id, count: 28, source: 'camera' },
    { busId: buses[3].id, count: 15, source: 'camera' },
    { busId: buses[4].id, count: 38, source: 'camera' }
  ];

  for (const occupancy of occupancyData) {
    await prisma.occupancy.create({
      data: occupancy
    });
  }

  console.log('✅ Sample occupancy data created');

  // Create sample alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        type: 'CAPACITY_LIMIT',
        busId: buses[1].id,
        message: 'Bus TJ002 is at 84% capacity',
        severity: 'HIGH'
      }
    }),
    prisma.alert.create({
      data: {
        type: 'MAINTENANCE',
        busId: buses[3].id,
        message: 'Bus TJ004 requires maintenance',
        severity: 'MEDIUM'
      }
    })
  ]);

  console.log('✅ Sample alerts created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Data Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Routes: ${await prisma.route.count()}`);
  console.log(`- Stations: ${await prisma.station.count()}`);
  console.log(`- Buses: ${await prisma.bus.count()}`);
  console.log(`- Cameras: ${await prisma.camera.count()}`);
  console.log(`- Occupancy Records: ${await prisma.occupancy.count()}`);
  console.log(`- Alerts: ${await prisma.alert.count()}`);
  
  console.log('\n🔑 Default Login Credentials:');
  console.log('Admin: admin@transjakarta.com / admin123');
  console.log('Guard: guard@transjakarta.com / guard123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 