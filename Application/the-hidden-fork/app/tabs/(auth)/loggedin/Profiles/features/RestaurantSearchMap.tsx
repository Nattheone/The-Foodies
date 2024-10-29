import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, Image, ScrollView, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const firestore = getFirestore(app);

type Restaurant = {
  id: string;
  name: string;
  address: string;
  tags?: string[];
  hours?: Record<string, string>;
  profileImage?: string;
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
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
            type: data.type || 'Restaurant',
            tags: data.tags || [],
            hours: data.hours || {},
            profileImage: data.profileImage || '',
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

  const openInMaps = () => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.latitude},${selectedRestaurant.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Location not available');
    }
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
      placeholder="Search by name or tag"
      value={searchText}
      onChangeText={text => {
        setSearchText(text);

        const filteredData = restaurants.filter(restaurant => {
          // Check if the restaurant has an address
          const hasAddress = !!restaurant.address;
          
          // Check if the restaurant's name or tags match the search text
          const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(text.toLowerCase());
          const tagMatch = restaurant.tags && restaurant.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()));

          // Only include restaurants that have an address and match either name or tags
          return hasAddress && (nameMatch || tagMatch);
        });

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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              {selectedRestaurant?.profileImage ? (
                <Image source={{ uri: selectedRestaurant.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>No Image</Text>
                </View>
              )}

              <Text style={styles.modalTitle}>{selectedRestaurant?.name}</Text>
              


              <Text style={styles.tags}>
        {selectedRestaurant?.tags && selectedRestaurant.tags.length > 0
          ? `${selectedRestaurant.tags.join(' | ')} | Restaurant`
          : "Restaurant"}
      </Text>


              {/* Clickable Address */}
              <TouchableOpacity onPress={openInMaps}>
                <Text style={styles.modalAddress}>{selectedRestaurant?.address}</Text>
              </TouchableOpacity>

              {/* Hours - Sorted by Days */}
              <View style={styles.hoursContainer}>
                {daysOrder.map((day) => (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={styles.day}>{day}</Text>
                    <Text style={styles.time}>{selectedRestaurant?.hours?.[day] || "Closed"}</Text>
                  </View>
                ))}
              </View>

              {/* Mini Map */}
              {selectedRestaurant?.latitude && selectedRestaurant?.longitude && (
                <MapView
                  style={styles.miniMap}
                  initialRegion={{
                    latitude: selectedRestaurant.latitude,
                    longitude: selectedRestaurant.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedRestaurant.latitude,
                      longitude: selectedRestaurant.longitude,
                    }}
                  />
                </MapView>
              )}
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
          <TouchableOpacity onPress={() => openModal(item)} style={styles.listItem2}>
            {/* Profile Image */}
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={styles.profileImage2} />
            ) : (
              <View style={styles.profileImagePlaceholder2}>
                <Text style={styles.profileImageText2}>No Image</Text>
              </View>
            )}

            {/* Name and Tags */}
            <View style={styles.infoContainer}>
              <Text style={styles.listItemName}>{item.name}</Text>
              <Text style={styles.listItemTags}>
                {item.tags && item.tags.length > 0 ? item.tags.join(" | ") : "No tags available"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResultsText}>No restaurants found with that name or tag.</Text>
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
  container: { flex: 1 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#f0f0f0' },
  toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#d3d3d3' },
  activeButton: { backgroundColor: '#798B67' },
  toggleButtonText: { fontSize: 16, color: '#000' },
  activeButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 20, marginVertical: 10 },
  searchInput: { height: 40, borderColor: '#ddd', borderWidth: 1, paddingLeft: 10, borderRadius: 8 },
  map: { width: '100%', height: '100%' },
  listContainer: { paddingTop: 10 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  listItemText: { fontSize: 16 },
  noResultsText: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },
  loadingText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
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
  navButton: { alignItems: 'center' },
  navButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align modal content starting from the top
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 100,  // Adjust this value to position the modal lower on the screen
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backButtonText: { fontSize: 16, color: '#798B67' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  profileImageText: { color: '#FFF', fontSize: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  tags: { fontSize: 14, color: '#666', marginBottom: 10 },
  modalAddress: { fontSize: 16, color: '#4A4A4A', textAlign: 'center', marginBottom: 10 },
  hoursContainer: { marginBottom: 10, width: '100%' },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  day: { fontSize: 14, color: '#4A4A4A', fontWeight: 'bold' },
  time: { fontSize: 14, color: '#4A4A4A' },
  miniMap: { width: '100%', height: 150, borderRadius: 8, marginTop: 10 },
  listItem2: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  profileImage2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileImagePlaceholder2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImageText2: {
    color: '#FFF',
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listItemTags: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
