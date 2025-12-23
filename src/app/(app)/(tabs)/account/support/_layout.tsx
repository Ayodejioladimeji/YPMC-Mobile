import { Stack } from "expo-router";

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTitle: "Support",
          headerStyle: { backgroundColor: "#F972161A" },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="case-request"
        options={{
          title: "",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
