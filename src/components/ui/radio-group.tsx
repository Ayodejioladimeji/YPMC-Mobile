import { createContext, useContext, useState } from "react";
import {
  AccessibilityProps,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";

import { useControllableState } from "@/hooks/useControllableState";
import { colors } from "@/theme";

interface RadioGroupContextValue {
  value?: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  name?: string;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined,
);

function useRadioGroupContext(componentName: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <RadioGroup>`);
  }
  return context;
}

/* RadioGroup */

interface RadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  style,
  children,
  ...props
}) => {
  const [value, setValue] = useControllableState<string>({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const handleValueChange = (newValue: string) => {
    if (!disabled) {
      setValue(newValue);
    }
  };

  return (
    <RadioGroupContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        disabled,
        name,
      }}
    >
      <View style={style} {...props}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

/* RadioGroup.Item */

interface RadioGroupItemContextValue {
  isSelected: boolean;
}

const RadioGroupItemContext = createContext<
  RadioGroupItemContextValue | undefined
>(undefined);

function useRadioGroupItemContext(
  componentName: string,
): RadioGroupItemContextValue {
  const context = useContext(RadioGroupItemContext);
  if (!context) {
    throw new Error(
      `<${componentName}> must be used within a <RadioGroup.Item>`,
    );
  }
  return context;
}

interface RadioGroupItemProps extends ViewProps, AccessibilityProps {
  value: string;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  style,
  children,
  ...props
}) => {
  const {
    value: selectedValue,
    onValueChange,
    disabled,
  } = useRadioGroupContext("RadioGroup.Item");
  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  return (
    <RadioGroupItemContext.Provider value={{ isSelected }}>
      <TouchableOpacity
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected, disabled }}
        onPress={handlePress}
        disabled={disabled}
        style={[
          style,
          { opacity: disabled ? 0.5 : 1 },
          {
            borderColor: isSelected ? "#f97216" : colors.border,
            borderWidth: 1,
            backgroundColor: "transparent", // Optional: no background
          },
        ]}
        {...props}
      >
        {children}
      </TouchableOpacity>

    </RadioGroupItemContext.Provider>
  );
};

/*  RadioGroup Indicator */
interface RadioGroupIndicatorProps extends ViewProps {}

const RadioGroupIndicator: React.FC<RadioGroupIndicatorProps> = ({
  style,
  ...props
}) => {
  const { isSelected } = useRadioGroupItemContext("RadioGroup.Indicator");
  if (!isSelected) {
    return null;
  }
  return <View style={style} {...props} />;
};

export {
  RadioGroupContext,
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
  useRadioGroupContext,
  useRadioGroupItemContext,
};
