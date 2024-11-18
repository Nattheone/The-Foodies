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
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import {app} from '../../../firebaseConfig';

// signup components
export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //functions for singup/registreration includes error messages 
  async function registerUser() {
    if (!email || !password) {
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
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully.', [
        { text: 'Okay', onPress: () => router.push('/tabs/(auth)/loggedin/UserSelection') },
      ]);
    } catch (error: any) {
      Alert.alert('Something went wrong!', error.message);
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
        {/* The fork images */}
        <Image 
          source={require('../../../assets/fork_green.png')} 
          style={styles.logo} 
          resizeMode="contain"  
        />

        <Text style={styles.title}>Sign Up</Text>
        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#4A4A4A"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
         {/* Password iNput */}
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Password"
          placeholderTextColor="#4A4A4A"
          onChangeText={setPassword}
          secureTextEntry
        />
         {/* Confirm Password Input */}
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Confirm Password"
          placeholderTextColor="#4A4A4A"
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
         {/* Register Button*/}
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
            style={[styles.link, { color: '#5A6B5C' }]}
            onPress={() => router.push('/tabs/(auth)/Login')}
          >
            Log in
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

 {/* Style for the frontend */}
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
  logo: {
    width: 80,  
    height: 80, 
    marginBottom: 20,
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
    backgroundColor: '#E5E5E5',
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
