import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, Switch } from 'react-native';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { app } from '../../../../../firebaseConfig';

const firestore = getFirestore(app);
const storage = getStorage(app);

const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  const [restaurantType, setRestaurantType] = useState<'Restaurant' | 'Food Truck'>('Restaurant');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'Busy' | 'Moderate' | 'Slow'>('Moderate');

  const availableTags = ['Family-Friendly', 'Fine Dining', 'Fast Food', 'Casual', 'Barbecue', 'Asian', 'Italian', 'Mexican', 'Indian', 'Dine-In', 'Cafe', 'African'];

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
        const orderedHours = daysOrder.reduce<Record<string, string>>((acc, day) => {
          acc[day] = data.hours?.[day] || 'CLOSED';
          return acc;
        }, {});
        setHours(orderedHours);
        setProfileImage(data.profileImage || null);
        setSelectedTags(data.tags || []);
        setRestaurantType(data.restaurantType || 'Restaurant');
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

  const handleStatusChange = (newStatus: 'Busy' | 'Moderate' | 'Slow') => {
    setStatus(newStatus);
  };

  const compressImage = async (uri: string) => {
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Resize to max width of 1024px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
    );
    return compressedImage.uri;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const compressedUri = await compressImage(result.assets[0].uri);
      uploadImage(compressedUri); // Use the compressed image URI for upload
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `restaurantImages/${user.uid}`);
    setLoading(true);

    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      setProfileImage(url);

      await setDoc(doc(firestore, 'restaurants', user.uid), { profileImage: url }, { merge: true });
      Alert.alert('Success', 'Profile image updated successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Could not upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(selected => selected !== tag));
    } else if (selectedTags.length < 2) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
      if (newPassword) {
        const reauthenticated = await reauthenticateUser();
        if (!reauthenticated) return;
      }

      await setDoc(doc(firestore, 'restaurants', user.uid), {
        businessName,
        address,
        hours,
        restaurantType,
        tags: selectedTags,
        status,
      }, { merge: true });

      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      Alert.alert('Success', 'Restaurant profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Could not save settings.');
    }
  }

  const cancelChanges = () => {
    router.back();
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

        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureText}>+</Text>
            </View>
          )}
        </TouchableOpacity>
         {/* Status Selection */}
         <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.statusContainer}>
          {['Busy', 'Moderate', 'Slow'].map((statusOption) => (
            <TouchableOpacity
              key={statusOption}
              onPress={() => handleStatusChange(statusOption as 'Busy' | 'Moderate' | 'Slow')}
              style={[
                styles.statusButton,
                status === statusOption && styles.statusButtonSelected,
              ]}
            >
              <Text style={[
                styles.statusButtonText,
                status === statusOption && styles.statusButtonTextSelected,
              ]}>
                {statusOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Enter business name"
          placeholderTextColor={"#888"}
        />

        <Text style={styles.label}>Address</Text>
        <Text style={styles.helperText}>Example: 456 Elm St, Apt 7, New York, NY 10001</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Main St, City, State ZIP"
          placeholderTextColor={"#888"}

        />
        


        <Text style={styles.sectionTitle}>Hours of Operation</Text>
        <Text style={styles.helperText}>Example format: "9AM-5PM" or "CLOSED"</Text>
        {daysOrder.map(day => (
          <View key={day} style={styles.hoursInputContainer}>
            <Text style={styles.dayLabel}>{day}</Text>
            <TextInput
              style={styles.timeInput}
              value={hours[day]}
              onChangeText={(value) => handleHourChange(day, value)}
              placeholder="e.g., 9AM-6PM or CLOSED"
              placeholderTextColor={"#888"}

            />
          </View>
        ))}

        <Text style={styles.sectionTitle}>Select Tags</Text>
        <Text style={styles.helperText}>Select Only 2</Text>
        <View style={styles.tagContainer}>
          {availableTags.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => handleTagSelect(tag)}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.tagButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  selectedTags.includes(tag) && styles.tagButtonTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.nonEditableText}>{user?.email}</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={"#888"}
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={"#888"}
          secureTextEntry
        />

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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5A6B5C',
    backgroundColor: '#F8F8F8',
  },
  statusButtonSelected: {
    backgroundColor: '#5A6B5C',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#5A6B5C',
  },
  statusButtonTextSelected: {
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  }
  ,container: {
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
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 20,
    alignSelf: 'center',
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  profilePictureText: {
    fontSize: 24,
    color: '#FFF',
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
    color: '#4A4A4A',
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  toggleOption: {
    fontSize: 16,
    color: '#5A6B5C',
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
    color: '#4A4A4A',
    marginLeft: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: '#5A6B5C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 5,
    backgroundColor: '#F8F8F8',
  },
  tagButtonSelected: {
    backgroundColor: '#5A6B5C',
  },
  tagButtonText: {
    fontSize: 14,
    color: '#5A6B5C',
  },
  tagButtonTextSelected: {
    color: '#FFFFFF',
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