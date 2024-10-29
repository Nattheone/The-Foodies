import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Linking, Image } from 'react-native';
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
  const [restaurantType, setRestaurantType] = useState(''); 
  const [tags, setTags] = useState<string[]>([]);
  const [hours, setHours] = useState<Record<string, string>>({});
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
        setRestaurantType(data.restaurantType || ''); 
        setTags(data.tags || []);
        setHours(data.hours || {});
        setAddress(data.address || '123 Example St, City, State, Zip Code'); 
        setAddress(data.address || 'No address set');
        setProfileImage(data.profileImage || null);
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

  function openMaps() {
    if (coordinates) {
      const url = `maps://?q=${coordinates.latitude},${coordinates.longitude}`;
      Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'Failed to open Apple Maps.')
      );
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
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profilePicture} />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Text style={styles.profilePictureText}>+</Text>
          </View>
        )}

        <Text style={styles.name}>{businessName}</Text>

        {/* Display Restaurant Type and Tags */}
        {(restaurantType || tags.length > 0) && (
          <Text style={styles.tags}>
            {[restaurantType, ...tags].filter(Boolean).join(' | ')}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/RestaurantSetting')}
          style={styles.editButton}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>ADDRESS & HOURS</Text>

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

        <TouchableOpacity onPress={openMaps}>
          <Text style={styles.address}>{address}</Text>
        </TouchableOpacity>

        <View style={styles.hoursContainer}>
          {Object.entries(hours).map(([day, time]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/RestaurantProfile')}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/features/RestaurantSearchMap')}>
          <Text style={styles.navButtonText}>Search</Text>
        </TouchableOpacity>
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
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 50,
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
  profilePictureText: {
    fontSize: 24,
    color: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  tags: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    fontStyle: 'italic',
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
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 10,
    textDecorationLine: 'underline',
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
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    paddingBottom: 50,
    backgroundColor: '#798B67',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: -50,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
