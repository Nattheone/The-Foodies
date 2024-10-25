import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Import your Firebase config

export default function Signup() {
  const router = useRouter();

  // State for user type (Customer or Business)
  const [userType, setUserType] = useState('customer');

  // Form states
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Food Truck');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form validation and submission
  const handleSignup = async () => {
    setError(null); // Clear any previous errors

    // Basic form validation
    if (!email || !password || (userType === 'customer' && !name) || (userType === 'business' && !businessName)) {
      setError('Please fill all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Firebase signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert('Sign up successful!');
      router.push('../auth/Login'); // Navigate to login after sign-up
    } catch (err: any) {
      setError(err.message); // Set the error if signup fails
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Display any error messages */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Toggle between Business and Customer */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, userType === 'business' && styles.activeButton]}
          onPress={() => setUserType('business')}
        >
          <Text style={styles.toggleText}>Business</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, userType === 'customer' && styles.activeButton]}
          onPress={() => setUserType('customer')}
        >
          <Text style={styles.toggleText}>Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Form for Customer or Business */}
      {userType === 'customer' ? (
        <>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Business Name"
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
          />
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, businessType === 'Food Truck' && styles.activeButton]}
              onPress={() => setBusinessType('Food Truck')}
            >
              <Text style={styles.toggleText}>Food Truck</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, businessType === 'Restaurant' && styles.activeButton]}
              onPress={() => setBusinessType('Restaurant')}
            >
              <Text style={styles.toggleText}>Restaurant</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Shared Email, Password and Confirm Password Fields */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../Login')}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderColor: '#6A7E61',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#6A7E61',
  },
  toggleText: {
    color: '#6A7E61',
    fontWeight: 'bold',
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
  loginText: {
    color: '#6A7E61',
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
