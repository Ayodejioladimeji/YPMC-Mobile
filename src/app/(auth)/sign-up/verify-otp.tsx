import React, { useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { verifyOTP } from "@/api/auth";
import { Button, ButtonText } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Text from "@/components/ui/text";
import { useAuthStore } from "@/store/auth";
import { useRegistrationStore } from "@/store/register";
import { colors, spacing } from "@/theme";
import { PostRequest } from "@/utils/requests";
import { storeToken } from "@/utils/helper";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import TopNavigation from "@/components/TopNavigation";

const schema = z.object({
  otp: z.string().length(6, { message: "Invalid OTP" }),
});

export default function VerifyOTP() {
  const router = useRouter();
  const email = useRegistrationStore((state) => state.data.email);
  const loginUser = useAuthStore((state) => state.loginUser);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const { dispatch } = useContext(DataContext)
  const inputRefs = useRef<Array<TextInput | null>>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: "",
    },
    mode: "onSubmit",
  });



  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Update form value
    form.setValue("otp", newOtpValues.join(""));

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all filled, dismiss keyboard
    if (newOtpValues.every((v) => v) && value) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpValues[index] && index > 0) {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = "";
      setOtpValues(newOtpValues);
      form.setValue("otp", newOtpValues.join(""));
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function handleSumbit(data: z.infer<typeof schema>) {
    setLoading(true)

    const payload = {
      email,
      otp: data?.otp
    }

    const res = await PostRequest("/auth/verify-otp", payload)
    if (res?.status === 200 || res?.status === 201) {
      await storeToken('token', res?.data?.data?.accessToken)
      dispatch({ type: ACTIONS.TOKEN, payload: res?.data?.data?.accessToken })
      toast.success(res?.data?.message, {
        duration: 2000,
      });
      router.push("/sign-up/upload-picture");
    }

    setLoading(false)
  }

  // send OTP
  const handleOtp = async() => {
    setOtpLoading(true)

    const payload = {
      email
    }

    const res = await PostRequest("/auth/send-otp", payload)
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message, {
        duration: 5000,
      });
    }

    setOtpLoading(false)
  }

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <TopNavigation title=""/>
    
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.heading}>Verification</Text>
        <Text style={styles.description}>
          Enter the verification code sent to{" "}
          <Text style={{ fontFamily: "interMedium" }}>{email}</Text>
        </Text>

        <Form {...form}>
          <View style={styles.wrapper}>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <View style={styles.otpContainer}>
                    {otpValues.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={[
                          styles.otpInput,
                          form.formState.errors.otp && styles.otpInputError,
                        ]}
                        maxLength={1}
                        keyboardType="number-pad"
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        selectTextOnFocus
                        autoComplete="one-time-code"
                        textContentType="oneTimeCode"
                        returnKeyType={index === 5 ? "done" : "next"}
                        blurOnSubmit={false}
                      />
                    ))}
                  </View>
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>

          <Button
            style={{ width: "100%", marginTop: 80 }}
            disabled={loading}
            onPress={form.handleSubmit(handleSumbit)}
          >
            <ButtonText>Verify & Proceed</ButtonText>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </Button>

          <View style={styles.resendContainer}>
            <Text style={styles.accountText}>
              Didn't receive a verification code?
            </Text>
            {otpLoading ? <ActivityIndicator color="#666" size="small" />
            :
            <Pressable onPress={handleOtp}>
              <Text style={styles.accountLink}>Resend</Text>
            </Pressable>}
          </View>
        </Form>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: 24,
  },
  description: {
    color: "rgba(99, 99, 99, 1)",
    fontFamily: "interRegular",
    fontSize: 12,
  },
  wrapper: {
    width: "100%",
    marginTop: spacing.huge,
    gap: spacing.md,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.sm,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#f3f3f3",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "interMedium",
  },
  otpInputError: {
    borderColor: "red",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
    gap: spacing.xxxs,
  },
  accountText: {
    color: "rgba(99, 99, 99, 1)",
    textAlign: "center",
    fontFamily: "interMedium",
    fontSize:15
  },
  accountLink: {
    color: colors.primary,
    fontSize:15
  },
});
