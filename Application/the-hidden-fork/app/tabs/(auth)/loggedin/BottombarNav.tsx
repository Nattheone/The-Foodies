import React, { useEffect, useState, Suspense } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Text, ActivityIndicator } from 'react-native';


import RestaurantProfile from './Profiles/Restaurant/RestaurantProfile';
import CustomerProfile from './Profiles/Customer/CustomerProfile';
import SearchScreen from './Profiles/features/Search';
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const firestore = getFirestore();

        try {
          const docRef = doc(firestore, 'users', userId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.role);
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  const ProfileComponent = userRole === 'customer' ? CustomerProfile : RestaurantProfile;

  return (
    <NavigationContainer>
      <Suspense fallback={<ActivityIndicator size="large" color="gray" />}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: 'white' },
          }}
        >
          <Tab.Screen
            name="Profile"
            component={ProfileComponent}
            options={{
              tabBarLabel: 'Profile',
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarLabel: 'Search',
              headerShown: true,
            }}
          />
        </Tab.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}

