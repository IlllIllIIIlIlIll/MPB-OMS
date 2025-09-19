import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import InteractiveMap from './InteractiveMap';

type ContentNavigationProp = StackNavigationProp<RootStackParamList, 'MainMenu'>;

const { width } = Dimensions.get('window');

interface ContentProps {
  buses: any[];
  occupancyDisplayText: string;
  mapStations: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    type: string;
  }>;
}

const Content: React.FC<ContentProps> = ({
  buses,
  occupancyDisplayText,
  mapStations
}) => {
  const navigation = useNavigation<ContentNavigationProp>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [focusedInput, setFocusedInput] = useState<'from' | 'to' | null>(null);
  
  const expandAnim = useRef(new Animated.Value(0)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const searchButtonOpacity = useRef(new Animated.Value(1)).current;
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null);
  const fromInputRef = useRef<TextInput>(null);
  const toInputRef = useRef<TextInput>(null);

  const handlePointPress = (point: any) => {
    // Handle point press if needed
    console.log('Point pressed:', point);
  };

  const closeSearchInterface = () => {
    if (isExpanded) {
      Animated.parallel([
        Animated.timing(inputOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(expandAnim, {
          toValue: 0,
          duration: 400,
          delay: 100,
          useNativeDriver: false,
        }),
        Animated.timing(searchButtonOpacity, {
          toValue: 1,
          duration: 300,
          delay: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setIsExpanded(false);
        setFromLocation('');
        setToLocation('');
        setFocusedInput(null);
      });
    }
  };

  const resetAutoCloseTimer = () => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
    }
    autoCloseTimer.current = setTimeout(() => {
      closeSearchInterface();
    }, 3000); // 3 seconds
  };

  const handleSearchPress = () => {
    if (!isExpanded) {
      // Expand the search interface - hide button, show inputs
      setIsExpanded(true);
      Animated.parallel([
        Animated.timing(searchButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(expandAnim, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: false,
        }),
        Animated.timing(inputOpacity, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        resetAutoCloseTimer(); // Start auto-close timer
        // Focus the first input after expansion
        setTimeout(() => {
          fromInputRef.current?.focus();
        }, 500);
      });
    } else {
      closeSearchInterface();
    }
  };

  const handleInputFocus = (inputType: 'from' | 'to') => {
    setFocusedInput(inputType);
    resetAutoCloseTimer(); // Reset timer when input is focused
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
    resetAutoCloseTimer(); // Reset timer when input loses focus
  };

  const handleInputChange = (text: string, inputType: 'from' | 'to') => {
    if (inputType === 'from') {
      setFromLocation(text);
    } else {
      setToLocation(text);
    }
    resetAutoCloseTimer(); // Reset timer on any input change
  };

  const handleInputSubmit = (inputType: 'from' | 'to') => {
    if (inputType === 'from' && fromLocation.trim()) {
      // If from input is filled, switch to to input
      toInputRef.current?.focus();
    } else if (inputType === 'to' && toLocation.trim()) {
      // If to input is filled, check if both are complete
      if (fromLocation.trim() && toLocation.trim()) {
        // Both inputs are filled, navigate to destination
        navigation.navigate('Destination' as any, {
          from: fromLocation.trim(),
          to: toLocation.trim()
        });
      }
    }
  };

  const handleFindRoute = () => {
    if (fromLocation && toLocation) {
      navigation.navigate('Destination' as any, {
        from: fromLocation.trim(),
        to: toLocation.trim()
      });
    }
  };

  // Auto-navigate when both inputs are filled (after user completes second input)
  useEffect(() => {
    if (fromLocation.trim() && toLocation.trim()) {
      // Small delay to allow user to see both inputs are filled
      const timer = setTimeout(() => {
        navigation.navigate('Destination' as any, {
          from: fromLocation.trim(),
          to: toLocation.trim()
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fromLocation, toLocation, navigation]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, []);

  const expandedWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.85], // From 0 to 85% of screen width
  });

  const leftPosition = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width - 76, 20], // From right side to left side
  });

  return (
    <View style={styles.content}>
      {/* Interactive Map - Fills entire body */}
      <InteractiveMap
        mapStations={mapStations}
        buses={buses}
        busStops={[]}
        onPointPress={handlePointPress}
      />
      
      {/* Clean Search Button - Only visible when not expanded */}
      <Animated.View 
        style={[
          styles.searchButtonContainer,
          { opacity: searchButtonOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Expanding Input Interface - Only visible when expanded */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            width: expandedWidth,
            left: leftPosition,
            opacity: expandAnim,
          }
        ]}
      >
        {/* Expanding Input Fields */}
        <Animated.View 
          style={[
            styles.inputsContainer,
            {
              opacity: inputOpacity,
            }
          ]}
        >
          {/* From Location Input */}
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⭕</Text>
            <View style={styles.inputWithSearch}>
              <TextInput
                ref={fromInputRef}
                style={styles.inputField}
                placeholder="From"
                value={fromLocation}
                onChangeText={(text) => handleInputChange(text, 'from')}
                placeholderTextColor="#999"
                onFocus={() => handleInputFocus('from')}
                onBlur={handleInputBlur}
                onSubmitEditing={() => handleInputSubmit('from')}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              {focusedInput === 'from' && (
                <TouchableOpacity style={styles.inputSearchButton}>
                  <Text style={styles.inputSearchIcon}>🔍</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* To Location Input */}
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📍</Text>
            <View style={styles.inputWithSearch}>
              <TextInput
                ref={toInputRef}
                style={styles.inputField}
                placeholder="To"
                value={toLocation}
                onChangeText={(text) => handleInputChange(text, 'to')}
                placeholderTextColor="#999"
                onFocus={() => handleInputFocus('to')}
                onBlur={handleInputBlur}
                onSubmitEditing={() => handleInputSubmit('to')}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              {focusedInput === 'to' && (
                <TouchableOpacity style={styles.inputSearchButton}>
                  <Text style={styles.inputSearchIcon}>🔍</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Invisible overlay to detect taps outside */}
      {isExpanded && (
        <TouchableWithoutFeedback onPress={closeSearchInterface}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    // No flex - fill entire container
    width: '100%',
    height: '100%',
    paddingHorizontal: 0, // No horizontal padding
    paddingBottom: 0, // No bottom padding
    position: 'relative', // For proper layering
  },
  searchButtonContainer: {
    position: 'absolute',
    bottom: 100, // Position above footer area
    right: 20,
    zIndex: 3000, // Increased from 2000 to be above the expanding container
  },
  searchButton: {
    width: 56,
    height: 56,
    backgroundColor: '#174d9c',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 24,
    color: 'white',
  },
  searchContainer: {
    position: 'absolute',
    bottom: 100, // Position above footer area
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 40% transparency (60% opacity)
    borderRadius: 28,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2000, // Above everything including footer
    overflow: 'hidden', // Smooth expansion effect
  },
  inputsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 15, // Increased spacing between inputs
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#174d9c',
  },
  inputWithSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputField: {
    flex: 1,
    height: 40,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8, // Less rounded - changed from 20 to 8
    paddingHorizontal: 12,
    paddingRight: 40, // Space for search icon
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  inputSearchButton: {
    position: 'absolute',
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSearchIcon: {
    fontSize: 14,
    color: '#174d9c',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1500, // Below search container but above other content
  },
});

export default Content;
