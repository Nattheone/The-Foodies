import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../../../../firebaseConfig';

//Initialization of Firestore 
const firestore = getFirestore(app);

//Customer default components 
export default function CustomerProfile() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [name, setName] = useState('');
  const [reviewCount, setReviewCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  //loads the profile for that Customer user
  useEffect(() => {
    if (user) {
      loadProfileData(user.uid);
    }
  }, [user]);

  //function to load information for that user with error handling 
  async function loadProfileData(userId: string) {
    try {
      const profileDoc = await getDoc(doc(firestore, 'customers', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setName(data.name || 'No name set');
        setReviewCount(data.reviewCount || 0);
        setProfileImage(data.profileImage || null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setLoading(false);
    }
  }

  //loading screen while getting information 
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
      {/* Profile Pic display  */}
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profilePicture} />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Text style={styles.profilePictureText}>+</Text>
          </View>
        )}
        {/* Name Display  */}
        <Text style={styles.name}>{name}</Text>
        {/* Fake Following FOR NOW WILL MAKE FUNCTIONAL IF THERE IS TIME*/}
        <View style={styles.followingContainer}>
          <Text style={styles.followingCount}>{reviewCount}</Text>
          <Text style={styles.followingLabel}>Following</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/CustomerSetting')} 
          style={styles.editButton}
        >
          {/* Edit Button*/}
          <Text style={styles.editText}>Edit</Text> 
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar  */}
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

//style for the frontend
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
    paddingBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 50,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 24,
    color: '#FFF',
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
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
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
