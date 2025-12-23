import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";



export default function ProgressBar({order}:any) {
  const progressValue = useSharedValue(0);

  const progress = order?.status === "DELIVERED" ? 100 : 65;
  const duration = 2000;
  // const height = 28;
  const springAnimation = false;

  useEffect(() => {
    // Animate to new progress value
    if (springAnimation) {
      progressValue.value = withSpring(progress, {
        damping: 15,
        stiffness: 90,
      });
    } else {
      progressValue.value = withTiming(progress, {
        duration,
      });
    }
  }, [progress, duration, springAnimation]);

  // Create animated style for the progress bar
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
      height: "100%",
      backgroundColor: order?.status === "DELIVERED" ? "#4CAF50" : "#1E83C5",
      borderTopRightRadius: 28 / 2,
      borderBottomRightRadius: 28 / 2,
    };
  });

  return (
    <View style={[styles.container]}>
      <Animated.View
        style={[animatedStyle, { justifyContent: "center", paddingRight: 4 }]}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 100,
            alignSelf: "flex-end",
            padding: 2,
          }}
        >
          <Ionicons name="bicycle-outline" size={16} color="#1E83C5" />
        </View>
      </Animated.View>
      {/*       */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    height:28,
    backgroundColor: "#6363631A",
    overflow: "hidden",
    // marginVertical: 10,
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#000",
    fontSize: 12,
    fontFamily: "interBold",
  },
});
