import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      {/* Transparent Status Bar */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Fullscreen background image */}
      <Image
        source={require('../../assets/unsplash_B-DrrO3tSbo.png')} // Background image
        style={styles.backgroundImage}
        contentFit="cover"
      />

      <View style={styles.overlayContainer}>
        {/* Fork image at the top */}
        <Image
          source={require('../../assets/fork_logo.svg')} // Adjust this path to your fork image
          style={styles.forkImage}
          contentFit="contain" // Adjust this if needed to fit the fork image properly
        />

        {/* Text and Buttons */}
        <Text style={styles.title}>DISCOVER & ENJOY</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/Signup')}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/Login')}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
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
    zIndex: 1, // Ensure the text and buttons are above the background image
    paddingHorizontal: 20,
  },
  forkImage: {
    width: 150, // Adjust width to fit the fork image size you want
    height: 150, // Adjust height to fit the fork image size you want
    marginBottom: 40, // Spacing between the fork image and the text
  },
  title: {
    fontSize: 30,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 120,
  },
  button: {
    width: '90%',
    backgroundColor: '#6A7E61',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50, // Rounded button
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase', // Make text uppercase
  },
});
