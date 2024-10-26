import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function CustomerSetting() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData(user.uid);
    } else {
      Alert.alert("Error", "User is not logged in.");
      router.replace("/tabs/Login"); // Redirect to login if user is not logged in
    }
  }, [user]);

  async function loadProfileData(userId: string) {
    try {
      const profileDoc = await getDoc(doc(firestore, 'customers', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setName(data.name || '');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    }
  }

  async function reauthenticate(currentPassword: string) {
    if (!user) return;

    const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
    await reauthenticateWithCredential(user, credential);
  }

  async function saveProfileChanges() {
    if (!user) {
      Alert.alert("Error", "User is not logged in.");
      return;
    }

    if (!name) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      if (currentPassword) {
        await reauthenticate(currentPassword);
      }

      // Update Firestore profile data
      await updateDoc(doc(firestore, 'customers', user.uid), { name });

      // Update password if provided
      if (password) {
        await updatePassword(user, password);
      }

      Alert.alert('Success', 'Profile updated successfully.');
      router.push('/tabs/(auth)/loggedin/Profiles/CustomerProfile');
    } catch (error: any) {
      console.error('Error saving profile changes:', error);
      Alert.alert('Error', error.message || 'Could not save profile changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Display-only Email */}
        <Text style={styles.label}>Email</Text>
        <Text style={styles.nonEditableText}>{user?.email}</Text>

        <Text style={styles.label}>New Password</Text>
        {/* Password Fields */}
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Current Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Current Password (required to update password)"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveProfileChanges} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/tabs/(auth)/loggedin/Profiles/CustomerProfile')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#4A4A4A',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#798B67',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    color: '#4A4A4A',
  },
  nonEditableText: {
    fontSize: 16,
    color: '#4A4A4A',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#5A6B5C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5A6B5C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

