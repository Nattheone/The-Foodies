import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../../../../../../firebaseConfig';
import { useRouter } from 'expo-router';

const firestore = getFirestore(app);

export default function CreateEventScreen() {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [discount, setDiscount] = useState('');
  const router = useRouter();

  const handleCreateEvent = async () => {
    if (!eventName || !description || !date) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      await addDoc(collection(firestore, 'events'), {
        eventName,
        description,
        date,
        discount,
        createdAt: new Date(),
      });
      Alert.alert("Success", "Event created successfully!");
      router.back(); // Navigate back after creation
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Could not create event.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Event or Promotion</Text>

          <TextInput
            style={styles.input}
            placeholder="Event Name"
            value={eventName}
            onChangeText={setEventName}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Date (e.g., YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Discount (optional)"
            value={discount}
            onChangeText={setDiscount}
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
            <Text style={styles.buttonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/RestaurantProfile')}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/features/promotions')}>
          <Text style={styles.navButtonText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/features/RestaurantSearchMap')}>
          <Text style={styles.navButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#798B67',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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

