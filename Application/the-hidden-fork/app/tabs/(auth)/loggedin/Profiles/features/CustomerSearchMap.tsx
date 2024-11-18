import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, Image, Linking, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

//Initialization of Firestore 
const firestore = getFirestore(app);

//for Modal Information
type Restaurant = {
  id: string;
  name: string;
  address: string;
  tags?: string[];
  hours?: Record<string, string>;
  profileImage?: string;
  latitude?: number;
  longitude?: number;
  status?: 'Busy' | 'Moderate' | 'Slow';
  events?: Event[];
};

//For Events in Modal
type Event = {
  eventName: string;
  description: string;
  date: string;
  discount?: string;
};

//Default components for Search Function
export default function SimpleMapScreen() {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const router = useRouter();
  const auth = getAuth(app);

  //default view of the map componenet 
  const initialRegion = {
    latitude: 33.5779,
    longitude: -101.8552,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  //useEffect to fetch restaurant data and request location permissions
  useEffect(() => {
    async function loadRestaurants() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Location Permission Needed", "Please enable location permissions to view restaurant locations.");
        setLoading(false);
        return;
      }
      
      try {
        const querySnapshot = await getDocs(collection(firestore, 'restaurants'));
        const restaurantData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const location = data.address ? await geocodeAddress(data.address) : null;
  
          return {
            id: doc.id,
            name: data.businessName || 'No name provided',
            address: data.address || 'Address not provided',
            tags: data.tags || [],
            hours: data.hours || {},
            profileImage: data.profileImage || '',
            status: data.status || ' ',
            events: data.events || [],
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

  // Geocodes a given address into latitude and longitude (NOT SURE IF THIS WORKS WILL COMEBACK TO FIX)
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

// Opens the modal with the selected restaurant info
  const openModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  // Opens the selected restaurants location in Apple Maps
  const openInMaps = () => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
      const url = `maps://?q=${selectedRestaurant.latitude},${selectedRestaurant.longitude}`;
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
            placeholderTextColor={"#888"}
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              const filteredData = restaurants.filter(restaurant => {
                const hasAddress = !!restaurant.address;
                const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(text.toLowerCase());
                const tagMatch = restaurant.tags && restaurant.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()));
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

            <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.scrollContainer}>
              {selectedRestaurant?.profileImage ? (
                <Image source={{ uri: selectedRestaurant.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>No Image</Text>
                </View>
              )}

              <Text style={styles.modalTitle}>{selectedRestaurant?.name}</Text>
              {/* Display Restaurant Status */}
              <Text style={styles.statusText}>{selectedRestaurant?.status || ' '}</Text>

              <Text style={styles.tags}>
                {selectedRestaurant?.tags && selectedRestaurant.tags.length > 0
                  ? `${selectedRestaurant.tags.join(' | ')} | Restaurant`
                  : "Restaurant"}
              </Text>

              {/* Clickable Addresses   */}
              <TouchableOpacity onPress={openInMaps}>
                <Text style={styles.modalAddress}>{selectedRestaurant?.address}</Text>
              </TouchableOpacity>

              {/* Hours IN ORDER THIS IS FIXED NOW ALEXIS*/}
              <View style={styles.hoursContainer}>
                {selectedRestaurant?.hours &&
                  daysOfWeek.map((day) => (
                    <View key={day} style={styles.hoursRow}>
                      <Text style={styles.day}>{day}</Text>
                      <Text style={styles.time}>{selectedRestaurant.hours?.[day] || "N/A"}</Text>
                    </View>
                  ))}
              </View>



              {/* Mini Mini Map tehehe */}
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
              {/* Events Section */}
              <Text style={styles.sectionTitle}>Promotions & Events</Text>
              <ScrollView horizontal contentContainerStyle={styles.eventsContainer}>
                {selectedRestaurant?.events?.length ? (
                  selectedRestaurant.events.map((event, index) => (
                    <View key={index} style={styles.eventCard}>
                      <Text style={styles.eventTitle}>{event.eventName}</Text>
                      <Text style={styles.eventDescription}>{event.description}</Text>
                      <Text style={styles.eventDate}>Date: {event.date}</Text>
                      {event.discount && <Text style={styles.eventDiscount}>Discount: {event.discount}</Text>}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noEventsText}>No events available.</Text>
                )}
              </ScrollView>
            </ScrollView>
            
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
                  onPress={() => openModal(restaurant)}
                  pinColor="#0000FF"
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
              {item.profileImage ? (
                <Image source={{ uri: item.profileImage }} style={styles.profileImage2} />
              ) : (
                <View style={styles.profileImagePlaceholder2}>
                  <Text style={styles.profileImageText2}>No Image</Text>
                </View>
              )}
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
//Styles for front end 
const styles = StyleSheet.create({
  container: { flex: 1,     backgroundColor: '#FFFFFF' 
  },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#f0f0f0', },
  toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#d3d3d3' },
  activeButton: { backgroundColor: '#798B67' },
  toggleButtonText: { fontSize: 16, color: '#000' },
  activeButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 20, marginVertical: 10 },
  searchInput: { height: 40, borderColor: '#ddd', borderWidth: 1, paddingLeft: 10, borderRadius: 8, backgroundColor: '#FFFFFF', color: '#4A4A4A', },
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  scrollViewContent: {
    width: '100%',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backButtonText: { fontSize: 16, color: '#798B67' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  profileImageText: { color: '#FFF', fontSize: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  tags: { fontSize: 14, color: '#666', marginBottom: 10 },
  statusText: { fontSize: 16, color: '#333', fontWeight: 'bold', marginVertical: 5 },
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
  sectionTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: '#333'

  },
  eventsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  eventCard: {
    width: 200,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginBottom: 15,
    textAlign: 'center'
  },
  eventDate: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 5,
    textAlign:'center'
  },
  eventDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 5,
    textAlign:'center'

  },
  eventDiscount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#798B67',
    textAlign:'center'
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
  },
});
