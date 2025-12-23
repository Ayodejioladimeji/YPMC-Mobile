import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { forgotPassword } from "@/api/auth";
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
import { usePasswordResetStore } from "@/store/password-reset";
import { colors, spacing } from "@/theme";
import { PostRequest } from "@/utils/requests";
import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import { s } from "react-native-size-matters";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState<null | string>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const [buttonLoading, setButtonLoading] = useState(false)

  const handleSubmit = async (data: FormData) => {
    setButtonLoading(true)
    const res = await PostRequest("/auth/forgot-password", { email: data?.email })
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message)
      router.push({
        pathname: `/(auth)/forgot-password/[email]`,
        params: { email: data.email as string },
      });
    }

    setButtonLoading(false)
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopNavigation title=""/>
      
      <View style={{paddingHorizontal:16}}
      >
        <Text style={styles.heading}>Forgot Password?</Text>
        <Text style={styles.description}>
          Enter the email address associated with your account and we’ll send a
          reset verification code.
        </Text>

        <Form {...form}>
          <View style={styles.wrapper}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.xs,
                    }}
                  >
                    <Ionicons name="mail-outline" size={20} color="#000000" />
                    <FormLabel style={styles.label}>Email Address</FormLabel>
                  </View>

                  <Input
                    autoCapitalize="words"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={field.onChange}
                    placeholder="Enter your email address"
                    placeholderTextColor={"#63636380"}
                    returnKeyType="next"
                    style={[
                      styles.input,
                      focusedField === "email" && { borderColor: "#f97216" },
                    ]}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    autoFocus
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
            style={{marginTop:20}}
              disabled={buttonLoading}
              onPress={form.handleSubmit(handleSubmit)}
            >
              <ButtonText>Get Code</ButtonText>
              {buttonLoading && <ActivityIndicator color="#fff" size="small" />}
            </Button>
          </View>
        </Form>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: s(25),
    marginVertical:10
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
    marginTop: spacing.md,
    fontFamily: "interMedium",
  },
  accountLink: {
    color: colors.primary,
  },
});
