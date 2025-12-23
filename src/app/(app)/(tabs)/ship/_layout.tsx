import { Stack } from "expo-router";


export default function ShippingLayout() {
  // 
  
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
        headerShown: false,
        headerTitleStyle: { fontFamily: "interMedium", fontSize: 16 },
        headerTitleAlign: "center",
        title: "Single Shipping",
        gestureEnabled: false
      }}

    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen name="package-info" />
      <Stack.Screen name="pickup-info" />
      <Stack.Screen name="delivery-info" />
      <Stack.Screen name="find-rider" />
      <Stack.Screen name="rider-request"  />
      <Stack.Screen name="payment"  />
      <Stack.Screen name="success" />
      <Stack.Screen name="paystack" />
      <Stack.Screen name="multiple-summary" />
      <Stack.Screen name="empty-riders" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="all-quotes" />
      <Stack.Screen name="multiple-quotes" />
      <Stack.Screen name="package-locations" />
      <Stack.Screen name="package-details" />
      <Stack.Screen name="schedule-selection" />
      <Stack.Screen name="package-processing" />
      <Stack.Screen name="multiple-share-quote" />
    </Stack>
  );
}
