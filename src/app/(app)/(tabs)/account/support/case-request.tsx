import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
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
import { colors, spacing } from "@/theme";
import SafeAreaViews from "@/components/safe-area-view";
import TopNavigation from "@/components/TopNavigation";
import { s } from "react-native-size-matters";
import SupportForm from "@/components/support/support-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const schema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current Password is required" }),
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

export default function CaseRequest() {
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  function handleSumbit(data: z.infer<typeof schema>) { }

  return (
    <SafeAreaViews>
      <TopNavigation title="" />

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 30 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.heading}>Submit a Case Request</Text>
        <Text style={styles.description}>
          Submit your report to initiate our support process
        </Text>

        <View style={{ height: 2, backgroundColor: colors.muted, marginVertical: 30 }} />

        <SupportForm />
      </KeyboardAwareScrollView>
    </SafeAreaViews>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    marginVertical: 25
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: s(18),
    marginBottom: 10
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
    fontSize: s(14),
    color: "black",
    fontWeight: 500
  },
  input: {
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: "rgba(99, 99, 99, 0.5)",
    borderRadius: 10,
  },
});
