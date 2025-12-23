import React from "react";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Button, ButtonText } from "@/components/ui/button";
import { colors, spacing } from "@/theme";


type Slide = {
  id: string;
  image: any;
  title: string;
  description: string;
  buttonLabel: string;
  buttonLabel2: string;
};

type RenderItemProps = {
  index: number;
  item: Slide;
  handlePress: () => void;
  handleNextSlide: (currentIndex: number) => void;
  isLastSlide: boolean;
  createAccount: () => void;
};

const { width } = Dimensions.get("window");

export function Slide({
  item,
  index,
  handleNextSlide,
  handlePress,
  isLastSlide,
  createAccount,
}: RenderItemProps) {

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        width,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
      }}
    >
      <Image
        source={item.image}
        style={{ height: 250, width: "100%" }}
        contentFit="cover"
      />

      <View style={{ marginTop: spacing.md }}>
        <Text
          style={{
            marginBottom: 8,
            fontSize: 30,
            fontWeight: 600
          }}
        >
          {item.title}
        </Text>

        <Text style={{ color: "#636363", fontSize: 16 }}>
          {item.description}
        </Text>
      </View>

      <View style={{ marginTop: "auto" }}>
        {isLastSlide ? (
          <>
            <TouchableOpacity onPress={createAccount}
              style={{ backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderRadius: 25, }}
            >
              <Text style={{ color: 'white' }}>{item.buttonLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePress}
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                marginTop: 10,
                borderColor: "#F97216",
                alignItems: 'center', justifyContent: 'center',
                paddingVertical: 20,
                borderRadius: 25
              }}
            >
              <Text style={{ color: "#F97216" }}>
                {item.buttonLabel2}
              </Text>
            </TouchableOpacity>
          </>
        ) : (

          <TouchableOpacity
            activeOpacity={0.7}
            style={{ backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderRadius: 25, }}
            onPress={() => handleNextSlide(index)}>
            <Text style={{ color: 'white' }}>{item.buttonLabel}</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>


    </View>
  );
}



export function Dot({
  index,
  currentIndex
}: {
  index: number;
  currentIndex: SharedValue<number>;
}) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const backgroundColor = interpolateColor(currentIndex.value, inputRange, [
      "#63636333",
      "#636363",
      "#63636333",
    ]);

    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: "#63636333",
        },
        dotStyle,
      ]}
    />
  );
}
