import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function SearchScreen({ navigation }) {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  useEffect(() => {
    filterSpots();
  }, [searchQuery, parkingSpots]);

  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/parking');
      setParkingSpots(response.data);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSpots = () => {
    if (!searchQuery) {
      setFilteredSpots(parkingSpots);
    } else {
      const filtered = parkingSpots.filter(spot =>
        spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSpots(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParkingSpots();
    setRefreshing(false);
  };

  const renderParkingSpot = ({ item }) => (
    <TouchableOpacity
      style={styles.spotCard}
      onPress={() => navigation.navigate('ParkingDetail', { spot: item })}
    >
      <View style={styles.spotHeader}>
        <Text style={styles.spotAddress}>{item.address}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.available ? '#e8f5e8' : '#ffebee' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.available ? '#388e3c' : '#d32f2f' }
          ]}>
            {item.available ? 'Available' : 'Occupied'}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.spotDescription}>{item.description}</Text>
      )}
      
      <View style={styles.spotFooter}>
        <Text style={styles.spotPrice}>${item.price}/hour</Text>
        <View style={styles.spotActions}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.distanceText}>0.5 km away</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredSpots}
        renderItem={renderParkingSpot}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No parking spots found' : 'No parking spots available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try searching for a different location' 
                : 'Check back later for new spots'
              }
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
  searchContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  spotCard: {
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
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  spotAddress: {
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
  spotDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  spotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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