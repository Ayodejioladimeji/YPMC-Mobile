import React, { useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";




export const Inputs = ({
  label,
  icon,
  placeholder,
  variant = "outlined",
  disabled,
  ...props
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedBorderBottom = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedBorderBottom, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedBorderBottom, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const inputContainerStyle =
    variant === "outlined"
      ? styles.outlinedInputContainer
      : styles.filledInputContainer;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {icon && <Ionicons name={icon} size={16} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Animated.View style={[inputContainerStyle, isFocused && styles.focused]}>
        <View style={styles.inputWrapper}>
          <TextInput
            {...props}
            placeholder={placeholder}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={(label?.includes("password") || label?.includes("Password") ) && !showPassword}
            placeholderTextColor="#63636380" 
          />
          {(label?.includes("password") || label?.includes("Password")) && (
            <Pressable
              style={styles.password}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={23} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 5,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    // marginBottom: 5,
    color: "#000000",
  },
  outlinedInputContainer: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  filledInputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    padding: 8,
  },
  input: {
    height: 40,
    fontSize: 16,
    paddingVertical: 5,
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    width: "100%",
  },
  password: {
    position: "absolute",
    marginTop: 8,
    right: 8,
  },
  focused: {
    borderColor: "orange",
  },
});