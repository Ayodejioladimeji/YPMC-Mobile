import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CustomModalProps = {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function InviteModal({
  visible,
  onClose = () => { },
  children,
}: CustomModalProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        animatedValue.setValue(0);
      });
    }
  }, [visible]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // 
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
        <View style={styles.container}>
          {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Modal Content */}
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            {/* Modal Content */}
            {children}
          </Animated.View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    minHeight: 200,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
});
