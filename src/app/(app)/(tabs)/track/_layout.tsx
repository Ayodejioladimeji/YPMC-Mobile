import { Stack } from "expo-router";

export default function TrackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Track",
          headerShown: false,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "interMedium", fontSize: 16 },
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: "Active",
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="pending/[id]"
        options={{
          headerShown: false,
          title: "Secondary Tracking",
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="scheduled/[id]"
        options={{
          headerShown: false,
          title: "Secondary Tracking",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="active/[id]"
        options={{
          headerShown: false,
          title: "Secondary Tracking",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="completed/[id]"
        options={{
          headerShown: false,
          title: "Secondary Tracking",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen name="schedule-selection" />
    </Stack>
  );
}

