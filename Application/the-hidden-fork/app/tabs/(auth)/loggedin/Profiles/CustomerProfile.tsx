import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {app} from '../../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function CustomerProfile() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [name, setName] = useState('');
  const [reviewCount, setReviewCount] = useState(0); // Placeholder for review count
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData(user.uid);
    }
  }, [user]);

  async function loadProfileData(userId: string) {
    try {
      const profileDoc = await getDoc(doc(firestore, 'customers', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setName(data.name || 'No name set');
        setReviewCount(data.reviewCount || 0); // Assume Firestore has a `reviewCount` field
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5A6B5C" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Circle Profile Picture Placeholder */}
        <View style={styles.profilePicturePlaceholder} /> 

        <Text style={styles.name}>{name}</Text>

        {/* Following Count */}
        <View style={styles.followingContainer}>
          <Text style={styles.followingCount}>{1}</Text>
          <Text style={styles.followingLabel}>Following</Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity 
          onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/CustomerSetting')} 
          style={styles.editButton}
        >
          <Text style={styles.editText}>Edit</Text> 
        </TouchableOpacity>
      </View>

      {/* ... (rest of your code remains the same) */}
    </View>
  );
}


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F8F8',
    },
    header: {
      backgroundColor: '#798B67',
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      paddingBottom: 30, // Adjusted padding
    },
    profilePicture: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: '#fff',
      marginTop: 50, // Adjusted margin
    },
    profilePicturePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: '#fff',
      marginTop: 50,
      backgroundColor: '#ccc', // Placeholder background
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginTop: 10,
    },
    followingContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    followingCount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    followingLabel: {
      fontSize: 16,
      color: '#FFFFFF',
    },
    editButton: {
      position: 'absolute',
      top: 40,
      right: 20,
    },
  editText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  statLabel: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
  },
});
