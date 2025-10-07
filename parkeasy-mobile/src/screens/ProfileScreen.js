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
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#007bff" />
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <ProfileItem
          icon="car"
          title="My Parking Spots"
          subtitle="Manage your listed spots"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
        
        <ProfileItem
          icon="card"
          title="Payment Methods"
          subtitle="Manage cards and billing"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
        
        <ProfileItem
          icon="notifications"
          title="Notifications"
          subtitle="Push notifications and alerts"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
        
        <ProfileItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help and contact us"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
        
        <ProfileItem
          icon="settings"
          title="Settings"
          subtitle="App preferences and privacy"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Listed Spots</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>$51</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#dc3545" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>ParkEasy v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  userSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 15,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 15,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc3545',
    marginLeft: 10,
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
  },
});