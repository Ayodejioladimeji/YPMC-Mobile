import React, {
  createContext,
  ElementRef,
  forwardRef,
  useContext,
} from "react";
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";

type Variants = keyof typeof variants;
type Sizes = keyof typeof sizes;
type ButtonContextType = {
  disabled?: boolean;
  pressed?: boolean;
  variant: Variants;
  size: Sizes;
};

export interface ButtonProps extends PressableProps {
  children?: React.ReactNode;
  disabled?: boolean;
  size?: Sizes;
  style?: StyleProp<ViewStyle>;
  variant?: Variants;
}

export type ButtonTextProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const ButtonContext = createContext<ButtonContextType>({
  disabled: false,
  pressed: false,
  variant: "default",
  size: "default",
});

const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      style,
      children,
      disabled,
      variant = "default",
      size = "default",
      ...rest
    },
    ref,
  ) => {
    function buttonStyle({ pressed }: PressableStateCallbackType) {
      return [
        styles.button,
        sizes[size],
        variants[variant],
        disabled && disabledStyles[variant],
        pressed && pressedStyles[variant],
        style,
      ];
    }

    function renderChildren() {
      if (typeof children === "string") {
        return <ButtonText>{children}</ButtonText>;
      }

      return children;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        ref={ref}
        style={buttonStyle}
        {...rest}
      >
        {({ pressed }) => (
          <ButtonContext.Provider value={{ disabled, pressed, size, variant }}>
            {renderChildren()}
          </ButtonContext.Provider>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";

const ButtonText = ({ children, style: optionalStyles }: ButtonTextProps) => {
  const { disabled, pressed, variant } = useContext(ButtonContext);
  const style = [
    textStyles[variant],
    pressed && pressedTextStyles[variant],
    { fontFamily: "interMedium" },
    optionalStyles,
  ] satisfies StyleProp<TextStyle>;

  return <Text style={style}>{children}</Text>;
};

const ButtonIcon = ({ children }: { children: React.ReactNode }) => {
  return <View style={{}}>{children}</View>;
};

export { Button, ButtonIcon, ButtonText };

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    // alignSelf: "flex-start", // Apply this style in your button instance to align the button to the left
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: 20,
    overflow: "hidden",
  },
});

const sizes = {
  default: { height: 56, paddingHorizontal: spacing.huge } satisfies ViewStyle,
  sm: { height: 48, paddingHorizontal: spacing.base } satisfies ViewStyle,
  lg: { height: 64, paddingHorizontal: 60 } satisfies ViewStyle,
  icon: { height: 42, width: 42 } satisfies ViewStyle,
};

const variants = {
  default: { backgroundColor: colors.primary } satisfies StyleProp<ViewStyle>,
  outline: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1.5,
  } satisfies StyleProp<ViewStyle>,
  ghost: { backgroundColor: "transparent" } satisfies StyleProp<ViewStyle>,
  destructive: {
    backgroundColor: colors.palette.destructive,
    borderColor: colors.palette.destructive,
    borderWidth: 1.5,
  } satisfies StyleProp<ViewStyle>,
};

const pressedStyles = {
  default: { opacity: 0.9 } satisfies ViewStyle,
  outline: { backgroundColor: colors.accent } satisfies ViewStyle,
  ghost: { backgroundColor: colors.accent } satisfies ViewStyle,
  destructive: {
    backgroundColor: colors.palette.destructive,
  } satisfies ViewStyle,
};

const disabledStyles = {
  default: {
    backgroundColor: colors.palette.primaryDisabled,
  } satisfies ViewStyle,
  outline: { borderColor: colors.border } satisfies ViewStyle,
  ghost: {} satisfies ViewStyle,
  destructive: {} satisfies ViewStyle,
};

const textStyles = {
  default: { color: colors.background } satisfies StyleProp<TextStyle>,
  outline: { color: colors.foreground } satisfies StyleProp<TextStyle>,
  ghost: { color: colors.mutedForeground } satisfies StyleProp<TextStyle>,
  destructive: {
    color: colors.palette.destructiveForeground,
  } satisfies StyleProp<TextStyle>,
};

const pressedTextStyles = {
  default: {} satisfies StyleProp<TextStyle>,
  outline: {} satisfies StyleProp<TextStyle>,
  ghost: {} satisfies StyleProp<TextStyle>,
  destructive: {} satisfies StyleProp<TextStyle>,
};
