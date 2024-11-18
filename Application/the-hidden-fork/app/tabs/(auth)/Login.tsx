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
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import {app} from '../../../firebaseConfig';

//defult components for Login 
export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    const auth = getAuth(app);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Login successful!', [
        { text: 'Okay', onPress: () => router.push('/tabs/(auth)/loggedin/InitalSignUpLoading') },
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
       {/* The fork image */}
      <View style={styles.innerContainer}>
        {/* Display the PNG Image with resizeMode */}
        <Image
          source={require('../../../assets/fork_green.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Login</Text>
       {/* email input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#4A4A4A"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
         {/* password input */}
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Password"
          placeholderTextColor="#4A4A4A"
          onChangeText={setPassword}
          secureTextEntry
        />
         {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
           {/* Dont Have an account action */}
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
 {/* styles for frontend */}
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
