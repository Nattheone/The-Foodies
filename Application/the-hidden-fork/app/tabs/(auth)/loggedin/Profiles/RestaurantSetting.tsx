import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { app } from '../../../../../firebaseConfig';

const firestore = getFirestore(app);

export default function RestaurantSetting() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState<Record<string, string>>({
    Mon: 'CLOSED',
    Tue: 'CLOSED',
    Wed: 'CLOSED',
    Thu: 'CLOSED',
    Fri: 'CLOSED',
    Sat: 'CLOSED',
    Sun: 'CLOSED',
  });
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // Current password field for re-authentication
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings(user.uid);
    }
  }, [user]);

  async function loadSettings(userId: string) {
    try {
      const profileDoc = await getDoc(doc(firestore, 'restaurants', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setBusinessName(data.businessName || '');
        setAddress(data.address || '');
        setHours(data.hours || hours);
      } else {
        Alert.alert('Error', 'Restaurant profile not found.');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  }

  const handleHourChange = (day: string, value: string) => {
    setHours(prevHours => ({ ...prevHours, [day]: value }));
  };

  async function reauthenticateUser() {
    if (!user || !currentPassword) return false;

    const credential = EmailAuthProvider.credential(user.email || '', currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Re-authentication error:', error);
      Alert.alert('Error', 'Re-authentication failed. Please check your current password.');
      return false;
    }
  }

  async function saveSettings() {
    if (!user) return;

    try {
      // Re-authenticate if password is being changed
      if (newPassword) {
        const reauthenticated = await reauthenticateUser();
        if (!reauthenticated) return;
      }

      // Update Firestore document
      await setDoc(doc(firestore, 'restaurants', user.uid), {
        businessName,
        address,
        hours,
      }, { merge: true });

      // Update password if provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      Alert.alert('Success', 'Restaurant profile updated successfully');
      router.back(); // Navigate back after saving
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Could not save settings.');
    }
  }

  const cancelChanges = () => {
    router.back(); // Navigate back without saving
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Edit Restaurant Profile</Text>

        {/* Business Name */}
        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Enter business name"
        />

        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
        />

        {/* Hours of Operation */}
        <Text style={styles.sectionTitle}>Hours of Operation</Text>
        {Object.keys(hours).map(day => (
          <View key={day} style={styles.hoursInputContainer}>
            <Text style={styles.dayLabel}>{day}</Text>
            <TextInput
              style={styles.timeInput}
              value={hours[day]}
              onChangeText={(value) => handleHourChange(day, value)}
              placeholder="e.g., 9AM-6PM or CLOSED"
            />
          </View>
        ))}

        {/* Email (non-editable) */}
        <Text style={styles.label}>Email</Text>
        <Text style={styles.nonEditableText}>{user?.email}</Text>

        {/* Current Password (for re-authentication) */}
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
        />

        {/* New Password */}
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelChanges}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#4A4A4A',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    color: '#333',
    marginTop: 5,
  },
  nonEditableText: {
    fontSize: 16,
    color: '#4A4A4A',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A6B5C',
    marginTop: 30,
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dayLabel: {
    width: 50,
    fontSize: 16,
    color: '#4A4A4A',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    color: '#333',
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#5A6B5C',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
  },
});
