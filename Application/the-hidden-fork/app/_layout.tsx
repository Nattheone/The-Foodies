import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="GetStarted" options={{headerShown: false} } />
    </Stack>
  );
}
