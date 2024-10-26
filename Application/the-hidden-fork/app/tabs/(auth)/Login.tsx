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
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import app from '../../../firebaseConfig';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function registerAndLogin() {
    setLoading(true);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      
      // Replace the current screen with "choose image"
      //router.replace('/choose-image'); // Replace with the correct route path
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Oops', error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
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

        <TouchableOpacity style={styles.button} onPress={registerAndLogin}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.link}>Don't have an account? </Text>
          <Text
            style={[styles.link, { color: '#5A6B5C' }]}
            onPress={() => router.push('/tabs/(auth)/Signup')}
          >
            Sign up
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light background color from the palette
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8', // Same background as container
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A4A4A', // Darker gray for title text
  },
  input: {
    width: '90%',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#E5E5E5', // Slightly lighter gray for input background
    alignSelf: 'center',
    color: '#4A4A4A', // Darker gray text inside input
  },
  button: {
    width: '90%',
    height: 45,
    backgroundColor: '#5A6B5C', // Dark green for button background
    borderRadius: 6,
    marginTop: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8F8F8', // Light text on the dark green button
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
    color: '#798B67', // Olive green for link text
  },
});
