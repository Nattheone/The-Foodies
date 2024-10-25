import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';  // Importing the expo-image component

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <Image
        source={require('../assets/unsplash_B-DrrO3tSbo.png')}  // Use the local image
        style={styles.backgroundImage}
        contentFit="cover"  // Ensures the image covers the container
      />

      <View style={styles.overlayContainer}>
        <Text style={styles.title}>DISCOVER & ENJOY</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="SIGN UP"
            color="#6A7E61"
            onPress={() => router.push('/auth/Signup')}  // Navigate to Sign Up screen
          />
          <Button
            title="LOGIN"
            color="#6A7E61"
            onPress={() => router.push('/auth/Login')}  // Navigate to Login screen
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
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,  // Ensures the buttons and text appear above the image
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
