import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { app } from '../../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function RestaurantProfile() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [businessName, setBusinessName] = useState('');
  const [hours, setHours] = useState<Record<string, string>>({});
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData(user.uid);
    }
  }, [user]);

  async function loadProfileData(userId: string) {
    try {
      const profileDoc = await getDoc(doc(firestore, 'restaurants', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setBusinessName(data.businessName || 'No name set');
        setHours(data.hours || {});
        setAddress(data.address || 'No address set');
        if (data.address) {
          await geocodeAddress(data.address);
        }
      } else {
        Alert.alert('Error', 'Profile not found.');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setLoading(false);
    }
  }

  async function geocodeAddress(address: string) {
    try {
      const [location] = await Location.geocodeAsync(address);
      if (location) {
        setCoordinates({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else {
        Alert.alert('Error', 'Could not find location for the address provided.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to get coordinates for the address.');
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5A6B5C" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profilePicturePlaceholder} />

        <Text style={styles.name}>{businessName}</Text>

        <TouchableOpacity 
          onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/RestaurantSetting')} 
          style={styles.editButton}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Address & Hours</Text>

        {/* Map View */}
        {coordinates ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={coordinates} title={businessName} description={address} />
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Location not available</Text>
        )}

        <Text style={styles.address}>{address}</Text>

        {/* Hours of Operation */}
        <View style={styles.hoursContainer}>
          {Object.entries(hours).map(([day, time]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#798B67',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 30,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  editButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginBottom: 10,
  },
  map: {
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 10,
  },
  hoursContainer: {
    marginTop: 10,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  day: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
  },
});
