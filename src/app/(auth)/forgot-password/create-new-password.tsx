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
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { resetPassword } from "@/api/auth";
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

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export default function CreateNewPassword() {
  const router = useRouter();
  const token = usePasswordResetStore((state) => state.token);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 6000,
      });
    },
  });

  function handleSumbit(data: z.infer<typeof schema>) {
    mutation.mutate({
      newPassword: data.password,
      token: token,
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={[styles.container]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.heading}>Create new password</Text>
        <Text style={styles.description}>
          Make sure your password is unique and memorable.
        </Text>

        <Form {...form}>
          <View style={styles.wrapper}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={styles.label}>Enter New Password</FormLabel>
                  <Input
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    returnKeyType="next"
                    placeholderTextColor={"#63636380"}
                    onChangeText={field.onChange}
                    style={styles.input}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={styles.label}>
                    Confirm New Password
                  </FormLabel>
                  <Input
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    returnKeyType="next"
                    placeholderTextColor={"#63636380"}
                    onChangeText={field.onChange}
                    style={styles.input}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>

          <Button
            style={{ marginTop: 80 }}
            disabled={mutation.isPending}
            onPress={form.handleSubmit(handleSumbit)}
          >
            Reset Password
          </Button>
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
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: 24,
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
    color: "black",
  },
  input: {
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: "rgba(99, 99, 99, 0.5)",
    borderRadius: 0,
  },
});
