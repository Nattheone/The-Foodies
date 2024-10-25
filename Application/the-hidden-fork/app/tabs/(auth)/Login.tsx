import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  // State management for form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Function to handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }

    try {
      // Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      // Navigate to the home page or dashboard after successful login
      router.push('/tabs/GetStarted');
    } catch (err: any) {
      setError(err.message); // Display error if login fails
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Error message display */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Mask the password
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Navigation to Sign Up */}
      <TouchableOpacity onPress={() => router.push('/tabs/(auth)/Signup')}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6A7E61',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#6A7E61',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#6A7E61',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#6A7E61',
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
