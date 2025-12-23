import React from "react";
import { Pressable } from "react-native";

import { Avatar as RNAvatar } from "react-native-paper";


export const Avatar = ({ onPress, size, source }:any) => {
  const imageSource = source?.uri ? { uri: source.uri } : null;

  return (
    <Pressable onPress={onPress}>
      <RNAvatar.Image size={size} source={imageSource} />
    </Pressable>
  );
};
