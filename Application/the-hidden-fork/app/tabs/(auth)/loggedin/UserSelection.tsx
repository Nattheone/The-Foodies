import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {app} from '../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function UserTypeSelection() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [selectedType, setSelectedType] = useState('');

  async function handleConfirm() {
    if (!selectedType) {
      Alert.alert('Please select a user type');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'No user is logged in.');
      return;
    }

    try {
      // Set Firestore collection based on user type
      const collectionName = selectedType === 'Customer' ? 'customers' : 'restaurants';

      // Save the user data in the appropriate collection
      await setDoc(doc(firestore, collectionName, user.uid), {
        uid: user.uid,
        userType: selectedType,
        email: user.email,
        createdAt: new Date(),
      });

      Alert.alert('Success', `Account type set to ${selectedType}.`);
      router.push('/tabs/(auth)/loggedin/InitalSignUpLoading'); // Navigate to the UserProfile page
    } catch (error) {
      console.error('Error saving user type:', error);
      Alert.alert('Error', 'Could not save account type. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../../assets/fork_green.png')} // Replace with your actual path to the icon
        style={styles.icon}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Which Type of User Are You?</Text>
      <Text style={styles.note}>NOTE: ONCE SELECTED CANNOT CHANGE</Text>

      <TouchableOpacity
        style={[styles.optionButton, selectedType === 'Restaurant' && styles.selectedButton]}
        onPress={() => setSelectedType('Restaurant')}
      >
        <Text style={styles.optionTitle}>Restaurant</Text>
        <Text style={styles.optionDescription}>
          Looking to expand my business. For Restaurants and Food Trucks only.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, selectedType === 'Customer' && styles.selectedButton]}
        onPress={() => setSelectedType('Customer')}
      >
        <Text style={styles.optionTitle}>Customer</Text>
        <Text style={styles.optionDescription}>
          Looking to expand my palette and support local businesses.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 5,
  },
  note: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#A8A8A8',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#798B67', // Darker border for selected option
    shadowColor: '#798B67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#798B67',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});