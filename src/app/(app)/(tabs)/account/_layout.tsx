import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
      <Stack
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontFamily: "interMedium", fontSize: 16 },
          headerTitleAlign: "center",
        gestureEnabled: false
        }}
      >
      <Stack.Screen name="index" options={{ title: "My Profile", headerShown: false, headerShadowVisible: false, }} />
        <Stack.Screen
          name="profile-details"
          options={{ title: "Profile Details", headerShown: false }}
        />
        <Stack.Screen name="payment" options={{ title: "Payment", headerShown: false }} />
        <Stack.Screen name="paystack" options={{ title: "Paystack", headerShown: false }} />
        <Stack.Screen name="card-paystack" options={{ title: "Card Paystack", headerShown: false }} />
        <Stack.Screen name="success" options={{ title: "Success", headerShown: false }} />
        <Stack.Screen name="referrals" options={{ title: "Referrals", headerShown:false }} />
        <Stack.Screen
          name="transaction-history"
          options={{ title: "Transaction History", headerShown:false }}
        />
        <Stack.Screen name="change-password" options={{ title: "" }} />
        <Stack.Screen name="faqs" options={{ title: "FAQs" }} />
        <Stack.Screen name="support" options={{ headerShown: false }} />
        <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
      </Stack>
  );
}
