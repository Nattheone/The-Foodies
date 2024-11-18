import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../../../../firebaseConfig';
import { useRouter } from 'expo-router';

const firestore = getFirestore(app);
const auth = getAuth(app);


type Event = {
  eventName: string;
  description: string;
  date: string;
  discount?: string;
  createdAt: Date;
};

export default function ViewEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const restaurantDocRef = doc(firestore, 'restaurants', user.uid);
    const docSnap = await getDoc(restaurantDocRef);

    if (docSnap.exists()) {
      setEvents(docSnap.data().events || []);
    }
    setLoading(false);
  };

  const deleteEvent = async (event: Event) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const restaurantDocRef = doc(firestore, 'restaurants', user.uid);

      await updateDoc(restaurantDocRef, {
        events: arrayRemove(event),
      });

      // Remove the event from the local state
      setEvents((prevEvents) => prevEvents.filter((e) => e !== event));
      Alert.alert("Success", "Event deleted successfully!");
    } catch (error) {
      console.error("Error in deleting event:", error);
      Alert.alert("Error", "Could not delete event.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Events</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {events.length > 0 ? (
          events.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <Text style={styles.eventName}>{event.eventName}</Text>
              <Text style={styles.eventDate}>Date: {event.date}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              {event.discount && (
                <Text style={styles.eventDiscount}>Discount: {event.discount}</Text>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  Alert.alert(
                    "Confirm Delete",
                    "Are you sure you want to delete this event?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", onPress: () => deleteEvent(event) },
                    ]
                  )
                }
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events available. Booo Make an Event</Text>
        )}
      </ScrollView>
    </View>
  );
}
//Styles for front end 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#798B67',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginLeft: 15,
    textAlign: 'center',

  },
  scrollContainer: {
    paddingBottom: 20,
  },
  eventCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',

  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  eventDiscount: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',

  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#D9534F',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
