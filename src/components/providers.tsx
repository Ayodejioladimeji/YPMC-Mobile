import React, { useId, useState } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast, Toaster } from "sonner-native";

import { useAuthStore } from "@/store/auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const id = useId();
  const router = useRouter();
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // if error is a 401, don't retry else retry 3 times
            retry: (failureCount, error) => {
              if (error?.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error?.response?.status === 401) {
              // if (!pathname.startsWith("/dashboard")) return;
              // router.push(`/login?callbackUrl=${pathname}`);
              // router.replace("/(auth)/sign-in");
              toast.error("Session expired, please login again", {
                id: id,
              });
              logoutUser();
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        <Toaster position="top-center" />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
