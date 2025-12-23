import { View } from "react-native";

import StepIndicator from "./step-indicator";

interface Step {
  title: string;
  key: string;
}

const steps: Step[] = [
  { title: "Package Info", key: "package" },
  { title: "Pickup Info", key: "pickup" },
  { title: "Delivery Info", key: "delivery" },
];

export default function Steps() {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 36,
        paddingHorizontal: 40,
      }}
    >
      {steps.map((_, index) => (
        <StepIndicator key={index} stepIndex={index} />
      ))}
    </View>
  );
}
