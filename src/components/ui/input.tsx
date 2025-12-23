import React, { ElementRef, forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "@/theme";

export interface InputProps extends TextInputProps { }

const Input = forwardRef<ElementRef<typeof TextInput>, InputProps>(
  ({ style, secureTextEntry, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const buttonstyle = [styles.input, style];

    return (
      <View style={styles.container}>
        <TextInput
          cursorColor={colors.foreground}
          ref={ref}
          style={buttonstyle}
          secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color={colors.foreground}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
export default Input;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    borderRadius: 20,
    height: 55,
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    height: "100%",
    justifyContent: "center",
  },
});
