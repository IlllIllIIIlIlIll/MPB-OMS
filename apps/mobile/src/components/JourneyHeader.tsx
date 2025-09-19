import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

interface JourneyHeaderProps {
  fromLocation: string;
  toLocation: string;
  setFromLocation: (text: string) => void;
  setToLocation: (text: string) => void;
  onBack: () => void;
}

const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  fromLocation,
  toLocation,
  setFromLocation,
  setToLocation,
  onBack,
}) => {
  return (
    <View style={styles.fixedHeader}>
      {/* Invisible back gesture area */}
      <TouchableOpacity 
        style={styles.backGestureArea} 
        onPress={onBack}
        activeOpacity={0.8}
      />

      {/* Journey Summary Card */}
      <View style={styles.journeyCard}>
        <View style={styles.journeyHeader}>
          <Text style={styles.journeyTitle}>Your Journey</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        
        {/* Editable Journey Inputs */}
        <View style={styles.journeyInputs}>
          {/* From Location Input */}
          <View style={styles.journeyInputRow}>
            <View style={styles.locationDot} />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.journeyInput}
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholder="From location"
                placeholderTextColor="#999"
              />
              {fromLocation.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setFromLocation('')}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.routeLine} />
          
          {/* To Location Input */}
          <View style={styles.journeyInputRow}>
            <View style={[styles.locationDot, styles.destinationDot]} />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.journeyInput}
                value={toLocation}
                onChangeText={setToLocation}
                placeholder="To location"
                placeholderTextColor="#999"
              />
              {toLocation.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setToLocation('')}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 1000,
  },
  backGestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 1000,
  },
  journeyCard: {
    backgroundColor: 'rgb(50, 65, 84)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  journeyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
  },
  journeyInputs: {
    alignItems: 'stretch',
  },
  journeyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 15,
  },
  destinationDot: {
    backgroundColor: '#FF5722',
  },
  routeLine: {
    width: 2,
    height: 15,
    backgroundColor: '#666',
    marginVertical: 2,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  journeyInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginLeft: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default JourneyHeader;
