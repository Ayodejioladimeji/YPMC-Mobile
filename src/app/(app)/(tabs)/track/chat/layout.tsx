import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: "Active",
          headerTitleAlign: "center",
            gestureEnabled: false
        }}
      />

    </Stack>
  );
}
