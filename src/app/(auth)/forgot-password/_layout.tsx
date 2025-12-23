import { Stack } from "expo-router";

export default function ForgotPasswordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown:false,
        headerShadowVisible: false,
        headerTitle: "",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="create-new-password" />
      <Stack.Screen name="new-password" />
    </Stack>
  );
}
