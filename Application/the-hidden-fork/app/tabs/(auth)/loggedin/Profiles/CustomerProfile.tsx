import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
  const [contactInfo, setContactInfo] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false); // State to track if the user owns this profile

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
        setContactInfo(data.contactInfo || 'No contact info set');
        setBio(data.bio || 'No bio set');
        
        // Check if the logged-in user is the owner of this profile
        setIsOwner(userId === user?.uid);
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
      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.infoText}>{name}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Contact Info:</Text>
        <Text style={styles.infoText}>{contactInfo}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Bio:</Text>
        <Text style={styles.infoText}>{bio}</Text>
      </View>

      {isOwner && (
        <TouchableOpacity style={styles.button} onPress={() => router.push('/tabs/(auth)/loggedin/Customer/CustomerSetting')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
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
    color: '#4A4A4A',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  infoText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  button: {
    width: '90%',
    paddingVertical: 15,
    backgroundColor: '#5A6B5C',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
  },
});
