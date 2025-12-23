import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View, Switch as Switches, Platform } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

import Steps from "@/components/ship/steps";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch, SwitchThumb, SwitchTrack } from "@/components/ui/switch";
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import images from "@/assets/images";
import { SafeAreaView } from "react-native";
import TopNavigation from "@/components/TopNavigation";
import { s } from "react-native-size-matters";

const schema = z.object({
  packageName: z.string().min(1, { message: "Package Name is required" }),
  packageSize: z.enum(["SMALL", "MEDIUM", "LARGE"], {
    required_error: "You need to select a package size.",
  }),
  isFragile: z.boolean(),
  isSecurityShipping: z.boolean(),
});

export default function PackageInfoForm() {
  const router = useRouter();
  const { setCurrentItem } = useShippingStore(
    (state) => state.actions,
  );
  const { state, dispatch } = useContext(DataContext)
  const { orderData, moreOrder, multipleData } = state
  const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<any>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageName: orderData?.packageName || "",
      isFragile: orderData?.isFragile || false,
      packageSize: orderData?.packageSize || "MEDIUM",
      isSecurityShipping: orderData?.isSecurityShipping || false,
    },
    mode: "onChange",
  });

  useEffect(() => {
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
  
      return () => clearTimeout(timeout);
    }, []);


  function handleSubmit() {
    form.trigger().then((isValid) => {
      if (isValid) {
        dispatch({ type: ACTIONS.ORDER_DATA, payload: form.getValues() })

        if (moreOrder && multipleData?.length > 0) {
          router.push("/(app)/quote/delivery-info");
        }
        else {
          router.push("/(app)/quote/pickup-info");
        }
      }
    });
  }

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopNavigation title="Get a Quote" />

      <ScrollView showsVerticalScrollIndicator={false} >
        <ImageBackground
          source={images?.map}
          resizeMode="cover"
          style={{ paddingTop: 20, backgroundColor: colors.muted }}
        >

          <Steps />

          <Form {...form}>
            <View style={styles.wrapper}>
              <FormField
                control={form.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <Input
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={field.value}
                      placeholder="What are you shipping?"
                      placeholderTextColor={"#63636380"}
                      onChangeText={field.onChange}
                      style={{
                        backgroundColor: "#F3F3F3",
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderColor: isFocused ? "#f97216" : "rgba(99, 99, 99, 0.5)",
                        borderWidth: isFocused ? 1 : 0
                      }}
                      autoFocus
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Size (Optional)</FormLabel>

                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      style={styles.radioGroup}
                      accessibilityLabel="Options"
                    >
                      <RadioGroupItem value="SMALL" style={styles.radioGroupItem}>
                        <Text>Small</Text>
                      </RadioGroupItem>

                      <RadioGroupItem value="MEDIUM" style={styles.radioGroupItem}>
                        <Text>Medium</Text>
                      </RadioGroupItem>

                      <RadioGroupItem value="LARGE" style={styles.radioGroupItem}>
                        <Text>Large</Text>
                      </RadioGroupItem>
                    </RadioGroup>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFragile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Package Fragile?</FormLabel>

                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>

                      <Switches
                        value={field.value}
                        onValueChange={field.onChange}
                        style={{ transform: Platform.OS === "android" ? [{ scaleX: 1.2 }, { scaleY: 1.2 }] : [{ scaleY: 0.9 }, { scaleX: 0.9 }] }}
                        trackColor={{ false: "#D3D3D3", true: "#f97216" }}
                        thumbColor="white"
                      />
                    </View>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSecurityShipping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Shipping</FormLabel>

                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                      <Switches
                        value={field.value}
                        onValueChange={field.onChange}
                        style={{ transform: Platform.OS === "android" ? [{ scaleX: 1.2 }, { scaleY: 1.2 }] : [{ scaleY: 0.9 }, { scaleX: 0.9 }] }}
                        trackColor={{ false: "#D3D3D3", true: "#f97216" }}
                        thumbColor="white"
                      />
                    </View>
                    {field?.value && <Text style={{ color: colors.foreground, fontSize: s(11) }}>Note: The recipient will be required to provide an ID upon delivery.</Text>}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </View>
          </Form>

        </ImageBackground>

        <View style={styles.footerContainer}>
          <Button onPress={handleSubmit} disabled={!form.formState.isValid}>
            <ButtonText>Continue</ButtonText>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  scrollView: {
    flex: 1,
    // position: "relative",
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
  switch: {
    // Size of the switch
    width: 50,
    height: 30,
  },
  track: {
    // Track styling
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  thumb: {
    // Thumb styling
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    margin: 2,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
  },
  radioGroupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  datePlaceholder: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#6363631A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  footerContainer: {
    backgroundColor: "#fff",
    marginTop: spacing.xxl,
    paddingHorizontal: 20,
    marginBottom: 20
  },
});
