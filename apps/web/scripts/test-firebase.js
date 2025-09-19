// Simple script to test Firebase connection
// Run with: node scripts/test-firebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOA1Pq4m23ZwtvLQvp6YDRr3Hluwqx4ek",
  authDomain: "crowd-ease-4080d.firebaseapp.com",
  projectId: "crowd-ease-4080d",
  storageBucket: "crowd-ease-4080d.firebasestorage.app",
  messagingSenderId: "863366897412",
  appId: "1:863366897412:web:0c33e722506bbb62d7fa51",
  measurementId: "G-Q3CBZ13Z4C"
};

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test Firestore connection
    console.log('📊 Testing Firestore connection...');
    const busesSnapshot = await getDocs(collection(db, 'buses'));
    console.log(`✅ Found ${busesSnapshot.size} buses in Firestore`);
    
    const occupancySnapshot = await getDocs(collection(db, 'occupancy'));
    console.log(`✅ Found ${occupancySnapshot.size} occupancy records in Firestore`);
    
    // Display sample data
    if (busesSnapshot.size > 0) {
      console.log('\n📋 Sample bus data:');
      busesSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}: ${doc.data().busCode} (${doc.data().routeName})`);
      });
    }
    
    if (occupancySnapshot.size > 0) {
      console.log('\n📊 Sample occupancy data:');
      occupancySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.busId}: ${data.occupancy}/${data.capacity} passengers`);
      });
    }
    
    console.log('\n🎉 Firebase connection test successful!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();
