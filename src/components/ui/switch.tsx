import React, { createContext, forwardRef, useContext } from "react";
import {
  AccessibilityProps,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { useControllableState } from "@/hooks/useControllableState";

interface SwitchProps extends ViewProps, AccessibilityProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface SwitchContextValue {
  checked?: boolean;
  disabled: boolean;
  toggle: () => void;
}

const SwitchContext = createContext<SwitchContextValue | undefined>(undefined);

const useSwitchContext = (componentName: string) => {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error(
      `<${componentName}> must be used within a <Switch> component.`,
    );
  }
  return context;
};

const Switch = forwardRef<View, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [checked, setChecked] = useControllableState<boolean>({
      prop: controlledChecked,
      defaultProp: defaultChecked,
      onChange: onCheckedChange,
    });

    const toggle = () => {
      if (disabled) return;
      setChecked(!checked);
    };

    const contextValue: SwitchContextValue = {
      checked,
      disabled,
      toggle,
    };

    return (
      <SwitchContext.Provider value={contextValue}>
        <TouchableWithoutFeedback
          onPress={toggle}
          disabled={disabled}
          accessibilityRole="switch"
          accessibilityState={{ checked, disabled }}
          {...props}
        >
          <View ref={ref} style={style}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </SwitchContext.Provider>
    );
  },
);

Switch.displayName = "Switch";

/* SwitchThumb Component */
interface SwitchThumbProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

const SwitchThumb = forwardRef<View, SwitchThumbProps>(
  ({ style, ...props }, ref) => {
    const { checked } = useSwitchContext("SwitchThumb");

    return (
      <View
        ref={ref}
        style={[
          style,
          {
            transform: [{ translateX: checked ? 20 : 0 }],
          },
        ]}
        {...props}
      />
    );
  },
);

SwitchThumb.displayName = "SwitchThumb";

/* SwitchTrack Component */
interface SwitchTrackProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

const SwitchTrack = forwardRef<View, SwitchTrackProps>(
  ({ style, children, ...props }, ref) => {
    const { checked } = useSwitchContext("SwitchTrack");

    return (
      <View
        ref={ref}
        style={[
          style,
          // {
          //   backgroundColor: checked ? "green" : "grey",
          // },
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
);

SwitchTrack.displayName = "SwitchTrack";

export { Switch, SwitchThumb, SwitchTrack, useSwitchContext };
