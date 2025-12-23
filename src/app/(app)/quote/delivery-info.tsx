import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ImageBackground, Text, Pressable, SafeAreaView, ScrollView, StyleSheet, View, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useSharedValue } from "react-native-reanimated";
import * as z from "zod";
import LocationForm, { Location } from "@/components/ship/location-form";
import Steps from "@/components/ship/steps";
import SummarySheet from "@/components/quote/summary-sheet";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import ReceiverLocationForm from "@/components/quote/receiver-location-form";
import images from "@/assets/images";
import TopNavigation from "@/components/TopNavigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { v4 as uuidv4 } from "uuid";


const schema = z.object({
  receiverName: z.string().min(1, {
    message: "Receiver's Name is required",
  }),
  receiverPhoneNumber: z.string().min(1, {
    message: "Receiver's Phone Number is required",
  }),
  packageNotes: z.string().optional(),
});

const SNAP_POINTS = ["80%", "80%", "80%"];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DeliveryInfoForm() {
  const [loading, setLoading] = useState(false)
  const locationFormSheetRef = useRef<BottomSheetModal>(null);
  const locationFormSheetIndex = useSharedValue<number>(0);
  const locationFormSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);

  // summary sheet stuff
  const summarySheetRef = useRef<BottomSheetModal>(null);
  const summarySheetIndex = useSharedValue<number>(0);
  const summarySheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const { state, dispatch } = useContext(DataContext)
  const { orderData, quoteData } = state
  const [focusedField, setFocusedField] = useState<null | string>(null);
  const router = useRouter()
  const generateUUID = (): string => uuidv4();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      receiverName: orderData?.receiverName || "",
      receiverPhoneNumber: orderData?.receiverPhoneNumber || "",
      packageNotes: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFocusedField("location")
    }, 100);

    return () => clearTimeout(timeout);
  }, []);


  function handleLocationSubmit(location: Location) {
    const payload = {
      dropoffStreet: location.street,
      dropoffArea: location.area,
      dropoffState: location.state,
      dropoffLongitude: location.longitude,
      dropoffLatitude: location.latitude,
    };
    dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
  }

  async function handleSubmit() {
    form.trigger().then((isValid) => {
      if (isValid) {

        const payload = {
          id: orderData?.id || generateUUID(),
          ...form.getValues(),
          scheduledPickupTime: orderData?.pickupTime
        }
        dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
        router.push("/(app)/quote/summary");

      }
    });
  }

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopNavigation title="Get a Quote" />

      <ScrollView style={{ backgroundColor: '#fff' }} showsVerticalScrollIndicator={false} >

        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={images?.map}
            resizeMode="cover"
            style={{ paddingTop: 20, backgroundColor: colors.muted }}
          >


            <Steps />

            <Form {...form}>
              <View style={styles.wrapper}>
                <View style={{ gap: spacing.xs }}>
                  <FormLabel>Delivery Location</FormLabel>

                  <Pressable
                    style={[
                      styles.locationPlaceholder,
                      focusedField === "location" && { borderColor: "#f97216", borderWidth: 1 },
                    ]}
                    onBlur={() => setFocusedField(null)}
                    onPress={() => {
                      locationFormSheetRef.current?.present();
                      setFocusedField("location")
                    }}
                  >
                    {/* <SvgXml xml={deliveryIcon}/> */}

                    {orderData?.dropoffStreet ? (
                      <Text style={{ fontSize: 14, color: "#636363" }}>
                        {`${orderData?.dropoffStreet}, ${orderData?.dropoffArea}, ${orderData?.dropoffState}`}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 14, color: "#63636380" }}>
                        Enter Street name and number
                      </Text>
                    )}
                  </Pressable>
                </View>

                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver's Name</FormLabel>
                      <Input
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholder="Who is receiving this package?"
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        {...field}
                        style={{
                          backgroundColor: "#F3F3F3",
                          paddingHorizontal: 10,
                          borderColor: focusedField === "receiverName" ? "#f97216" : "",
                          borderWidth: focusedField === "receiverName" ? 1 : 0
                        }}
                        onFocus={() => setFocusedField("receiverName")}
                        onBlur={() => setFocusedField(null)}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiverPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver's Phone Number</FormLabel>
                      <Input
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="phone-pad"
                        placeholder="80 000 0000"
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        {...field}
                        style={{
                          backgroundColor: "#F3F3F3",
                          paddingHorizontal: 10,
                          borderColor: focusedField === "receiverPhone" ? "#f97216" : "",
                          borderWidth: focusedField === "receiverPhone" ? 1 : 0
                        }}
                        onFocus={() => setFocusedField("receiverPhone")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="packageNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Delivery Instruction and Notes</FormLabel>
                      <Input
                        autoCorrect={false}
                        placeholder="Please enter any specific instructions here."
                        placeholderTextColor={"#63636380"}
                        onChangeText={field.onChange}
                        {...field}
                        style={{
                          backgroundColor: "#F3F3F3",
                          paddingHorizontal: 10,
                          height: 96,
                          textAlignVertical: "top",
                          paddingTop: 10,
                          borderColor: focusedField === "notes" ? "#f97216" : "",
                          borderWidth: focusedField === "notes" ? 1 : 0
                        }}

                        onFocus={() => setFocusedField("notes")}
                        onBlur={() => setFocusedField(null)}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>
            </Form>
          </ImageBackground>

          <View style={styles.footerContainer}>
            <Button onPress={handleSubmit} disabled={!form.formState.isValid || !orderData?.dropoffStreet}>
              <ButtonText>Proceed to summary</ButtonText>
              {loading ? <ActivityIndicator size="small" color={colors.white} /> :
                <Ionicons name="arrow-forward" size={24} color="white" />}

            </Button>
          </View>


          <ReceiverLocationForm
            ref={locationFormSheetRef}
            index={locationFormSheetIndex}
            position={locationFormSheetPosition}
            setLocation={handleLocationSubmit}
            closeModal={() => locationFormSheetRef.current?.close()}
          />

          <SummarySheet
            ref={summarySheetRef}
            index={summarySheetIndex}
            position={summarySheetPosition}
            onSubmit={() => summarySheetRef.current?.close()}
          />
        </KeyboardAwareScrollView>
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
  locationPlaceholder: {
    // flex: 1,
    height: 55,
    justifyContent: "center",
    gap: 10,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    // paddingVertical: 10,
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
    // marginHorizontal: spacing.sm,
    backgroundColor: "#fff",
    gap: 10,
    marginTop: spacing.xl,
    paddingHorizontal: 20,
    marginBottom: 40
  },
});
