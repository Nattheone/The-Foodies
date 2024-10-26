import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { useRouter } from 'expo-router';
import app from '../../../firebaseConfig';

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');

  async function registerUser() {
    if (!email || !password || !userName) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const auth = getAuth(app);

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(response.user, { displayName: userName });

      Alert.alert('Success', 'Account created successfully. Please log in.', [
        { text: 'Okay', onPress: () => router.push('/tabs/(auth)/Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Something went wrong', error.message);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#4A4A4A"
          onChangeText={setUserName}
        />
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Email"
          placeholderTextColor="#4A4A4A"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Password"
          placeholderTextColor="#4A4A4A"
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Confirm Password"
          placeholderTextColor="#4A4A4A"
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={registerUser}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.link}>Already have an account? </Text>
          <Text
            style={[styles.link, { color: 'teal' }]}
            onPress={() => router.push('/tabs/(auth)/Login')}
          >
            Log in
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A4A4A',
  },
  input: {
    width: '90%',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    color: '#4A4A4A',
  },
  button: {
    width: '90%',
    height: 45,
    backgroundColor: '#5A6B5C',
    borderRadius: 6,
    marginTop: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8F8F8',
    fontSize: 16,
  },
  register: {
    marginTop: 25,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    fontSize: 15,
    color: '#798B67',
  },
});
