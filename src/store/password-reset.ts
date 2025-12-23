import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  email: string;
  token: string;
};

type Actions = {
  actions: {
    setEmail: (email: string) => void;
    setToken: (token: string) => void;
  };
};

const initState = {
  email: "",
  token: "",
};

export const usePasswordResetStore = create<State & Actions>()(
  immer((set) => ({
    ...initState,
    actions: {
      setEmail: (email) => {
        set((state) => {
          state.email = email;
        });
      },
      setToken: (token) => {
        set((state) => {
          state.token = token;
        });
      },
    },
  })),
);
