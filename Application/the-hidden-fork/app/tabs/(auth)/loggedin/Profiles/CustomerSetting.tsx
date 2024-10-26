import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import {app} from '../../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function Settings() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [bio, setBio] = useState('');
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
        setName(data.name || '');
        setContactInfo(data.contactInfo || '');
        setBio(data.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfileData() {
    if (!user) return;

    try {
      await setDoc(doc(firestore, 'customers', user.uid), {
        name: name,
        contactInfo: contactInfo,
        bio: bio,
      }, { merge: true });
      Alert.alert('Success', 'Profile updated successfully.');

      // Navigate back to the CustomerProfile page after saving
      router.back();
    } catch (error) {
      console.error('Error saving profile data:', error);
      Alert.alert('Error', 'Could not save profile data. Please try again.');
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
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#A8A8A8"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { marginTop: 15 }]}
        placeholder="Contact Information"
        placeholderTextColor="#A8A8A8"
        value={contactInfo}
        onChangeText={setContactInfo}
      />
      <TextInput
        style={[styles.input, { marginTop: 15 }]}
        placeholder="Bio"
        placeholderTextColor="#A8A8A8"
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity style={styles.button} onPress={saveProfileData}>
        <Text style={styles.buttonText}>Save Profile</Text>
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
    color: '#4A4A4A',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#E5E5E5',
    color: '#4A4A4A',
  },
  button: {
    width: '90%',
    paddingVertical: 15,
    backgroundColor: '#5A6B5C',
    borderRadius: 6,
    marginTop: 25,
    alignItems: 'center',
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
