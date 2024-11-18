// Imports for 
import * as React from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function GetStarted() {
  const router = useRouter();

  //page is the get started page that users see when they first open the applicaiton 
  return (
    
    <View style={styles.background}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* The BackGround for the app*/}
      <Image
        source={require('../../assets/unsplash_B-DrrO3tSbo.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      <View style={styles.overlayContainer}>
        <Image
          source={require('../../assets/fork_logo.svg')}
          style={styles.forkImage}
          contentFit="contain"
        />
        {/* title and subtitle text */}
        <Text style={styles.title}>THE HIDDEN FORK</Text>
        <Text style={styles.titlesub}>DISCOVER & ENJOY</Text>

        {/* Buttons for Login and SignUp  */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/tabs/(auth)/Signup')}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/tabs/(auth)/Login')}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

{/* the styles for the frontend */}
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
    zIndex: 1,
    paddingHorizontal: 20,
  },
  forkImage: {
    width: width * 0.3, 
    height: width * 0.3,
    marginBottom: 20,
  },
  title: {
    fontSize: 24 * (width / 320), 
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },  
  titlesub: {
    fontSize: 18 * (width / 320), 
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
    width: '100%',
    backgroundColor: '#6A7E61',
    paddingVertical: 15,
    paddingHorizontal: 50, 
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
