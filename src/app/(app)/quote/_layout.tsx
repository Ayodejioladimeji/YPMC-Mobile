import { Stack, useRouter } from "expo-router";


export default function ShippingLayout() {
  const router = useRouter()
  // 
  
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
        headerShown: false,
        headerTitleStyle: { fontFamily: "interMedium", fontSize: 16 },
        headerTitleAlign: "center",
        title: "Delivery Quotes",
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen name="package-info" />
      <Stack.Screen name="pickup-info" />
      <Stack.Screen name="delivery-info" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="multiple-summary" />
      <Stack.Screen name="share-quote" />
      <Stack.Screen name="package-locations" />
      <Stack.Screen name="package-details" />
    </Stack>
  );
}
