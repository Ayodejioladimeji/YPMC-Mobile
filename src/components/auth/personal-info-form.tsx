import { StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useRegistrationStore } from "@/store/register";
import { colors, spacing } from "@/theme";
import { ACTIONS } from "@/store/Actions";
import { useContext, useState } from "react";
import { DataContext } from "@/store/GlobalState";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  referredBy: z.string().optional(),
});

export default function PersonalInfoForm() {
  const { goToNextStep, setData } = useRegistrationStore(
    (state, ) => state.actions,
  );
  const {state, dispatch} = useContext(DataContext)
  const data = useRegistrationStore((state) => state.data);
   const [focusedField, setFocusedField] = useState<null | string>(null);

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      email: data?.email || "",
      phoneNumber: data?.phoneNumber || "",
      referredBy: data?.referredBy || ""
    },
    mode: "onSubmit",
  });

  function handleSumbit(data: z.infer<typeof personalInfoSchema>) {
    dispatch({type:ACTIONS.VALIDATED, payload:true})
    setData(data);
    goToNextStep();
  }

  return (
    <Form {...form}>
      <View style={styles.wrapper}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>First Name</FormLabel>
              <Input
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Enter First Name"
                placeholderTextColor={"#63636380"}
                onChangeText={field.onChange}
                returnKeyType="next"
                style={[
                  styles.input,
                  focusedField === "firstName" && { borderColor: "#f97216" },
                ]}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField(null)}
                autoFocus
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>Last Name</FormLabel>
              <Input
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Enter Last Name"
                placeholderTextColor={"#63636380"}
                onChangeText={field.onChange}
                returnKeyType="next"
                style={[
                  styles.input,
                  focusedField === "lastName" && { borderColor: "#f97216" },
                ]}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField(null)}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>Email Address</FormLabel>
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
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>Phone Number</FormLabel>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                onChangeText={field.onChange}
                placeholder="000 0000 000"
                placeholderTextColor={"#63636380"}
                returnKeyType="next"
                style={[
                  styles.input,
                  focusedField === "phone" && { borderColor: "#f97216" },
                ]}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referredBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={styles.label}>Referral Code</FormLabel>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="(Optional)"
                onChangeText={field.onChange}
                placeholderTextColor={"#63636380"}
                returnKeyType="next"
                style={[
                  styles.input,
                  focusedField === "referral" && { borderColor: "#f97216" },
                ]}
                onFocus={() => setFocusedField("referral")}
                onBlur={() => setFocusedField(null)}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </View>

      <Button
        style={{ marginTop: spacing.huge }}
        // disabled={mutation.isPending}
        onPress={form.handleSubmit(handleSumbit)}
      >
        <ButtonText>Next</ButtonText>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </Button>
    </Form>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
