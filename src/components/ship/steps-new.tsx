import { Pressable, StyleSheet, View } from "react-native";

import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors } from "@/theme";

// import StepIndicator from "./step-indicator";

interface Step {
  step: number;
  title: string;
  key: string;
}

const steps: Step[] = [
  { step: 1, title: "Package Info", key: "package" },
  { step: 2, title: "Pickup Info", key: "pickup" },
  { step: 3, title: "Delivery Info", key: "delivery" },
];

export default function Steps() {
  const activeStep = useShippingStore((state) => state.step);
  const { setStep } = useShippingStore((state) => state.actions);

  return (
    <View
      style={{
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 40,
      }}
    >
      {steps.map((step, index) => (
        <View style={styles.stepContainer} key={step.title}>
          <Pressable
            style={[
              styles.stepIndicator,
              step.step < activeStep && styles.completedStep,
              step.step === activeStep && styles.activeStep,
            ]}
            onPress={() => {
              if (step.step < activeStep) {
                setStep(step.step);
              }
            }}
          >
            <Text
              style={[
                styles.stepNumber,
                step.step < activeStep && styles.completedStepNumber,
                step.step === activeStep && styles.activeStepNumber,
              ]}
            >
              {step.step}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.stepTitle,

              step.step < activeStep || step.step === activeStep
                ? styles.activeStepTitle
                : null,
            ]}
          >
            {step.title}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    alignItems: "center",
    flex: 1,
    // borderWidth: 1,
    // borderColor: "red",
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#63636380",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: ,
  },
  activeStep: {
    borderColor: colors.primary,
    backgroundColor: "#fff",
  },
  completedStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    color: "#63636380",
    fontFamily: "interRegular",
  },
  activeStepNumber: {
    color: colors.primary,
  },
  completedStepNumber: {
    color: "#fff",
  },
  stepTitle: {
    fontSize: 10,
    letterSpacing: -0.5,
    color: "#63636380",
    textAlign: "center",
    fontFamily: "interMedium",
  },
  activeStepTitle: {
    color: colors.primary,
  },
  stepLine: {
    position: "absolute",
    right: -40,
    top: 13,
    width: 80,
    height: 1.5,
    backgroundColor: "#63636380",
  },
  completedLine: {
    backgroundColor: colors.primary,
  },
});
