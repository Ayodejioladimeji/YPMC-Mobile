import React from "react";
import { Animated, StyleSheet, View } from "react-native";

import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";

export default function RiderSearchProgressBar() {
  const progressAnim = new Animated.Value(0);

  Animated.loop(
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }),
  ).start();

  // 

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.loadingText}>
          Searching for available riders...
        </Text>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [
                  {
                    translateX: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingVertical: 15,
    backgroundColor: "black",
    borderRadius: spacing.md,
  },
  progressContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginBottom: spacing.xs,
    fontSize: 16,
    fontFamily: "interMedium",
    color: "#fff",
  },
  progressBackground: {
    width: "80%",
    height: 8,
    backgroundColor: "000000B2",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "50%",
    backgroundColor: colors.primary,
  },
});
