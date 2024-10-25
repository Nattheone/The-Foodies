import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import backgroundImage from '../assets/unsplash_B-DrrO3tSbo.png';

export default function Index() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('./app/assets/unsplash_B-DrrO3tSbo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>DISCOVER & ENJOY</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="SIGN UP"
            color="#6A7E61" // Customize the button color
            onPress={() => router.push('./auth/SignUp')} // Navigate to Sign Up screen
          />
          <Button
            title="LOGIN"
            color="#6A7E61" // Customize the button color
            onPress={() => router.push('./auth/Login')} // Navigate to Login screen
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
