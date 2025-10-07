import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ParkingDetailScreen from './src/screens/ParkingDetailScreen';

// Import context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: '🅿️ ParkEasy' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Find Parking' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingScreen} 
        options={{ title: 'My Bookings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator for login/register
function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: '🅿️ ParkEasy Login' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}

// Main App Navigator
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="ParkingDetail" 
              component={ParkingDetailScreen}
              options={{ 
                headerShown: true,
                title: 'Parking Details',
                headerStyle: { backgroundColor: '#007bff' },
                headerTintColor: '#fff'
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#007bff" />
      <AppNavigator />
    </AuthProvider>
  );
}