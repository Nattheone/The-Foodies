import React from 'react';
import { getAuth } from 'firebase/auth';

import { useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';

import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';

const firestore = getFirestore(app);

export default function SimpleMapScreen() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;



  const initialRegion = {
    latitude: 33.5779, // Replace with your desired latitude
    longitude: 101.8552, // Replace with your desired longitude
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true} // Shows user's location if permission is granted
        showsMyLocationButton={true} // Provides a button to recenter on user's location
      />
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/CustomerProfile')}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/features/SearchCustomerMap')}>
          <Text style={styles.navButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#798B67', 
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
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
