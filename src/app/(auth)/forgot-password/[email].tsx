import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import TopNavigation from "@/components/TopNavigation";
import { s } from "react-native-size-matters";
import { PostRequest } from "@/utils/requests";
import { toast } from "sonner-native";
import { DataContext } from "@/store/GlobalState";
import { Button, ButtonText } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";
import { Inputs } from "@/components/ui/Inputs";

const schema = z
  .object({
    otp: z.string().min(6, { message: "OTP must be 6 characters" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"], // Assign error to confirmPassword
      });
    }
  });

type FormData = z.infer<typeof schema>;

const CreateNewPassword = () => {
  const { email } = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const [buttonLoading, setButtonLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { state } = useContext(DataContext);

  async function onSubmit(data: z.infer<typeof schema>) {
    setButtonLoading(true);

    const payload = {
      newPassword: data?.password,
      otp: data.otp,
    };

    const res = await PostRequest("/auth/reset-password", payload);
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message);
      router.replace("/(auth)/sign-in");
    }

    setButtonLoading(false);
  }

  // resend OTP
  const handleResend = async () => {
    setResendLoading(true);

    const payload = {
      email,
    };

    const res = await PostRequest("/auth/send-otp", payload, state?.token);
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message);
    }
    setResendLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavigation title="" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.headerText}>Update your password</Text>

          <View style={{ marginTop: 20 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Inputs
                  placeholder="Enter password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={true}
                  label="New password"
                />
              )}
            />
            {errors.password && (
              <Text style={{ color: "red", fontSize: 14 }}>
                {errors.password.message}
              </Text>
            )}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Inputs
                  placeholder="Enter password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={true}
                  label="Confirm password"
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={{ color: "red", fontSize: 14 }}>
                {errors.confirmPassword.message}
              </Text>
            )}

            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <Inputs
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  value={value}
                  onChangeText={onChange}
                  maxLength={6}
                  label="OTP"
                />
              )}
            />
            {errors.otp && (
              <Text style={{ color: "red", fontSize: 14 }}>
                {errors.otp.message}
              </Text>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 30,
            }}
          >
            <Text
              style={{
                fontSize: 15,
              }}
            >
              Didnt receive any OTP?{" "}
            </Text>
            {resendLoading ? (
              <ActivityIndicator color="#666" size="small" />
            ) : (
              <Pressable onPress={handleResend}>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#F97216",
                    textDecorationLine: "underline",
                  }}
                >
                  Resend OTP
                </Text>
              </Pressable>
            )}
          </View>

          <Button
            style={styles.button}
            disabled={buttonLoading}
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>Update password</ButtonText>
            {buttonLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <AntDesign name="arrowright" size={18} color="white" />
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageStyle: {
    marginVertical: 20,
    alignSelf: "center",
  },

  headerText: {
    fontSize: s(20),
    fontWeight: "bold",
    marginBottom: 10,
  },
  privacyText: {
    color: "#636363",
    marginTop: 40,
    marginBottom: 50,
    textAlign: "center",
  },
  highlightedText: {
    color: "#F97216",
  },
  button: {
    marginTop: 10,
    gap: 5,
  },
});

export default CreateNewPassword;