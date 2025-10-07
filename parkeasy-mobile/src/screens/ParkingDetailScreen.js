import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ParkingDetailScreen({ route, navigation }) {
  const { spot } = route.params;

  const handleBookSpot = () => {
    Alert.alert(
      'Book Parking Spot',
      `Do you want to book this parking spot at ${spot.address} for $${spot.price}/hour?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            Alert.alert('Success', 'Parking spot booked successfully!');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.address}>{spot.address}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: spot.available ? '#e8f5e8' : '#ffebee' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: spot.available ? '#388e3c' : '#d32f2f' }
          ]}>
            {spot.available ? 'Available' : 'Occupied'}
          </Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>${spot.price}</Text>
        <Text style={styles.priceUnit}>per hour</Text>
      </View>

      {spot.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{spot.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.detailText}>0.5 km from your location</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={20} color="#666" />
          <Text style={styles.detailText}>Available 24/7</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="shield-checkmark" size={20} color="#666" />
          <Text style={styles.detailText}>Secure parking area</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Owner Information</Text>
        <Text style={styles.ownerText}>Listed by verified user</Text>
      </View>

      {spot.available && (
        <TouchableOpacity style={styles.bookButton} onPress={handleBookSpot}>
          <Text style={styles.bookButtonText}>Book This Spot</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  address: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceSection: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007bff',
  },
  priceUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  ownerText: {
    fontSize: 16,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007bff',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});