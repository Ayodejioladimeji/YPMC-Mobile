import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import { useControllableState } from "@/hooks/useControllableState";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type AccordionValue = string | string[];
type AccordionType = "single" | "multiple";

interface AccordionState {
  value: AccordionValue;
  type: AccordionType;
  disabled?: boolean;
}

interface AccordionContextValue extends AccordionState {
  onValueChange: (itemValue: string) => void;
}

interface AccordionItemContextValue {
  itemValue: string;
  isExpanded: boolean;
  isDisabled?: boolean;
}

interface StyleState {
  expanded: boolean;
  disabled?: boolean;
  pressed?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined,
);

const AccordionItemContext = createContext<
  AccordionItemContextValue | undefined
>(undefined);

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/

const useAccordionContext = (component: string) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      `<${component}> must be used within an <Accordion> component`,
    );
  }
  return context;
};

const useAccordionItemContext = (component: string) => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      `<${component}> must be used within an <Accordion.Item> component`,
    );
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * Accordion
 * -----------------------------------------------------------------------------------------------*/

interface AccordionProps {
  type?: AccordionType;
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function Accordion({
  type = "single",
  value: controlledValue,
  defaultValue = type === "single" ? "" : [],
  onValueChange,
  disabled,
  style,
  children,
}: AccordionProps) {
  const [value, setValue] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const handleValueChange = useCallback(
    (itemValue: string) => {
      if (type === "single") {
        const newValue = itemValue === value ? "" : itemValue;
        setValue(newValue);
      } else {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.includes(itemValue)
          ? currentValue.filter((v) => v !== itemValue)
          : [...currentValue, itemValue];
        setValue(newValue);
      }
    },
    [type, value, setValue],
  );

  return (
    <AccordionContext.Provider
      value={{
        value,
        type,
        disabled,
        onValueChange: handleValueChange,
      }}
    >
      <View style={style}>{children}</View>
    </AccordionContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle> | ((state: StyleState) => StyleProp<ViewStyle>);
  children?: React.ReactNode;
}

function AccordionItem({
  value: itemValue,
  disabled: itemDisabled,
  style,
  children,
}: AccordionItemProps) {
  const {
    value,
    type,
    disabled: accordionDisabled,
  } = useAccordionContext("Accordion.Item");

  const isDisabled = accordionDisabled || itemDisabled;
  const isExpanded =
    type === "single"
      ? value === itemValue
      : Array.isArray(value) && value.includes(itemValue);

  const resolvedStyle =
    typeof style === "function"
      ? style({ expanded: isExpanded, disabled: isDisabled })
      : style;

  return (
    <AccordionItemContext.Provider
      value={{
        itemValue,
        isExpanded,
        isDisabled,
      }}
    >
      <View style={resolvedStyle}>{children}</View>
    </AccordionItemContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/

interface AccordionTriggerProps {
  style?: StyleProp<ViewStyle> | ((state: StyleState) => StyleProp<ViewStyle>);
  children?: React.ReactNode | ((state: StyleState) => React.ReactNode);
}

function AccordionTrigger({ style, children }: AccordionTriggerProps) {
  const { onValueChange } = useAccordionContext("Accordion.Trigger");
  const { itemValue, isExpanded, isDisabled } =
    useAccordionItemContext("Accordion.Trigger");
  const [pressed, setPressed] = useState(false);

  const state = {
    expanded: isExpanded,
    disabled: isDisabled,
    pressed,
  };

  const resolvedStyle = typeof style === "function" ? style(state) : style;

  const resolvedChildren =
    typeof children === "function" ? children(state) : children;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onValueChange(itemValue)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityState={{
        expanded: isExpanded,
        disabled: isDisabled,
      }}
      style={resolvedStyle}
    >
      {resolvedChildren}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/

interface AccordionContentProps {
  animationDuration?: number;
  style?: StyleProp<ViewStyle> | ((state: StyleState) => StyleProp<ViewStyle>);
  children?: React.ReactNode | ((state: StyleState) => React.ReactNode);
}

function AccordionContent({
  animationDuration = 200,
  style,
  children,
}: AccordionContentProps) {
  const { isExpanded, isDisabled } =
    useAccordionItemContext("Accordion.Content");
  const { height: screenHeight } = useWindowDimensions();
  const contentHeight = useRef(new Animated.Value(0)).current;
  const [measuring, setMeasuring] = useState(true);
  const [contentHeightValue, setContentHeightValue] = useState(0);

  useEffect(() => {
    if (!measuring) {
      if (Platform.OS === "ios") {
        Animated.timing(contentHeight, {
          toValue: isExpanded ? contentHeightValue : 0,
          duration: animationDuration,
          useNativeDriver: false,
        }).start();
      } else {
        LayoutAnimation.configureNext(
          LayoutAnimation.create(
            animationDuration,
            LayoutAnimation.Types.easeInEaseOut,
            LayoutAnimation.Properties.opacity,
          ),
        );
      }
    }
  }, [
    isExpanded,
    measuring,
    contentHeightValue,
    contentHeight,
    animationDuration,
  ]);

  const state = {
    expanded: isExpanded,
    disabled: isDisabled,
  };

  const resolvedStyle = typeof style === "function" ? style(state) : style;

  const resolvedChildren =
    typeof children === "function" ? children(state) : children;

  if (!isExpanded && !measuring) return null;

  return (
    <Animated.View
      style={[
        Platform.OS === "ios" && {
          height: contentHeight,
          overflow: "hidden",
        },
        resolvedStyle,
      ]}
    >
      <View
        style={measuring ? { position: "absolute", opacity: 0 } : undefined}
        onLayout={({ nativeEvent }) => {
          const height = Math.min(nativeEvent.layout.height, screenHeight);
          setContentHeightValue(height);
          if (measuring) {
            contentHeight.setValue(isExpanded ? height : 0);
            setMeasuring(false);
          }
        }}
      >
        {resolvedChildren}
      </View>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Compose Accordion
 * -----------------------------------------------------------------------------------------------*/

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

/* -------------------------------------------------------------------------------------------------
 * Export
 * -----------------------------------------------------------------------------------------------*/

export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  StyleState as AccordionStyleState,
};
