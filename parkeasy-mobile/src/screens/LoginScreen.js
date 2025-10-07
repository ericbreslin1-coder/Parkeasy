import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>🅿️</Text>
          <Text style={styles.appName}>ParkEasy</Text>
          <Text style={styles.tagline}>Find parking spots near you</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          {/* Quick Login for Testing */}
          <View style={styles.testSection}>
            <Text style={styles.testTitle}>Quick Test Login:</Text>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => {
                setEmail('admin@parkeasy.com');
                setPassword('admin123');
              }}
            >
              <Text style={styles.testButtonText}>Use Admin Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#666',
    fontSize: 16,
  },
  registerLinkBold: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  testSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});