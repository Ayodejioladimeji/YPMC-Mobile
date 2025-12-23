import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  step: number;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    referredBy?: string;

  };
};

type Actions = {
  actions: {
    setData: (data: Partial<State["data"]>) => void;
    setStep: (step: number) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    resetStore: () => void;
  };
};

const initState = {
  step: 1,
  data: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  },
};

export const useRegistrationStore = create<State & Actions>()(
  immer((set) => ({
    ...initState,
    actions: {
      setData: (data) => {
        set((state) => {
          state.data = { ...state.data, ...data };
        });
      },
      setStep: (step) => {
        set((state) => {
          state.step = step;
        });
      },
      goToNextStep: () => {
        set((state) => {
          state.step += 1;
        });
      },
      goToPrevStep: () => {
        set((state) => {
          state.step -= 1;
        });
      },
      resetStore: () => {
        set(initState);
      },
    },
  }))
);
