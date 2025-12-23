
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import Input from "../ui/input";
import { s } from "react-native-size-matters";
import { colors, spacing } from "@/theme";
import { Button, ButtonText } from "../ui/button";
import { PutRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import { ACTIONS } from "@/store/Actions";

type UpdateProfileProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  user: any
};


const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "last name is required" }),
  phoneNumber: z.string().min(1, { message: "phone number is required" })
});

const UpdateProfile = forwardRef<BottomSheetModal, UpdateProfileProps>(
  ({ index, position, user }, ref) => {
    const headerHeight = useHeaderHeight();
    const { bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState<null | string>(null);
    const [snapPoints, setSnapPoints] = useState(["50%", "70%"]);


    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: {
        firstName: user?.user?.firstName || "",
        lastName: user?.user?.lastName || "",
        phoneNumber: user?.user?.phoneNumber || ""
      },
      mode: "onSubmit",
    });

    const scrollViewContentContainer = useMemo(
      () => [
        styles.scrollViewContentContainer,
        { paddingBottom: bottomSafeArea + 64 },
      ],
      [bottomSafeArea],
    );

    useEffect(() => {
      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setSnapPoints(["70%"]);
        if (ref && "current" in ref && ref.current) {
          ref.current.expand();
        }
      });

      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setSnapPoints(["50%", "70%"]);
        if (ref && "current" in ref && ref.current) {
          ref.current.snapToIndex(0);
        }
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [ref]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          enableTouchThrough={true}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );


    async function handleSumbit(data: z.infer<typeof schema>) {
      setLoading(true);

      let phone = data?.phoneNumber?.trim() || "";

      phone = phone.replace(/\s|-/g, "");

      // Append +234 if not already there
      if (!phone.startsWith("+234")) {
        if (phone.startsWith("0")) {
          phone = "+234" + phone.slice(1);
        } else {
          phone = "+234" + phone;
        }
      }

      const payload = {
        ...data,
        phoneNumber: phone,
      };

      const res = await PutRequest("/customer/profile", payload, state?.token);

      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback });
        toast.success(res?.data?.message);

        setTimeout(() => {
          if (ref && "current" in ref && ref.current) ref.current.dismiss();
          setLoading(false);
        }, 2000);
      } else {
        setLoading(false);
      }
    }
    

    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDismissOnClose={true}
        enablePanDownToClose={true}
        key="TimelineSheet"
        ref={ref}
        snapPoints={snapPoints}
        topInset={headerHeight}
        style={styles.shadow}
        backdropComponent={renderBackdrop}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "height"}
          keyboardVerticalOffset={headerHeight}
          style={{ flex: 1 }}
        >
          <BottomSheetScrollView
            contentContainerStyle={scrollViewContentContainer}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
          >
            <View style={[styles.container]}>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 16 }}>First Name</FormLabel>
                      <Input
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholder="Enter First Name"
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        returnKeyType="next"
                        style={[
                          styles.input,
                          focusedField === "firstName" && { borderColor: "#f97216", borderWidth:0.5 },
                        ]}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField(null)}
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
                      <FormLabel style={{ fontSize: 16 }}>Last Name</FormLabel>
                      <Input
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholder="Enter Last Name"
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        returnKeyType="next"
                        style={[
                          styles.input,
                          focusedField === "lastName" && { borderColor: "#f97216", borderWidth:0.5 },
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 16 }}>Phone Number</FormLabel>
                      <Input
                        keyboardType="number-pad"
                        autoCorrect={false}
                        placeholder="08012345678"
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        returnKeyType="next"
                        style={[
                          styles.input,
                          focusedField === "phone" && { borderColor: "#f97216", borderWidth:0.5 },
                        ]}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  style={{ marginTop: 10 }}
                  disabled={loading}
                  onPress={form.handleSubmit(handleSumbit)}
                >
                  <ButtonText>Update Account Name</ButtonText>
                  {loading && <ActivityIndicator size="small" color="white" />}
                </Button>
              </Form>
            </View>
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheetModal>

    );
  }
);

export default UpdateProfile;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  shadow: {
    shadowColor: "#636363",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
  },

  footerContainer: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
  },

  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomSheetContent: {
    padding: spacing.base,
  },
  textStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxxs,
    paddingVertical: spacing.xs,
    margin: spacing.xxs,
  },
  text: {
    fontSize: 14,
    fontFamily: "interRegular",
  },
  input: {
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: colors.muted,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: "rgba(99, 99, 99, 0.5)",

  },
});
