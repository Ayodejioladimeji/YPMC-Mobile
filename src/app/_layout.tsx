import { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-get-random-values";
import "react-native-reanimated";
import Providers from "@/components/providers";
import { useAuthStore } from "@/store/auth";
import { DataProvider } from "@/store/GlobalState";
import { Toaster } from "sonner-native";
import { Toasts } from "@/components/ui/Toasts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    interThin: require("@/assets/fonts/Inter-Thin.ttf"),
    interExtraLight: require("@/assets/fonts/Inter-ExtraLight.ttf"),
    interLight: require("@/assets/fonts/Inter-Light.ttf"),
    interRegular: require("@/assets/fonts/Inter-Regular.ttf"),
    interMedium: require("@/assets/fonts/Inter-Medium.ttf"),
    interSemiBold: require("@/assets/fonts/Inter-SemiBold.ttf"),
    interBold: require("@/assets/fonts/Inter-Bold.ttf"),
    interExtraBold: require("@/assets/fonts/Inter-ExtraBold.ttf"),
    interBlack: require("@/assets/fonts/Inter-Black.ttf"),
    ...Ionicons.font,
  });

  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (loaded || error || hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated, loaded, error]);


  if (!loaded && !error && !hasHydrated) {
    return null;
  }

  return (
    <Providers>
      <Toasts />
      <DataProvider>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <Toaster position="top-center" />
      </DataProvider>
    </Providers>
  );
}
