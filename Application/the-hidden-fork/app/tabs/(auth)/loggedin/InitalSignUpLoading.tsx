import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {app} from '../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function InitialSignUpLoading() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      checkUserType(user.uid); // Pass the UID only if the user exists
    } else {
      Alert.alert('Error', 'No user is logged in.');
      router.replace('/tabs/Login'); // Redirect to login if no user is logged in
    }
  }, [user]);

  async function checkUserType(userId: string) {
    try {
      // Check if user is in the 'customers' collection
      const customerDoc = await getDoc(doc(firestore, 'customers', userId));
      if (customerDoc.exists()) {
         router.replace('/tabs/(auth)/loggedin/Customer/CustomerProfile'); // Navigate to customer profile setup
        return;
      }

      // Check if user is in the 'restaurants' collection
      const restaurantDoc = await getDoc(doc(firestore, 'restaurants', userId));
      if (restaurantDoc.exists()) {
        // router.replace('/tabs/RestaurantProfile'); // Navigate to restaurant profile setup
        return;
      }

      // If user type not found, alert the user and redirect to login
      Alert.alert('Error', 'User type not found. Please log in again.');
      router.replace('/tabs/Login');
    } catch (error) {
      console.error('Error determining user type:', error);
      Alert.alert('Error', 'There was an issue loading your profile. Please try again.');
      router.replace('/tabs/Login');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5A6B5C" />
      <Text style={styles.loadingText}>Loading your profile...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
  },
});
