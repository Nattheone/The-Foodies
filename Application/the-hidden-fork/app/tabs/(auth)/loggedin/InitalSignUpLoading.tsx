import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {app} from '../../../../firebaseConfig';

//initializes firestore
const firestore = getFirestore(app);

//default components for Loading screen 
export default function InitialSignUpLoading() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  // Effect hook to check the user type after the component mounts
  useEffect(() => {
    if (user) {
      checkUserType(user.uid); 
    } else {
      Alert.alert('Error', 'No user is logged in.');
      router.replace('/tabs/Login'); 
    }
  }, [user]);

  // Function to check the users type
  async function checkUserType(userId: string) {
    try {
      //if customer
      const customerDoc = await getDoc(doc(firestore, 'customers', userId));
      if (customerDoc.exists()) {
         router.replace('/tabs/(auth)/loggedin/Profiles/CustomerProfile');
        return;
      }

      //if restaurant 
      const restaurantDoc = await getDoc(doc(firestore, 'restaurants', userId));
      if (restaurantDoc.exists()) {
        router.replace('/tabs/(auth)/loggedin/Profiles/RestaurantProfile'); 
        return;
      }

     //if none
      Alert.alert('Error', 'User type not found. Please log in again.');
      router.replace('/tabs/Login');
    } catch (error) {
      console.error('Error determining user type:', error);
      Alert.alert('Error', 'There was an issue loading your profile. Please try again.');
      router.replace('/tabs/Login');
    }
  }
{/* Legit Just loading screen   */}
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5A6B5C" />
      <Text style={styles.loadingText}>Loading your profile...</Text>
    </View>
  );
}
{/* style for frontend */}
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
