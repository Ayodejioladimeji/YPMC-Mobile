import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type State = {
  token?: string;
  isFirstTime: boolean;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
};

type Actions = {
  loginUser: (token: string) => void;
  logoutUser: () => void;
  setIsFirstTime: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

const initState = {
  token: undefined,
  isFirstTime: true,
  isLoggedIn: false,
  _hasHydrated: false,
};

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        ...initState,
        loginUser: (token) => set((state) => ({ token, isLoggedIn: true })),
        logoutUser: () =>
          set((state) => ({ token: undefined, isLoggedIn: false })),
        setIsFirstTime: (value) => set((state) => ({ isFirstTime: value })),
        setHasHydrated: (value) => set((state) => ({ _hasHydrated: value })),
      }),
      {
        name: "authStore",
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: (state) => {
          return () => {
            state.setHasHydrated(true);
          };
        },
      },
    ),
  ),
);
