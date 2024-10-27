import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import MapView from 'react-native-maps';

const firestore = getFirestore(app);

export default function SimpleMapScreen() {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const initialRegion = {
    latitude: 33.5779,
    longitude: -101.8552,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const sampleData = [
    { id: '1', name: 'Restaurant A' },
    { id: '2', name: 'Restaurant B' },
    { id: '3', name: 'Restaurant C' },
  ];

  return (
    <View style={styles.container}>
      {/* Toggle between List and Map */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeButton]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.activeButtonText]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.activeButton]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'map' && styles.activeButtonText]}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering for Map or List */}
      {viewMode === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        />
      ) : (
        <FlatList
          data={sampleData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Bottom Navigation Bar */}
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
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
  },
  activeButton: {
    backgroundColor: '#798B67',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#000',
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  listContainer: {
    paddingTop: 10,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listItemText: {
    fontSize: 16,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    paddingBottom:50,
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

