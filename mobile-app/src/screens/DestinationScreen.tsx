import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, RouteOptimizationSuggestion } from '../types/navigation';
import { popularDestinations } from '../data/busStops';

type DestinationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Destination'>;
type DestinationScreenRouteProp = RouteProp<RootStackParamList, 'Destination'>;

const { width, height } = Dimensions.get('window');

const DestinationScreen: React.FC = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RouteOptimizationSuggestion | null>(null);
  
  const navigation = useNavigation<DestinationScreenNavigationProp>();
  const route = useRoute<DestinationScreenRouteProp>();

  // Mock route optimization suggestions
  const routeSuggestions: RouteOptimizationSuggestion[] = [
    {
      routeId: 'route-1',
      routeName: 'Blok M - Bundaran HI',
      estimatedOccupancy: 60,
      estimatedTime: 25,
      reason: 'Less crowded route with good timing',
    },
    {
      routeId: 'route-2', 
      routeName: 'Senayan - Monas',
      estimatedOccupancy: 45,
      estimatedTime: 30,
      reason: 'Optimal route with lowest occupancy',
    },
    {
      routeId: 'route-3',
      routeName: 'Direct Route',
      estimatedOccupancy: 85,
      estimatedTime: 20,
      reason: 'Fastest but more crowded',
    },
  ];

  // Show modal when screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for optimization modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOptimizationModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleOptimizationDecline();
    }
    return () => clearInterval(interval);
  }, [showOptimizationModal, countdown]);

  const handleSubmitDestination = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Error', 'Please enter both pickup and destination locations');
      return;
    }

    setShowModal(false);
    
    // Show optimization modal after a short delay
    setTimeout(() => {
      setShowOptimizationModal(true);
      setCountdown(5);
    }, 1000);
  };

  const handleOptimizationAccept = () => {
    setShowOptimizationModal(false);
    Alert.alert(
      'Route Optimized!', 
      `We'll guide you to the best route: ${selectedSuggestion?.routeName || 'Optimized Route'}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleOptimizationDecline = () => {
    setShowOptimizationModal(false);
    Alert.alert(
      'Route Set!', 
      'Taking you to the direct route.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleDestinationSelect = (destination: string) => {
    setToLocation(destination);
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return '#FF5722';
    if (occupancy >= 60) return '#FF9800';
    if (occupancy >= 40) return '#FFC107';
    return '#4CAF50';
  };

  const renderDestinationItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.destinationItem}
      onPress={() => handleDestinationSelect(item)}
    >
      <Text style={styles.destinationText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }: { item: RouteOptimizationSuggestion }) => (
    <TouchableOpacity
      style={[
        styles.suggestionCard,
        selectedSuggestion?.routeId === item.routeId && styles.selectedSuggestion
      ]}
      onPress={() => setSelectedSuggestion(item)}
    >
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionRoute}>{item.routeName}</Text>
        <View style={[styles.occupancyBadge, { backgroundColor: getOccupancyColor(item.estimatedOccupancy) }]}>
          <Text style={styles.occupancyText}>{item.estimatedOccupancy}%</Text>
        </View>
      </View>
      <Text style={styles.suggestionTime}>⏱️ {item.estimatedTime} minutes</Text>
      <Text style={styles.suggestionReason}>{item.reason}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Journey</Text>
          <Text style={styles.subtitle}>Find the best route to your destination</Text>
        </View>

        {/* Location Inputs */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔵 From</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter pickup location"
              value={fromLocation}
              onChangeText={setFromLocation}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔴 To</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter destination"
              value={toLocation}
              onChangeText={setToLocation}
            />
          </View>
        </View>

        {/* Popular Destinations */}
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Destinations</Text>
          <FlatList
            data={popularDestinations}
            renderItem={renderDestinationItem}
            keyExtractor={(item) => item}
            numColumns={2}
            scrollEnabled={false}
          />
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSubmitDestination}>
          <Text style={styles.searchButtonText}>🔍 Find Route</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Initial Modal */}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Where are you going?</Text>
          <Text style={styles.modalSubtitle}>Let us help you find the best route</Text>
          
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="From (Current Location)"
              value={fromLocation}
              onChangeText={setFromLocation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="To (Destination)"
              value={toLocation}
              onChangeText={setToLocation}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalSubmitButton}
              onPress={handleSubmitDestination}
            >
              <Text style={styles.modalSubmitText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Optimization Modal */}
      <Modal
        isVisible={showOptimizationModal}
        onBackdropPress={handleOptimizationDecline}
        style={styles.modal}
      >
        <View style={styles.optimizationModalContent}>
          <View style={styles.optimizationHeader}>
            <Text style={styles.optimizationTitle}>🚀 Route Optimization</Text>
            <Text style={styles.optimizationSubtitle}>
              We found better routes with lower occupancy!
            </Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>Auto-decline in {countdown}s</Text>
            </View>
          </View>

          <FlatList
            data={routeSuggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.routeId}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.optimizationButtons}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={handleOptimizationDecline}
            >
              <Text style={styles.declineButtonText}>Use Direct Route</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.acceptButton,
                !selectedSuggestion && styles.disabledButton
              ]}
              onPress={handleOptimizationAccept}
              disabled={!selectedSuggestion}
            >
              <Text style={styles.acceptButtonText}>
                {selectedSuggestion ? 'Use This Route' : 'Select a Route'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  popularSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  destinationItem: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  destinationText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalInputContainer: {
    marginBottom: 25,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  optimizationModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.95,
    maxHeight: height * 0.8,
  },
  optimizationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  optimizationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optimizationSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  countdownContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  countdownText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  suggestionsList: {
    maxHeight: height * 0.4,
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSuggestion: {
    borderColor: '#2196F3',
    backgroundColor: '#F0F4FF',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionRoute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  occupancyBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  occupancyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  suggestionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  optimizationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    marginLeft: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  acceptButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DestinationScreen;
