import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="notifications"
        options={{
          headerTitle: "Notifications",
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "interMedium", fontSize: 16 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="pending-payments"
      />
    </Stack>
  );
}
 