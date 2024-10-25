import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.background}>  {/* View with green background */}
      <View style={styles.container}>
        <Text style={styles.title}>DISCOVER & ENJOY</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="SIGN UP"
            color="#6A7E61"  // Button color
            onPress={() => router.push('./auth/SignUp')}  // Navigate to Sign Up screen
          />
          <Button
            title="LOGIN"
            color="#6A7E61"  // Button color
            onPress={() => router.push('./auth/Login')}  // Navigate to Login screen
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',  // Set green background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '80%',
    justifyContent: 'space-between',
    height: 120,
  },
});
