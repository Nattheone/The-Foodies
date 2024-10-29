import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const firestore = getFirestore(app);

type Restaurant = {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

export default function SimpleMapScreen() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const initialRegion = {
    latitude: 33.5779,
    longitude: -101.8552,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'restaurants'));
        const restaurantData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const location = data.address ? await geocodeAddress(data.address) : null;
          
          return {
            id: doc.id,
            name: data.businessName,
            address: data.address || 'Address not provided',
            ...location,
          };
        }));
        
        setRestaurants(restaurantData as Restaurant[]);
        setFilteredRestaurants(restaurantData as Restaurant[]); 
      } catch (error) {
        console.error("Error loading restaurant data:", error);
        Alert.alert("Error", "Could not load restaurant data.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  async function geocodeAddress(address: string) {
    try {
      const [location] = await Location.geocodeAsync(address);
      if (location) {
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } else {
        console.warn("Geocode failed for address:", address);
        return null;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  const openModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

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

      {/* Search Bar */}
      {viewMode === 'list' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name"
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              const filteredData = restaurants.filter(
                restaurant => restaurant.name && restaurant.name.toLowerCase().includes(text.toLowerCase())
              );
              setFilteredRestaurants(filteredData);
            }}
          />
        </View>
      )}

      {/* Modal for Restaurant Details */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedRestaurant?.name}</Text>
            <Text style={styles.modalAddress}>{selectedRestaurant?.address}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Conditional Rendering for Map or List */}
      {viewMode === 'map' ? (
        loading ? (
          <Text style={styles.loadingText}>Loading map...</Text>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {restaurants.map((restaurant) =>
              restaurant.latitude && restaurant.longitude ? (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  onPress={() => openModal(restaurant)}  // Open modal on marker press
                  pinColor="#798B67"
                />
              ) : null
            )}
          </MapView>
        )
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noResultsText}>No restaurants found with that name.</Text>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/CustomerProfile')}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/features/CustomerSearchMap')}>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 8,
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
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalAddress: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
