import { forwardRef, useContext, useMemo, useState } from "react";
import {
  StyleSheet,
} from "react-native";

import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import PaymentComponent from "./payment-component";
import { DataContext } from "@/store/GlobalState";

type ModeOfPaymentProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
};

const SNAP_POINTS = ["100%"];

const ModeOfPaymentSheet = forwardRef<BottomSheetModal, ModeOfPaymentProps>(
  ({ index, position}, ref) => {
    const {state} = useContext(DataContext)
    const {user, shippingId} = state
    const { top } = useSafeAreaInsets();

    const closeSheet = () => {
      if (ref && typeof ref !== "function" && ref?.current) {
        ref.current.dismiss(); 
      }
    };
// 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDynamicSizing={false}
        key="ModeOfPaymentSheet"
        name="ModeOfPaymentSheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={top}
      >
         <PaymentComponent closeSheet={closeSheet} customerId={user?.id} shippingId={shippingId} user={user} state={state}/>
      </BottomSheetModal>
    );
  },
);

export default ModeOfPaymentSheet;

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
  scrollViewContentContainer: {
    rowGap: 10,
  },
  shadow: {
    shadowColor: "#636363",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  amountText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B00",
  },
  paymentButton: {
    backgroundColor: "#FF6B00",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
