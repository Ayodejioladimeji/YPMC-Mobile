import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import * as z from "zod";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { useContext, useEffect, useRef, useState } from "react";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { storeToken } from "@/utils/helper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OneSignal } from "react-native-onesignal";
import * as Device from "expo-device";
import * as Network from "expo-network";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must not be less than 6 characters" }),
});

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const { dispatch } = useContext(DataContext)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [focusedField, setFocusedField] = useState<null | string>(null);


  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    const getData = async () => {
      OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);

      OneSignal.Notifications.requestPermission(true);

      const deviceToken = await OneSignal.User.pushSubscription.getIdAsync();
      const ipAddress = await Network.getIpAddressAsync()
      const model = Device?.deviceName;
      const osVersion = Device?.osVersion;
      const appVersion = "1.0.0"

      const data = {
        deviceToken,
        ipAddress,
        model,
        osVersion,
        appVersion
      }

      setDeviceInfo(data)
      dispatch({ type: ACTIONS.DEVICE_INFO, payload: data })
    }
    getData()
  }, [])


  async function handleSumbit(data: z.infer<typeof schema>) {
    setLoading(true)

    const payload = {
      ...data,
      deviceToken: deviceInfo?.deviceToken,
      platform: Platform.OS,
      deviceInfo: {
        model: deviceInfo?.model,
        osVersion: deviceInfo?.osversion,
        appVersion: deviceInfo?.appVersion
      },
      ipAddress: deviceInfo?.ipAddress
    }


    const res = await PostRequest("/auth/login/customer", payload)
    if (res?.status === 200 || res?.status === 201) {
      await storeToken('token', res?.data?.data?.accessToken)
      dispatch({ type: ACTIONS.TOKEN, payload: res?.data?.data?.accessToken })
      toast.success(res?.data?.message, {
        duration: 1000,
      });
      router.replace("/(app)/(tabs)/home")
    }

    if (res === "Please verify your account to continue") {
      router.push("/sign-up/verify-otp");
      handleOtp(data?.email)

    }
    setLoading(false)
  }

  const handleOtp = async (email: string) => {
    const payload = {
      email
    }

    await PostRequest("/auth/send-otp", payload)

  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: 'white' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 30 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/onboarding-1.png")}
          style={styles.logo}
          contentFit="cover"
        />

        <View style={{ flex: 1, marginTop: spacing.huge }}>
          <Text style={styles.heading}>Sign In</Text>
          <Text style={styles.description}>
            Enter sign in information to continue
          </Text>

          <Form {...form}>
            <View style={styles.wrapper}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={styles.label}>Email</FormLabel>
                    <Input
                      autoCapitalize="words"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onChangeText={field.onChange}
                      placeholder="Enter email or phone number"
                      placeholderTextColor={"#63636380"}
                      returnKeyType="next"
                      style={[
                        styles.input,
                        focusedField === "email" && { borderColor: "#f97216" },
                      ]}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      autoFocus={true}
                      {...field}

                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={styles.label}>Password</FormLabel>
                    <Input
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Password"
                      secureTextEntry={true}
                      returnKeyType="done"
                      placeholderTextColor={"#63636380"}
                      onChangeText={field.onChange}
                      style={[
                        styles.input,
                        focusedField === "password" && { borderColor: "#f97216" },
                      ]}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      {...field}
                    />
                    <FormMessage />

                    <Link style={styles.forgotPassword} href="/forgot-password">
                      Forgot Password?
                    </Link>
                  </FormItem>
                )}
              />
            </View>

            <Button
              style={{ marginTop: spacing.huge }}
              disabled={loading}
              onPress={form.handleSubmit(handleSumbit)}
            >
              <Text style={{ color: "white", fontWeight: 'bold' }}>Sign In</Text>

              {loading ? (
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
                marginBottom: Platform.OS === "android" ? 50 : 0

              }}
            >
              <Text style={styles.accountText}>Don't have an account?</Text>

              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text style={styles.accountLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Form>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
  },
  logo: {
    width: "100%",
    height: 200,
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: 36,
  },
  description: {
    color: "rgba(99, 99, 99, 1)",
    fontFamily: "interRegular",
    fontSize: 16,
  },
  wrapper: {
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
    backgroundColor: "#fff",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    fontWeight: 'semibold'
  },
  accountText: {
    color: "rgba(99, 99, 99, 1)",
    textAlign: "center",
  },
  accountLink: {
    color: colors.primary,
    fontWeight: 'bold'
  },
});
