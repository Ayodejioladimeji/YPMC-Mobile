import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { PackageDetails } from "@/api/shipping";

type State = {
  step: number;
  type: string;
  currentItem: PackageDetails;
  items: PackageDetails[];
};

type Actions = {
  actions: {
    setCurrentItem: (item: Partial<PackageDetails>) => void;
    resetCurrentItem: () => void;
    setItems: (item: PackageDetails) => void;
    setStep: (step: number) => void;
    setType: (type: string) => void;
    goToNextStep: () => void;
    goToPrevStep: () => void;
    resetStore: () => void;
  };
};

const initState = {
  step: 1,
  type: "",
  currentItem: {
    packageName: "",
    packageSize: "MEDIUM" as "SMALL" | "MEDIUM" | "LARGE",
    isFragile: false,
    isSecurityShipping: false,
    packageNotes: "",
    pickupStreet: "12 Awolowo Road",
    pickupArea: "Ikoyi",
    pickupState: "Lagos",
    pickupLongitude: 3.421998,
    pickupLatitude: 6.454722,
    dropoffStreet: "18 Marina Street",
    dropoffArea: "Lagos Island",
    dropoffState: "Lagos",
    dropoffLongitude: 3.39153,
    dropoffLatitude: 6.45152,
    senderName: "",
    senderPhoneNumber: "08175333235",
    receiverName: "",
    receiverPhoneNumber: "08175333235",
    pickupTime: null,
    pickupDate: null,
    deliveryTime: null,
    deliveryDate: null,
  },
  items: [],
};

export const useShippingStore = create<State & Actions>()(
  immer((set) => ({
    ...initState,
    actions: {
      setCurrentItem: (item) => {
        set((state) => {
          state.currentItem = { ...state.currentItem, ...item };
        });
      },
      resetCurrentItem: () => {
        set((state) => {
          state.currentItem = initState.currentItem;
        });
      },
      setItems: (item) => {
        set((state) => {
          state.items = [...state.items, item];
        });
      },
      setStep: (step) => {
        set((state) => {
          state.step = step;
        });
      },
      setType: (type) => {
        set((state) => {
          state.type = type;
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
        set((state) => {
          state.step = 1;
        });
      },
    },
  })),
);
