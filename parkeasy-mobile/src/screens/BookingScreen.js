import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockBookings = [
  {
    id: 1,
    address: "123 Main Street, Downtown",
    date: "Today",
    time: "2:00 PM - 4:00 PM",
    price: 17.00,
    status: "Active"
  },
  {
    id: 2,
    address: "456 Oak Avenue, Business District",
    date: "Tomorrow",
    time: "9:00 AM - 11:00 AM",
    price: 24.00,
    status: "Confirmed"
  },
  {
    id: 3,
    address: "789 Pine Road, University Area",
    date: "Oct 8",
    time: "1:00 PM - 3:00 PM",
    price: 10.00,
    status: "Completed"
  }
];

export default function BookingScreen() {
  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingAddress}>{item.address}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status).bg }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status).text }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={styles.detailText}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      {item.status === 'Active' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Extend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#e8f5e8', text: '#388e3c' };
      case 'Confirmed':
        return { bg: '#e3f2fd', text: '#1976d2' };
      case 'Completed':
        return { bg: '#f5f5f5', text: '#666' };
      default:
        return { bg: '#f5f5f5', text: '#666' };
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.headerText}>Your Parking Bookings</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Book your first parking spot to see it here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#dc3545',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});