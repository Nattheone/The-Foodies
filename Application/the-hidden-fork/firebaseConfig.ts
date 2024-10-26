import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAdwoi7sQypp-Qlu5cKOrVrXQokAO7TgEU', // Your Web API Key
  authDomain: 'the-hidden-fork.firebaseapp.com', // Replace with your Project ID followed by ".firebaseapp.com"
  projectId: 'the-hidden-fork', // Your Project ID
  storageBucket: 'the-hidden-fork.appspot.com', // Your Project's Storage Bucket
  messagingSenderId: '269034171955', // Your Messaging Sender ID (can be found in the Firebase Console)
  appId: '1:269034171955:web:your-app-id', // Your App ID
};

const app = initializeApp(firebaseConfig);

export default app;
