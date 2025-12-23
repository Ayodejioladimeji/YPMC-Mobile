import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";

import { colors } from "@/theme";

export interface TextProps extends RNTextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export default function Text({ children, style, ...props }: TextProps) {
  const styles = [baseStyle, style];

  return (
    <RNText {...props} style={styles}>
      {children}
    </RNText>
  );
}

const baseStyle = {
  color: colors.foreground,
  letterSpacing: -0.2,
  fontFamily: "interRegular",
} satisfies TextStyle;
