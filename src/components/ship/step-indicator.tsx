import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Href, usePathname, useRouter } from "expo-router";

import Text from "@/components/ui/text";
import { colors } from "@/theme";

interface Step {
  title: string;
  key: string;
  path: any;
}

const steps: Step[] = [
  {
    title: "Package Info",
    key: "package",
    path: "/ship/package-info",
  },
  { title: "Pickup Info", key: "pickup", path: "/ship/pickup-info" },
  {
    title: "Delivery Info",
    key: "delivery",
    path: "/ship/delivery-info",
  },
];

export default function StepIndicator({ stepIndex }: { stepIndex: number }) {
  const router = useRouter();
  const pathname = usePathname();

  const currentPath = steps[stepIndex].path;
  const isActive = pathname === currentPath;

  // this condition is right everytime except when the initial
  const isCompleted =
    steps.findIndex((step) => step.path === pathname) > stepIndex;

  function handlePress() {
    // handle edge cases to prevent user to go to next step without completing the current step
    if (isCompleted || isActive) {
      router.push(currentPath);
    }
  }

  return (
    <View style={styles.stepContainer} key={stepIndex}>
      <Pressable
        style={[
          styles.stepIndicator,
          isCompleted && styles.completedStep,
          isActive && styles.activeStep,
        ]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.stepNumber,
            isActive && styles.activeStepNumber,
            isCompleted && styles.completedStepNumber,
          ]}
        >
          {stepIndex + 1}
        </Text>
      </Pressable>

      <Text
        style={[
          styles.stepTitle,
          (isActive || isCompleted) && styles.activeStepTitle,
        ]}
      >
        {steps[stepIndex].title}
      </Text>

      {stepIndex < steps.length - 1 && (
        <View style={[styles.stepLine, isCompleted && styles.completedLine]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    alignItems: "center",
    flex: 1,
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
    zIndex:9
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
    fontFamily: "interSemiBold",
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
