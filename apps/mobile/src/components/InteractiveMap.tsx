import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Image } from 'react-native';
import { BusStop, Bus } from '../types/navigation';

const { width, height } = Dimensions.get('window');

interface InteractiveMapProps {
  mapStations: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    type: string;
  }>;
  buses: Bus[];
  busStops: BusStop[];
  onPointPress: (point: any) => void;
}

interface BusAnimation {
  busId: string;
  fromStation: any;
  toStation: any;
  progress: number;
  direction: number;
  speed: number;
  currentStationIndex: number;
  busDirection: number; // 0 = ascending, 1 = descending
  stopTime: number; // Time bus spends at a station
  isStopped: boolean;
  stopTimer: number;
  etaMinutes: number; // Added for dynamic ETA
  routePath: number[]; // Store route path for movement logic
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mapStations,
  buses,
  busStops,
  onPointPress
}) => {
  const [selectedPoint, setSelectedPoint] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalPosition, setModalPosition] = React.useState({ x: 0, y: 0 });
  const [busAnimations, setBusAnimations] = React.useState<BusAnimation[]>([]);
  const [activeBuses, setActiveBuses] = React.useState<Bus[]>([]);
  const [screenDimensions, setScreenDimensions] = React.useState({ width, height });
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const busSpawnTimerRef = useRef<NodeJS.Timeout>();
  const modalAutoCloseTimerRef = useRef<NodeJS.Timeout>();

  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  // Calculate dynamic zoom scale based on screen dimensions
  const getZoomScale = () => {
    const baseWidth = 375; // Base width for reference
    const baseHeight = 667; // Base height for reference
    
    const widthRatio = screenDimensions.width / baseWidth;
    const heightRatio = screenDimensions.height / baseHeight;
    
    // Use the larger ratio to ensure the map always fills the screen
    const scale = Math.max(widthRatio, heightRatio);
    
    // Add some extra zoom for fun - minimum 1.0x, maximum 2.5x
    // But limit the zoom to prevent affecting footer area
    return Math.min(Math.max(scale * 1.1, 1.0), 2.0);
  };

  const handlePointPress = (point: any) => {
    setSelectedPoint(point);
    
    // Calculate modal position based on point location
    let x, y;
    if (point.type === 'station') {
      // For stations, position modal near the station point
      x = Math.min(point.x * 100, 70); // Don't go too far right
      y = Math.min(point.y * 100, 70); // Don't go too far down
    } else {
      // For buses, position modal near the bus position
      const busAnimation = busAnimations.find(anim => anim.busId === point.id);
      if (busAnimation) {
        const position = getBusPosition(busAnimation);
        x = Math.min(position.x, 70);
        y = Math.min(position.y, 70);
      } else {
        x = 50;
        y = 50;
      }
    }
    
    setModalPosition({ x, y });
    setShowModal(true);
    onPointPress(point);
    
    // Auto-close modal after 3 seconds
    if (modalAutoCloseTimerRef.current) {
      clearTimeout(modalAutoCloseTimerRef.current);
    }
    modalAutoCloseTimerRef.current = setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  // Spawn new buses with random intervals (minimum 7 seconds gap)
  useEffect(() => {
    const spawnBus = () => {
      if (activeBuses.length < 5) {
        // Randomly choose direction: ascending (0) or descending (1)
        const direction = Math.floor(Math.random() * 2);
        
        // Define specific routes for each bus type
        const busTypes = [
          { 
            type: 'orange', 
            route: [1, 2, 3, 4],      // Orange: route 1-2-3-4
            color: '#FF9800'
          },
          { 
            type: 'red', 
            route: [1, 2, 6, 7, 8],   // Red: route 1-2-6-7-8 (skips 3,4,5)
            color: '#FF5722'
          },
          { 
            type: 'cyan', 
            route: [4, 5, 7, 8],      // Cyan: route 4-5-7-8 (skips 6)
            color: '#00BCD4'
          }
        ];
        const selectedType = busTypes[Math.floor(Math.random() * busTypes.length)];
        
        // Determine start station based on route and direction
        let startStationIndex;
        if (direction === 0) { // Ascending
          startStationIndex = selectedType.route[0] - 1; // Convert to 0-based index
        } else { // Descending
          startStationIndex = selectedType.route[selectedType.route.length - 1] - 1; // Convert to 0-based index
        }
        
        // Generate random bus speed with variation
        const baseSpeed = 0.3; // Base speed
        const speedVariation = 0.15; // ±15% variation
        const randomSpeed = baseSpeed + (Math.random() * speedVariation * 2 - speedVariation);
        const finalSpeed = Math.max(0.1, Math.min(0.6, randomSpeed)); // Clamp between 0.1 and 0.6
        
        const newBus: Bus = {
          id: `bus-${Date.now()}`,
          name: `TJ-${Math.floor(Math.random() * 999) + 1}`,
          currentStopId: mapStations[startStationIndex].id,
          occupancy: Math.floor(Math.random() * 40) + 1,
          capacity: 40,
          isMoving: true,
          route: [],
          direction: direction, // 0 = ascending, 1 = descending
          speed: finalSpeed, // Individual bus speed
          busType: selectedType.type, // Add bus type
          routePath: selectedType.route, // Add route path
          routeColor: selectedType.color, // Add route color for track code background
        };
        
        setActiveBuses(prev => [...prev, newBus]);
      }
    };

    const scheduleNextSpawn = () => {
      // Minimum 7 seconds gap between spawns
      const minInterval = 4000;
      const randomAdditional = Math.random() * 1000; // 0 to 3 additional seconds
      const totalInterval = minInterval + randomAdditional;
      
      busSpawnTimerRef.current = setTimeout(() => {
        spawnBus();
        scheduleNextSpawn();
      }, totalInterval);
    };

    scheduleNextSpawn();

    return () => {
      if (busSpawnTimerRef.current) {
        clearTimeout(busSpawnTimerRef.current);
      }
    };
  }, [activeBuses.length, mapStations]);

  // Cleanup effect for modal auto-close timer
  useEffect(() => {
    return () => {
      if (modalAutoCloseTimerRef.current) {
        clearTimeout(modalAutoCloseTimerRef.current);
      }
    };
  }, []);

  // Initialize bus animations for active buses
  useEffect(() => {
    // Only initialize animations for NEW buses that don't have animations yet
    const existingBusIds = busAnimations.map(anim => anim.busId);
    const newBuses = activeBuses.filter(bus => !existingBusIds.includes(bus.id));
    
    if (newBuses.length === 0) return; // No new buses to initialize
    
    const newAnimations: BusAnimation[] = newBuses.map(bus => {
      if (!bus.routePath || bus.routePath.length === 0) return null;
      
      // Find current station in the route
      const currentRouteIndex = bus.routePath.findIndex(stationNum => 
        mapStations[stationNum - 1]?.id === bus.currentStopId
      );
      
      if (currentRouteIndex === -1) return null;
      
      const currentStation = mapStations[bus.routePath[currentRouteIndex] - 1];
      const nextRouteIndex = bus.direction === 0 ? currentRouteIndex + 1 : currentRouteIndex - 1;
      
      // Check if next station exists in route
      if (nextRouteIndex < 0 || nextRouteIndex >= bus.routePath.length) {
        return null; // Bus will disappear
      }
      
      const nextStation = mapStations[bus.routePath[nextRouteIndex] - 1];
      
      if (!currentStation || !nextStation) return null;
      
      // Calculate ETA based on distance and speed
      const distance = Math.sqrt(
        Math.pow(nextStation.x - currentStation.x, 2) + 
        Math.pow(nextStation.y - currentStation.y, 2)
      );
      const etaMinutes = Math.ceil(distance * 100 / bus.speed);
      
      return {
        busId: bus.id,
        fromStation: currentStation,
        toStation: nextStation,
        progress: 0,
        direction: bus.direction,
        speed: bus.speed,
        currentStationIndex: currentRouteIndex, // Route index, not map index
        busDirection: bus.direction,
        stopTime: Math.random() * 3,
        isStopped: false,
        stopTimer: 0,
        etaMinutes: etaMinutes,
        routePath: bus.routePath, // Store route path for movement logic
      };
    }).filter(Boolean) as BusAnimation[];
    
    setBusAnimations(prev => [...prev, ...newAnimations]);
  }, [activeBuses.length, mapStations]);

  // Animation loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      setBusAnimations(prevAnimations => {
        const newAnimations = prevAnimations.map(animation => {
          // Handle stop time
          if (animation.isStopped) {
            animation.stopTimer += deltaTime;
            if (animation.stopTimer >= animation.stopTime) {
              animation.isStopped = false;
              animation.stopTimer = 0;
            } else {
              return animation; // Bus is still stopped
            }
          }

          // Advance progress
          let newProgress = animation.progress + animation.speed * deltaTime;
          
          // Check if bus reached the next station
          if (newProgress >= 1) {
            // Bus reached the next station
            const direction = animation.busDirection;
            const nextRouteIndex = direction === 0 ? 
              animation.currentStationIndex + 1 : 
              animation.currentStationIndex - 1;
            
            // If no more stations in that direction, remove bus
            if (direction === 0 && nextRouteIndex >= animation.routePath.length) {
              return null; // Bus will disappear
            }
            if (direction === 1 && nextRouteIndex < 0) {
              return null; // Bus will disappear
            }
            
            // Move to next station
            const nextStation = mapStations[animation.routePath[nextRouteIndex] - 1];
            const nextNextRouteIndex = direction === 0 ? nextRouteIndex + 1 : nextRouteIndex - 1;
            
            // If no more stations ahead, bus will disappear
            if (direction === 0 && nextNextRouteIndex >= animation.routePath.length) {
              return null; // Bus will disappear
            }
            if (direction === 1 && nextNextRouteIndex < 0) {
              return null; // Bus will disappear
            }
            
            const nextNextStation = mapStations[animation.routePath[nextNextRouteIndex] - 1];
            
            // Dynamic passenger changes when bus visits station
            setActiveBuses(prev => prev.map(bus => {
              if (bus.id === animation.busId) {
                // Get the forecast value (random +1~10 or -1~10)
                const forecastChange = Math.random() > 0.5 ? 
                  Math.floor(Math.random() * 10) + 1 : // +1 to +10
                  -(Math.floor(Math.random() * 10) + 1); // -1 to -10
                
                // Calculate target occupancy based on forecast
                let targetOccupancy = bus.occupancy + forecastChange;
                
                // Ensure target stays within bounds (0 to capacity)
                targetOccupancy = Math.max(0, Math.min(bus.capacity, targetOccupancy));
                
                // Calculate new occupancy to be near the target (within ±2 range)
                const minNewOccupancy = Math.max(0, targetOccupancy - 2);
                const maxNewOccupancy = Math.min(bus.capacity, targetOccupancy + 2);
                
                // Random occupancy within the ±2 range
                const newOccupancy = Math.floor(Math.random() * (maxNewOccupancy - minNewOccupancy + 1)) + minNewOccupancy;
                
                return {
                  ...bus,
                  occupancy: newOccupancy
                };
              }
              return bus;
            }));
            
            // Calculate new ETA for the next leg
            const newDistance = Math.sqrt(
              Math.pow(nextNextStation.x - nextStation.x, 2) + 
              Math.pow(nextNextStation.y - nextStation.y, 2)
            );
            const newEtaMinutes = Math.ceil(newDistance * 100 / animation.speed);
            
            return {
              ...animation,
              fromStation: nextStation,
              toStation: nextNextStation,
              progress: 0,
              currentStationIndex: nextRouteIndex,
              isStopped: true, // Bus stops at each station
              stopTime: Math.random() * 3, // New random stop time
              etaMinutes: newEtaMinutes, // Updated ETA for next leg
            };
          }

          return {
            ...animation,
            progress: newProgress,
          };
        }).filter(Boolean) as BusAnimation[];
        
        // Remove buses that reached the end - ONLY remove the specific bus that ended
        if (newAnimations.length < prevAnimations.length) {
          // Find which buses were removed
          const removedBusIds = prevAnimations
            .filter(prevAnim => !newAnimations.find(newAnim => newAnim.busId === prevAnim.busId))
            .map(anim => anim.busId);
          
          // Remove only the ended buses from activeBuses
          setActiveBuses(prev => prev.filter(bus => !removedBusIds.includes(bus.id)));
        }
        
        return newAnimations;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update getNextStationInfo to use route-based logic
  const getNextStationInfo = (bus: Bus) => {
    if (!bus.routePath || bus.routePath.length === 0) {
      return { nextStop: null, estimatedTime: 0 };
    }
    
    // Find current station in the route
    const currentRouteIndex = bus.routePath.findIndex(stationNum => 
      mapStations[stationNum - 1]?.id === bus.currentStopId
    );
    
    if (currentRouteIndex === -1) {
      return { nextStop: null, estimatedTime: 0 };
    }
    
    // Find next station in route
    const nextRouteIndex = bus.direction === 0 ? currentRouteIndex + 1 : currentRouteIndex - 1;
    
    if (nextRouteIndex < 0 || nextRouteIndex >= bus.routePath.length) {
      return { nextStop: null, estimatedTime: 0 };
    }
    
    const nextStop = mapStations[bus.routePath[nextRouteIndex] - 1];
    
    // Find the current animation for this bus to get real-time ETA
    const busAnimation = busAnimations.find(anim => anim.busId === bus.id);
    const estimatedTime = busAnimation ? busAnimation.etaMinutes : Math.floor(Math.random() * 10) + 2;
    
    return { nextStop, estimatedTime };
  };

  // Calculate bus position along the line
  const getBusPosition = (animation: BusAnimation) => {
    const from = animation.fromStation;
    const to = animation.toStation;
    
    if (!from || !to) return { x: 0, y: 0 };
    
    // Linear interpolation between stations
    const x = from.x + (to.x - from.x) * animation.progress;
    const y = from.y + (to.y - from.y) * animation.progress;
    
    return { x: x * 100, y: y * 100 };
  };

  // Helper function to calculate forecast passenger change
  const calculateForecast = (bus: Bus, nextStation: any) => {
    if (!bus.routePath || !nextStation) return 0;
    
    // Find current station in route
    const currentRouteIndex = bus.routePath.findIndex(stationNum => 
      mapStations[stationNum - 1]?.id === bus.currentStopId
    );
    
    if (currentRouteIndex === -1) return 0;
    
    // Find next station in route
    const direction = bus.direction;
    const nextRouteIndex = direction === 0 ? currentRouteIndex + 1 : currentRouteIndex - 1;
    
    if (nextRouteIndex < 0 || nextRouteIndex >= bus.routePath.length) return 0;
    
    // Calculate forecast based on current occupancy and capacity
    const currentOccupancy = bus.occupancy;
    const maxCapacity = bus.capacity;
    
    // Random forecast: +1~10 or -1~10 (same logic as passenger change)
    let forecastChange = Math.random() > 0.5 ? 
      Math.floor(Math.random() * 10) + 1 : // +1 to +10
      -(Math.floor(Math.random() * 10) + 1); // -1 to -10
    
    // Smart bounds checking: ensure forecast won't cause invalid occupancy
    if (forecastChange > 0) {
      // Positive change (passengers getting on)
      const maxPossible = maxCapacity - currentOccupancy;
      forecastChange = Math.min(forecastChange, maxPossible);
    } else {
      // Negative change (passengers getting off)
      const maxPossible = currentOccupancy;
      forecastChange = Math.max(forecastChange, -maxPossible);
    }
    
    return forecastChange;
  };

  // Helper function to get forecast color based on change
  const getForecastColor = (change: number) => {
    if (change > 0) return '#FF5722'; // Red for positive change (passengers getting on)
    if (change < 0) return '#4CAF50'; // Light green for negative change (passengers getting off)
    return '#666'; // Grey for no change
  };

  return (
    <View style={styles.mapSection}>
      <View style={styles.mapContainer}>
        {/* Map Image with Zoom Effect - Only affects map content */}
        <View style={styles.mapImageContainer}>
          <View style={styles.mapZoomWrapper}>
            <Image
              source={require('../public/GMap.jpg')}
              style={[
                styles.mapImage,
                {
                  transform: [{ scale: getZoomScale() }],
                }
              ]}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* SEPARATE LAYER: Station Points - Positioned independently of zoom */}
        <View style={styles.pointsLayer}>
          {mapStations.map((station, index) => (
            <TouchableOpacity
              key={station.id}
              style={[
                styles.mapPoint,
                styles.stationPoint,
                {
                  left: `${station.x * 100 - 16}%`, // Center the point on the station
                  top: `${station.y * 100 - 16}%`, // Center the point on the station
                }
              ]}
              onPress={() => handlePointPress({ ...station, data: null, type: 'station' })}
            >
              <Text style={styles.stationNumber}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
          
          {/* SEPARATE LAYER: Animated Bus Points - Positioned independently of zoom */}
          {busAnimations.map((animation) => {
            const bus = activeBuses.find(b => b.id === animation.busId);
            if (!bus) return null;
            
            const position = getBusPosition(animation);
            
            // Calculate occupancy percentage for color coding
            const occupancyPercentage = (bus.occupancy / bus.capacity) * 100;
            const getCapacityColor = (percentage: number) => {
              if (percentage <= 50) return '#4CAF50';      // Green: 0-50%
              if (percentage <= 75) return '#FF9800';      // Orange: 51-75%
              if (percentage <= 90) return '#FF5722';      // Red: 76-90%
              return '#9C27B0';                            // Purple: 91-100% (crush load)
            };
            
            return (
              <TouchableOpacity
                key={animation.busId}
                style={[
                  styles.mapPoint,
                  styles.busPoint,
                  {
                    left: `${position.x - 16}%`, // Center the point on the bus position
                    top: `${position.y - 16}%`, // Center the point on the bus position
                    backgroundColor: bus.routeColor, // Bus icon color matches route type color
                  }
                ]}
                onPress={() => handlePointPress({ 
                  ...bus, 
                  type: 'bus', 
                  station: animation.fromStation,
                  currentStation: animation.fromStation,
                  nextStation: animation.toStation,
                  etaMinutes: animation.etaMinutes,
                  forecastChange: calculateForecast(bus, animation.toStation)
                })}
              >
                <Text style={styles.pointText}>🚌</Text>
                
                {/* Capacity Indicator */}
                <View style={[
                  styles.capacityIndicator,
                  { backgroundColor: getCapacityColor(occupancyPercentage) }
                ]}>
                  <Text style={styles.capacityText}>
                    {bus.occupancy}/{bus.capacity}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Point Details Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (modalAutoCloseTimerRef.current) {
              clearTimeout(modalAutoCloseTimerRef.current);
            }
            setShowModal(false);
          }}
        >
          <TouchableOpacity 
            style={[
              styles.modalContent,
              {
                left: `${modalPosition.x}%`,
                top: `${modalPosition.y}%`,
              }
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            
            {selectedPoint?.type === 'station' && (
              <View style={styles.stationModalContent}>
                <Text style={styles.stationLabel}>Halte</Text>
                <Text style={styles.stationName}>{selectedPoint.name}</Text>
                <TouchableOpacity style={styles.viewDetailButton}>
                  <Text style={styles.viewDetailButtonText}>View Detail</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {selectedPoint?.type === 'bus' && (
              <View style={styles.busModalContent}>
                <View style={styles.busHeaderRow}>
                  <View style={[
                    styles.trackCodeContainer,
                    { backgroundColor: selectedPoint.routeColor }
                  ]}>
                    <Text style={styles.trackCodeText}>
                      {selectedPoint.routePath ? selectedPoint.routePath[0] : '1'}
                    </Text>
                  </View>
                  <View style={[
                    styles.busCodeContainer,
                    { backgroundColor: selectedPoint.routeColor }
                  ]}>
                    <Text style={styles.busCodeText}>BRT</Text>
                  </View>
                  <Text style={styles.busNumberText}>{selectedPoint.name}</Text>
                </View>
                
                <Text style={styles.nextStationLabel}>Halte Selanjutnya</Text>
                <View style={styles.stationWithForecast}>
                  <Text style={styles.nextStationName}>{selectedPoint.nextStation?.name || 'Senayan'}</Text>
                  <Text style={[
                    styles.forecastValue,
                    { color: getForecastColor(selectedPoint.forecastChange) }
                  ]}>
                    {selectedPoint.forecastChange > 0 ? `(+${selectedPoint.forecastChange})` : `(${selectedPoint.forecastChange})`}
                  </Text>
                </View>
                <Text style={styles.etaText}>{selectedPoint.etaMinutes || 2} menit</Text>
                
                <TouchableOpacity style={styles.lihatDetailButton}>
                  <Text style={styles.lihatDetailButtonText}>Lihat Detail</Text>
                </TouchableOpacity>
              </View>
            )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mapSection: {
    // Remove flex to prevent expansion - fill whole screen
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    // Fixed dimensions to prevent zoom from affecting layout
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mapContainer: {
    // Remove flex to prevent expansion - fill whole screen
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#F5F5F5',
    // Fixed dimensions to prevent zoom overflow
    overflow: 'hidden',
  },
  mapImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden', // Prevent zoom overflow
    // Fixed positioning to prevent layout shifts
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mapZoomWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Contain the zoomed image
    // Fixed dimensions to prevent zoom from affecting parent
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    // Remove fixed dimensions to allow dynamic scaling
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mapPoint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  stationPoint: {
    backgroundColor: '#4CAF50',
  },
  busPoint: {
    backgroundColor: '#FF9800',
  },
  pointText: {
    fontSize: 18,
    color: 'white',
  },
  stationNumber: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: 160,
    position: 'absolute',
    transform: [{ translateX: -80 }, { translateY: -30 }], // Center the modal on the point
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pointsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10, // Ensure points are above the map image
    pointerEvents: 'box-none', // Allow touch events to pass through to map
  },
  stationModalContent: {
    width: '100%',
    position: 'relative',
  },
  stationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  viewDetailButton: {
    position: 'absolute',
    bottom: -8,
    right: 0,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewDetailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  busModalContent: {
    width: '100%',
    paddingLeft: 6,
  },
  busHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackCodeContainer: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    marginRight: 6,
  },
  trackCodeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  busCodeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    marginRight: 6,
  },
  busCodeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  busNumberText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  nextStationLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 3,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  nextStationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    marginBottom: 12,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  lihatDetailButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  lihatDetailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  capacityIndicator: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    transform: [{ translateX: -10 }],
    backgroundColor: '#FF9800', // Default color
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  capacityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stationWithForecast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default InteractiveMap;
