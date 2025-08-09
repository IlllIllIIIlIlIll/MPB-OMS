import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../providers/AuthProvider';
import { RootStackParamList, Bus } from '../types/navigation';
import { busStops, initialBuses } from '../data/busStops';
import { occupancyService } from '../services/occupancyService';

type MainMenuNavigationProp = StackNavigationProp<RootStackParamList, 'MainMenu'>;

const { width } = Dimensions.get('window');

const MainMenuScreen: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [refreshing, setRefreshing] = useState(false);
  const [occupancyDisplayText, setOccupancyDisplayText] = useState('37 / 40');
  
  const navigation = useNavigation<MainMenuNavigationProp>();
  const { user, logout } = useAuth();

  // Simulate bus movement every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          const currentStopIndex = busStops.findIndex(stop => stop.id === bus.currentStopId);
          const nextStopIndex = (currentStopIndex + 1) % busStops.length;
          const nextStop = busStops[nextStopIndex];
          
          // Simulate occupancy changes
          const occupancyChange = Math.floor(Math.random() * 10) - 5; // -5 to +5
          const newOccupancy = Math.max(0, Math.min(bus.capacity, bus.occupancy + occupancyChange));
          
          return {
            ...bus,
            currentStopId: nextStop.id,
            occupancy: newOccupancy,
            isMoving: true,
          };
        })
      );

      // Update the occupancy display text with random values
      const randomOccupancy = Math.floor(Math.random() * 40) + 1;
      setOccupancyDisplayText(`${randomOccupancy} / 40`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refreshing data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch fresh data here
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDestinationPress = () => {
    navigation.navigate('Destination');
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return '#FF5722'; // Red - very crowded
    if (percentage >= 70) return '#FF9800'; // Orange - crowded  
    if (percentage >= 50) return '#FFC107'; // Yellow - moderate
    return '#4CAF50'; // Green - comfortable
  };

  const getOccupancyStatus = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'Very Crowded';
    if (percentage >= 70) return 'Crowded';
    if (percentage >= 50) return 'Moderate';
    return 'Comfortable';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}</Text>
          <Text style={styles.subtitleText}>Track your bus in real-time</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Occupancy Display Card */}
        <View style={styles.occupancyCard}>
          <Text style={styles.occupancyTitle}>Current Bus Occupancy</Text>
          <View style={styles.occupancyDisplay}>
            <Text style={styles.occupancyNumber}>{occupancyDisplayText}</Text>
          </View>
          <Text style={styles.occupancySubtext}>Passengers / Capacity</Text>
        </View>

        {/* Bus Route Section */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionTitle}>Bus Route Status</Text>
          <Text style={styles.sectionSubtitle}>Live tracking of TransJakarta buses</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.busStopsContainer}>
            {busStops.map((stop, index) => {
              const busAtStop = buses.find(bus => bus.currentStopId === stop.id);
              return (
                <TouchableOpacity 
                  key={stop.id} 
                  style={styles.busStopCard}
                  onPress={() => {/* Handle stop selection */}}
                >
                  <View style={styles.busStopHeader}>
                    <Text style={styles.busStopName}>{stop.name}</Text>
                    {busAtStop && (
                      <View style={[styles.busIndicator, { backgroundColor: getOccupancyColor(busAtStop.occupancy, busAtStop.capacity) }]}>
                        <Text style={styles.busName}>{busAtStop.name}</Text>
                        <Text style={styles.busOccupancy}>
                          {busAtStop.occupancy}/{busAtStop.capacity}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {busAtStop && (
                    <View style={styles.busStatus}>
                      <Text style={styles.statusText}>
                        {getOccupancyStatus(busAtStop.occupancy, busAtStop.capacity)}
                      </Text>
                    </View>
                  )}
                  
                  {!busAtStop && (
                    <View style={styles.noBusIndicator}>
                      <Text style={styles.noBusText}>No bus</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleDestinationPress}
          >
            <Text style={styles.primaryButtonText}>🎯 Your Destination</Text>
          </TouchableOpacity>

          {/* Inactive buttons as requested */}
          <View style={styles.inactiveButtonsGrid}>
            <TouchableOpacity style={styles.inactiveButton} disabled>
              <Text style={styles.inactiveButtonText}>📍 Nearby Stops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inactiveButton} disabled>
              <Text style={styles.inactiveButtonText}>🕒 Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inactiveButton} disabled>
              <Text style={styles.inactiveButtonText}>💳 Top Up Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inactiveButton} disabled>
              <Text style={styles.inactiveButtonText}>📈 Trip History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  occupancyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  occupancyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  occupancyDisplay: {
    backgroundColor: '#FF5722',
    borderRadius: 50,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 10,
  },
  occupancyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  occupancySubtext: {
    fontSize: 14,
    color: '#666',
  },
  routeSection: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  busStopsContainer: {
    paddingVertical: 10,
  },
  busStopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busStopHeader: {
    marginBottom: 10,
  },
  busStopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  busIndicator: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  busName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  busOccupancy: {
    fontSize: 12,
    color: 'white',
    marginTop: 2,
  },
  busStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noBusIndicator: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  noBusText: {
    fontSize: 14,
    color: '#999',
  },
  actionSection: {
    marginTop: 25,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inactiveButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inactiveButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  inactiveButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MainMenuScreen;
