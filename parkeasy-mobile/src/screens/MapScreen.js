import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Conditional import for maps - use react-native-maps for native, fallback for web
let MapView, Marker, Callout;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Callout = maps.Callout;
  } catch (e) {
    console.log('react-native-maps not available');
  }
}

let Location;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch (e) {
    console.log('expo-location not available on web');
  }
}

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocationPermission();
    fetchParkingSpots();
  }, []);

  const getLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              setLoading(false);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              setDefaultLocation();
            }
          );
        } else {
          setDefaultLocation();
        }
      } else {
        // Native location using expo-location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to show nearby parking spots');
          setDefaultLocation();
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setDefaultLocation();
    }
  };

  const setDefaultLocation = () => {
    // Default to NYC if location access fails
    setLocation({
      latitude: 40.7128,
      longitude: -74.0060,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setLoading(false);
  };

  const fetchParkingSpots = async () => {
    try {
      const response = await axios.get('/parking');
      // Convert parking spots to map markers with coordinates
      const spotsWithCoords = response.data.map((spot, index) => ({
        ...spot,
        // Mock coordinates around NYC for demo (you'd get real coords from your API)
        latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
      }));
      setParkingSpots(spotsWithCoords);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    }
  };

  const handleMarkerPress = (spot) => {
    navigation.navigate('ParkingDetail', { spot });
  };

  // Web-compatible map component
  const WebMapView = () => {
    const { width, height } = Dimensions.get('window');
    
    return (
      <View style={styles.webMapContainer}>
        <View style={styles.webMapHeader}>
          <Text style={styles.webMapTitle}>Parking Spots Near You</Text>
          <Text style={styles.webMapLocation}>
            📍 {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
          </Text>
        </View>
        
        <View style={styles.webMapContent}>
          <Text style={styles.webMapNote}>
            🗺️ Interactive map available on mobile app
          </Text>
          
          {parkingSpots.length > 0 ? (
            <View style={styles.spotsList}>
              <Text style={styles.spotsListTitle}>Available Parking Spots:</Text>
              {parkingSpots.map((spot, index) => (
                <TouchableOpacity
                  key={spot.id || index}
                  style={[
                    styles.spotCard,
                    { borderLeftColor: spot.available ? '#28a745' : '#dc3545' }
                  ]}
                  onPress={() => handleMarkerPress(spot)}
                >
                  <Text style={styles.spotAddress}>{spot.address}</Text>
                  <Text style={styles.spotPrice}>${spot.price}/hour</Text>
                  <Text style={[
                    styles.spotStatus,
                    { color: spot.available ? '#28a745' : '#dc3545' }
                  ]}>
                    {spot.available ? '✅ Available' : '❌ Occupied'}
                  </Text>
                  <Text style={styles.spotCoords}>
                    📍 {spot.latitude?.toFixed(4)}, {spot.longitude?.toFixed(4)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSpots}>No parking spots found in this area.</Text>
          )}
        </View>
      </View>
    );
  };

  // Native map component
  const NativeMapView = () => {
    if (!MapView || !Marker || !Callout) {
      return (
        <View style={styles.mapUnavailable}>
          <Text>Map component not available</Text>
        </View>
      );
    }

    return (
      <MapView
        style={styles.map}
        region={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {parkingSpots.map((spot, index) => (
          <Marker
            key={spot.id || index}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            pinColor={spot.available ? '#28a745' : '#dc3545'}
          >
            <Callout onPress={() => handleMarkerPress(spot)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{spot.address}</Text>
                <Text style={styles.calloutPrice}>${spot.price}/hour</Text>
                <Text style={[
                  styles.calloutStatus,
                  { color: spot.available ? '#28a745' : '#dc3545' }
                ]}>
                  {spot.available ? 'Available' : 'Occupied'}
                </Text>
                <TouchableOpacity style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Render appropriate map based on platform */}
      {Platform.OS === 'web' ? <WebMapView /> : <NativeMapView />}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>

      {/* Legend - only show on native platforms with actual map */}
      {Platform.OS !== 'web' && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#28a745' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapUnavailable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  // Web map styles
  webMapContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webMapHeader: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  webMapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  webMapLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  webMapContent: {
    flex: 1,
    padding: 20,
  },
  webMapNote: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  spotsList: {
    flex: 1,
  },
  spotsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  spotCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spotAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  spotPrice: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  spotStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  spotCoords: {
    fontSize: 12,
    color: '#6c757d',
  },
  noSpots: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 50,
  },
  // Native map styles (existing)
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutPrice: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutStatus: {
    fontSize: 12,
    marginBottom: 10,
  },
  calloutButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});