import { Stack } from "expo-router";

export default function SignUpLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerShadowVisible: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="upload-picture" />
    </Stack>
  );
}
