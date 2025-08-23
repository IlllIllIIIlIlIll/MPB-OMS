
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Bus } from '../types/navigation';
import { busStops, initialBuses } from '../data/busStops';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Content from '../components/Content';

const { height, width } = Dimensions.get('window');

// Map coordinates for stations (based on the actual Map.jpg layout)
const mapStations = [
  { id: 'stop-1', name: 'Halte Karet', x: 0.96, y: 0.15, type: 'station' },
  { id: 'stop-2', name: 'Halte Karet Semanggi', x: 0.85, y: 0.33, type: 'station' },
  { id: 'stop-3', name: 'Halte Senayan', x: 0.53, y: 0.45, type: 'station' },
  { id: 'stop-4', name: 'Halte Selong', x: 0.20, y: 0.68, type: 'station' },
  { id: 'stop-5', name: 'Halte Gunung', x: 0.36, y: 0.72, type: 'station' },
  { id: 'stop-6', name: 'Halte Harmoni', x: 1.1, y: 0.35, type: 'station' },
  { id: 'stop-7', name: 'Halte Juanda', x: 0.86, y: 0.86, type: 'station' },
  { id: 'stop-8', name: 'Halte Gambir', x: 0.68, y: 1.03, type: 'station' },
];

const MainMenuScreen: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [occupancyDisplayText, setOccupancyDisplayText] = useState('37 / 40');

  return (
    <View style={styles.container}>
      {/* Map Body - Fills entire screen, no flex expansion */}
      <View style={styles.mapBodyContainer}>
        <Content
          buses={buses}
          occupancyDisplayText={occupancyDisplayText}
          mapStations={mapStations}
        />
      </View>

      {/* Footer - Layered above map with high z-index */}
      <View style={styles.footerContainer}>
        <Footer />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    height: height,
    width: width,
    position: 'relative', // For proper layering
  },
  mapBodyContainer: {
    // No flex - fills entire screen
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Below footer
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Above map
  },
});

export default MainMenuScreen;
