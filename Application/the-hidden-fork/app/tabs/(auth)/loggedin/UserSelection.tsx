import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {app} from '../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function UserTypeSelection() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  async function handleUserTypeSelection(userType: string) {
    if (!user) {
      Alert.alert('Error', 'No user is logged in.');
      return;
    }

    try {
      // Set the Firestore collection based on the user type
      const collectionName = userType === 'Customer' ? 'customers' : 'restaurants';

      // Save the user data in the respective collection with UID included
      await setDoc(doc(firestore, collectionName, user.uid), {
        uid: user.uid,  // Explicitly store the UID in the document
        userType: userType,
        email: user.email,
        createdAt: new Date(),
      });

      Alert.alert('Success', `Account type set to ${userType}.`);

      // Navigate to the UserProfile page after saving the user type
      //router.push('/tabs/UserProfile');
    } catch (error) {
      console.error('Error saving user type:', error);
      Alert.alert('Error', 'Could not save account type. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Account Type</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleUserTypeSelection('Customer')}
      >
        <Text style={styles.buttonText}>Customer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleUserTypeSelection('Restaurant')}
      >
        <Text style={styles.buttonText}>Restaurant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A4A4A',
  },
  button: {
    width: '90%',
    paddingVertical: 15,
    backgroundColor: '#5A6B5C',
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8F8F8',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
