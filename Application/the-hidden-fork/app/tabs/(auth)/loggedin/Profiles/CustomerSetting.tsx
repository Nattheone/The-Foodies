import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { app } from '../../../../../firebaseConfig';

//initializes firestore and storage for pictures 
const firestore = getFirestore(app);
const storage = getStorage(app);

//default components and definitions 
export default function CustomerSetting() {
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  //loading screen to featch users settings 
  useEffect(() => {
    if (user) {
      loadProfileData(user.uid);
    } else {
      Alert.alert("Error", "User is not logged in.");
      router.replace("/tabs/Login");
    }
  }, [user]);

 // Function to load Customer information from Firestore
  async function loadProfileData(userId: string): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(firestore, 'customers', userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setName(data.name || '');
        setProfileImage(data.profileImage || null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Could not load profile data.');
    }
  }

  // Function to compress and make into url 
  const compressImage = async (uri: string) => {
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], 
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } 
    );
    return compressedImage.uri;
  };

  //image picker to allow users to select a profile pic
  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const compressedUri = await compressImage(result.assets[0].uri);
      uploadImage(compressedUri);
    }
  };

  //upadates the profile image to storage and the settings in firestore for the image url
  const uploadImage = async (uri: string): Promise<void> => {
    if (!user) return;

    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `profileImages/${user.uid}`);
    setLoading(true);

    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      setProfileImage(url);

      await updateDoc(doc(firestore, 'customers', user.uid), { profileImage: url });
      Alert.alert('Success', 'Profile image updated successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Could not upload image.');
    } finally {
      setLoading(false);
    }
  };

  //for reseting password 
  async function reauthenticate(currentPassword: string): Promise<void> {
    if (!user) return;

    const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
    await reauthenticateWithCredential(user, credential);
  }

  //saves the settings and updates the passsword if needed
  async function saveProfileChanges(): Promise<void> {
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

      await updateDoc(doc(firestore, 'customers', user.uid), { name });

      if (password) {
        await updatePassword(user, password);
      }

      Alert.alert('Success', 'Profile updated successfully.');
      router.push('/tabs/(auth)/loggedin/Profiles/CustomerProfile');
    } catch (error) {
      console.error('Error saving profile changes:', error);
      Alert.alert('Error', 'Could not save profile changes. Please try again.');
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
        {/* Profile Pic selection*/}
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureText}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name Input*/}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={"#888"}
          autoCapitalize="words"
        />
        {/* Shows Users current email DOESNT NOT CHANGE IT FOR NOW  */}
        <Text style={styles.label}>Email</Text>
        <Text style={styles.nonEditableText}>{user?.email}</Text>

        {/* Reset Paswword Inputs*/}
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={"#888"}
          secureTextEntry
        />
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password (required to update password)"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor={"#888"}
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

//Style for frontend
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
    color: '#4A4A4A',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#4A4A4A',
    marginVertical: 10,
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
  },
  nonEditableText: {
    fontSize: 16,
    color: '#4A4A4A',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
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
});
