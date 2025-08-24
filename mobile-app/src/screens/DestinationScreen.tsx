import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import JourneyHeader from '../components/JourneyHeader';

type DestinationNavigationProp = StackNavigationProp<RootStackParamList, 'Destination'>;
type DestinationRouteProp = RouteProp<RootStackParamList, 'Destination'>;

const { width, height } = Dimensions.get('window');

const DestinationScreen: React.FC = () => {
  const navigation = useNavigation<DestinationNavigationProp>();
  const route = useRoute<DestinationRouteProp>();
  const { width } = Dimensions.get('window');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [fromLocation, setFromLocation] = useState(route.params?.from || 'My Location');
  const [toLocation, setToLocation] = useState(route.params?.to || 'Destination');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [bestRoute, setBestRoute] = useState<any>(null);
  
  // Animation values for smooth interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const routeCardAnims = useRef<Animated.Value[]>([]).current;

  // Initialize route card animations
  useEffect(() => {
    routeCardAnims.splice(0, routeCardAnims.length);
    for (let i = 0; i < 4; i++) {
      routeCardAnims.push(new Animated.Value(0));
    }
  }, []);

  // Smooth entrance animation
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered route card animations
    routeCardAnims.forEach((anim: Animated.Value, index: number) => {
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, index * 150);
    });

    // Show route recommendation after animations
    setTimeout(() => {
      const best = findBestRoute();
      setShowRecommendation(true);
      
      // Animate progress bar from 100% to 0% over 2.5 seconds
      progressAnim.setValue(1);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5500,
        useNativeDriver: false,
      }).start();
      
      // Auto-hide after 2.5 seconds
      setTimeout(() => {
        setShowRecommendation(false);
      }, 5500);
    }, 1000);
  }, []);

  const handleBack = () => {
    // Smooth exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  const handleRouteSelect = (routeId: number) => {
    setSelectedRoute(routeId);
    
    // Visual feedback for route selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Sophisticated TransJakarta route scoring algorithm
  // Prioritizes crowd count over time using logistic functions
  const calculateRouteScore = (route: any) => {
    // Parse time to minutes (e.g., "45 minutes" -> 45, "1 hour 15 minutes" -> 75)
    let totalMinutes = 0;
    
    if (route.time.includes('hour')) {
      const hourMatch = route.time.match(/(\d+)\s*hour/);
      const minuteMatch = route.time.match(/(\d+)\s*minutes?/);
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
      totalMinutes = hours * 60 + minutes;
    } else {
      const minuteMatch = route.time.match(/(\d+)\s*minutes?/);
      totalMinutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    }
    
    // Convert crowd level to load ratio (L)
    const crowdToLoadRatio: { [key: string]: number } = {
      'Low': 0.3,      // 30% capacity
      'Medium': 0.6,   // 60% capacity  
      'High': 0.85     // 85% capacity (near crush-load)
    };
    
    const loadRatioL = crowdToLoadRatio[route.crowdLevel as string] || 0.6;
    
    // Mode factor r (TransJakarta service type)
    // Assuming mixed BRT/MetroTrans routes
    const modeR = 0.98; // Average of BRT (1.00) and MetroTrans (0.95)
    
    // Preference weight α (how much you care about crowding vs waiting)
    const alpha = 0.7; // Prioritize comfort over wait time
    
    // Algorithm parameters
    const L0 = 0.75;   // Sharp pain once load >75%
    const kL = 0.08;   // Crowding sensitivity
    const T0 = 6;      // Waiting beyond ~6 min starts to feel bad
    const kT = 2.5;    // Time sensitivity
    const gamma = 0.35; // Strongly punish near-full vehicles
    
    // Logistic function
    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
    
    // Calculate penalties
    const crowdingPenalty = sigmoid((loadRatioL - L0) / kL);
    const etaPenalty = sigmoid((totalMinutes - T0) / kT);
    const nearFullKicker = sigmoid((loadRatioL - 0.95) / 0.02);
    
    // Final score (0-100, higher = better choice)
    let score = 100 * modeR * 
      (1 - (alpha * crowdingPenalty + (1 - alpha) * etaPenalty)) * 
      (1 - gamma * nearFullKicker);
    
    // Clamp to [0, 100]
    score = Math.max(0, Math.min(100, score));
    
    return {
      ...route,
      score: score,
      totalMinutes,
      loadRatioL,
      crowdingPenalty,
      etaPenalty,
      nearFullKicker
    };
  };

  const findBestRoute = () => {
    const scoredRoutes = mockRoutes.map(calculateRouteScore);
    
    // Debug logging
    console.log('Route Scoring Results:');
    scoredRoutes.forEach(route => {
      console.log(`Route ${route.id}: Time=${route.totalMinutes}min, Crowd=${route.crowdLevel}, LoadRatio=${route.loadRatioL.toFixed(2)}, Score=${route.score.toFixed(1)}`);
    });
    
    const best = scoredRoutes.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );
    
    console.log(`Best Route Selected: Route ${best.id} with score ${best.score.toFixed(1)}`);
    setBestRoute(best);
    return best;
  };

  const mockRoutes = [
    {
      id: 1,
      path: ['🚶', '→', '🚌', '1P', '→', '🚶', '→', '🚇', '→', '...'],
      time: '38 minutes',
      cost: 'Rp 5000',
      distance: '16.0 km',
      isFastest: false,
      reliability: '95%',
      crowdLevel: 'High',
    },
    {
      id: 2,
      path: ['🚶', '→', '🚌', '2P', '→', '🚶', '→', '🚇', '→', '🚌', '3P', '→', '...'],
      time: '52 minutes',
      cost: 'Rp 8000',
      distance: '16.8 km',
      isFastest: false,
      reliability: '92%',
      crowdLevel: 'Low',
    },
    {
      id: 3,
      path: ['🚶', '→', '🚌', '4P', '→', '🚶', '→', '...'],
      time: '1 hour 15 minutes',
      cost: 'Rp 4000',
      distance: '17.2 km',
      isFastest: false,
      reliability: '88%',
      crowdLevel: 'Medium',
    },
    {
      id: 4,
      path: ['🚶', '→', '🚌', '5P', '→', '🚶', '→', '🚇', '→', '🚌', '6P', '→', '🚌', '7P', '→', '...'],
      time: '1 hour 32 minutes',
      cost: 'Rp 12000',
      distance: '17.8 km',
      isFastest: false,
      reliability: '85%',
      crowdLevel: 'Low',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fixed Header Component */}
      <JourneyHeader
        fromLocation={fromLocation}
        toLocation={toLocation}
        setFromLocation={setFromLocation}
        setToLocation={setToLocation}
        onBack={handleBack}
      />

      {/* Route Recommendation Modal */}
      {showRecommendation && bestRoute && (
        <Animated.View 
          style={[
            styles.recommendationModal,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.recommendationContent}
            onPress={() => {
              setSelectedRoute(bestRoute.id);
              setShowRecommendation(false);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.recommendationQuestion}>Wanna take fastest, less crowded route?</Text>
            
            {/* Duration Expiry Bar */}
            <View style={styles.expiryBarContainer}>
              <View style={styles.expiryBar}>
                <Animated.View 
                  style={[
                    styles.expiryProgress, 
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: progressAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: ['#FF0000', '#FFA500', '#00FF00']
                      })
                    }
                  ]} 
            />
          </View>
        </View>
        </TouchableOpacity>
        </Animated.View>
      )}

      {/* Scrollable Route Cards - SIMPLE AND CLEAN */}
      <ScrollView 
        style={styles.routesScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.routesContent}
      >
        {mockRoutes.map((route, index) => (
          <Animated.View 
            key={route.id} 
            style={[
              styles.routeCard,
              selectedRoute === route.id && styles.selectedRouteCard,
              {
                opacity: routeCardAnims[index] || 0,
                transform: [{
                  scale: routeCardAnims[index] || 0
                }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.routeCardTouchable}
              onPress={() => handleRouteSelect(route.id)}
              activeOpacity={0.9}
            >
              {/* Route Header with Smart Indicators */}
              <View style={styles.routeHeader}>
                <View style={styles.routePath}>
                  {route.path.map((item, pathIndex) => (
                    <Text key={pathIndex} style={styles.pathItem}>
                      {item}
            </Text>
                  ))}
            </View>
          </View>

              {/* Estimated Time - Prominent Display */}
              <Text style={styles.estimatedTime}>{route.time}</Text>
              
              {/* Smart Route Details */}
              <View style={styles.routeDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.costButton}>
                    <Text style={styles.costText}>{route.cost}</Text>
                  </View>
                  <View style={styles.distanceButton}>
                    <Text style={styles.distanceText}>{route.distance}</Text>
                  </View>
                  <View style={styles.statusCircle}>
                    <View style={[
                      styles.statusIndicator,
                      route.crowdLevel === 'High' && styles.statusHigh,
                      route.crowdLevel === 'Medium' && styles.statusMedium,
                      route.crowdLevel === 'Low' && styles.statusLow
                    ]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  routesScrollView: {
    flex: 1,
  },
  routesContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  routeCard: {
    backgroundColor: '#324154',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  selectedRouteCard: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  routeCardTouchable: {
    padding: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  routePath: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  pathItem: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  estimatedTime: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  routeDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 0,
    minWidth: 80,
  },
  costText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
  },
  distanceButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 0,
    minWidth: 80,
  },
  distanceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  reliabilityButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 1,
  },
  reliabilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  crowdButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flex: 1,
  },
  crowdHigh: {
    backgroundColor: '#FF5722',
  },
  crowdMedium: {
    backgroundColor: '#FF9800',
  },
  crowdText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    marginLeft: 'auto',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusHigh: {
    backgroundColor: '#FF5722',
  },
  statusMedium: {
    backgroundColor: '#FF9800',
  },
  statusLow: {
    backgroundColor: '#4CAF50',
  },
  recommendationModal: {
    position: 'absolute',
    bottom: 230,
    left: 20,
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 8,
    padding: 1,
    width: width * 0.8,
    alignItems: 'center',
    zIndex: 9999,
  },
  recommendationContent: {
    alignItems: 'center',
  },
  recommendationQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'grey',
    marginBottom: 10,
    textAlign: 'center',
  },
  expiryBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  expiryBar: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  expiryProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default DestinationScreen;


