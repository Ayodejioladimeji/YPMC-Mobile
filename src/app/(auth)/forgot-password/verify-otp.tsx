import { useContext, useEffect, useRef, useState } from "react";
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
import { usePasswordResetStore } from "@/store/password-reset";
import { colors, spacing } from "@/theme";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";

const schema = z.object({
  otp: z.string().length(6, { message: "Invalid OTP" }),
});

export default function VerifyOTP() {
  const router = useRouter();
  const email = usePasswordResetStore((state) => state.email);
  const setToken = usePasswordResetStore((state) => state.actions.setToken);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false)
  const {state} = useContext(DataContext)
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

  const mutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      setToken(data.data.accessToken);
      router.push("/forgot-password/create-new-password");
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 6000,
      });
    },
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

  function handleSumbit(data: z.infer<typeof schema>) {

    mutation.mutate({
      email: email,
      otp: data.otp,
    });
  }

  // resend OTP
  const handleResend = async() => {
    setResendLoading(true)

    const payload = {
      email
    }

    const res = await PostRequest("/auth/send-otp", payload, state?.token)
    if(res?.status === 200 || res?.status === 201){
      toast.success(res?.data?.message)
    }
    setResendLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
            disabled={mutation.isPending}
            onPress={form.handleSubmit(handleSumbit)}
          >
            <ButtonText>Verify & Proceed</ButtonText>
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </Button>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: spacing.md,
              gap: spacing.xxxs,
            }}
          >
            <Text style={styles.accountText}>
              Didn’t receive a verification code?
            </Text>

            {resendLoading ? <ActivityIndicator color="#666" size="small"/> :
            <Pressable onPress={handleResend}>
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
  logo: {
    width: "100%",
    height: 200,
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
  label: {
    fontSize: 16,
  },
  input: {
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: "rgba(99, 99, 99, 0.5)",
    borderRadius: 0,
  },
  button: {
    marginTop: spacing.huge,
  },
  link: {
    alignSelf: "flex-end",
    fontFamily: "interMedium",
  },
  accountText: {
    color: "rgba(99, 99, 99, 1)",
    textAlign: "center",
    fontFamily: "interMedium",
  },
  accountLink: {
    color: colors.primary,
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
});
