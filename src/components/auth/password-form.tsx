import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AntDesign, Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { registerCustomer } from "@/api/auth";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import { useRegistrationStore } from "@/store/register";
import { colors, spacing } from "@/theme";

import Text from "../ui/text";
import { PostRequest } from "@/utils/requests";
import { useContext, useState } from "react";
import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function PasswordForm() {
  const router = useRouter();
  const personalInfoData = useRegistrationStore((state) => state.data);
  const [loading, setLoading] = useState(false)
  const {dispatch} = useContext(DataContext)
  const [focusedField, setFocusedField] = useState<null | string>(null);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: personalInfoData?.password || "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });


  async function handleSumbit(data: z.infer<typeof passwordSchema>) {
    setLoading(true)

    const payload = {
      ...personalInfoData,
      password: data?.password
    }

    const res = await PostRequest("/auth/register/customer", payload)
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message);
      router.push("/sign-up/verify-otp");
      form.reset()
    }

    setLoading(false)
    dispatch({type:ACTIONS.VALIDATED, payload:true})
  }

  return (
    <Form {...form}>
      <View style={styles.wrapper}>
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
                autoFocus
                {...field}
              />
              <FormMessage />

              <View style={{ flex: 1, width: 500, gap: 5, flexDirection: 'row', alignItems: 'center' }}>
                <AntDesign name="infocirlceo" size={15} color="gray" />
                <Text style={{ fontSize: 12, color: "rgba(99, 99, 99, 1)" }}>
                  Password must be at least 6 characters
                </Text>
              </View>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>Confirm Password</FormLabel>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Confirm Password"
                secureTextEntry={true}
                returnKeyType="done"
                placeholderTextColor={"#63636380"}
                onChangeText={field.onChange}
                style={[
                  styles.input,
                  focusedField === "confirm" && { borderColor: "#f97216" },
                ]}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
                {...field}
              />
              <FormMessage />
              <View style={{ flex: 1, width: 500, gap: 5, flexDirection: 'row', alignItems: 'center' }}>
                <AntDesign name="infocirlceo" size={15} color="gray" />
                <Text style={{ fontSize: 12, color: "rgba(99, 99, 99, 1)" }}>
                  Password must be at least 6 characters
                </Text>
              </View>
            </FormItem>
          )}
        />
      </View>

      <Button
        style={{ marginTop: spacing.huge }}
        disabled={loading}
        onPress={form.handleSubmit(handleSumbit)}
      >
        <ButtonText>Submit</ButtonText>

        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="arrow-forward" size={24} color="white" />
        )}
      </Button>
    </Form>
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
  step: {
    backgroundColor: "rgba(243, 243, 243, 1)",
    height: 5,
    flex: 1,
    borderRadius: 8,
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
    fontFamily: "interMedium",
  },
  accountLink: {
    color: colors.primary,
  },
});
