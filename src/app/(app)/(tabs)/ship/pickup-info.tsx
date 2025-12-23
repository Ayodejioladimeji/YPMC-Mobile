import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useHeaderHeight } from "@react-navigation/elements";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

import LocationForm, {
  type Location as LocationType,
} from "@/components/ship/location-form";
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
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import RadioCheck from "@/components/ship/radiocheck";
import images from "@/assets/images";
import { SafeAreaView } from "react-native";
import TopNavigation from "@/components/TopNavigation";
import { retrieveData, storeData } from "@/utils/helper";

// import { addressIcon } from "@/assets/svgs/shipments";

const schema = z.object({
  senderName: z.string().min(1, { message: "Sender's Name is required" }),
  senderPhoneNumber: z
    .string()
    .min(1, { message: "Sender's Phone Number is required" }),
  pickupDate: z.date(),
  pickupTime: z.date(),
  scheduleType: z.string()
});


const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PickupInfoForm() {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Location form sheet stuff
  const locationFormSheetRef = useRef<BottomSheetModal>(null);
  const locationFormSheetIndex = useSharedValue<number>(0);
  const locationFormSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const { state, dispatch } = useContext(DataContext)
  const { orderData, user } = state
  const [selected, setSelected] = useState("now");
  const [focusedField, setFocusedField] = useState<null | string>(null);
  const inputRef = useRef<any>(null);


  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderName: orderData?.senderName || user?.fullName,
      senderPhoneNumber: orderData?.senderPhoneNumber || user?.user?.phoneNumber,
      pickupDate: orderData?.pickupDate || new Date(),
      pickupTime: orderData?.pickupTime || new Date(),
      scheduleType: orderData?.scheduleType || selected
    },
    mode: "onChange", 
  });

    useEffect(() => {
      // check for persisted pickup address
      const getAddress = async () => {
        const res = await retrieveData("pickupAddress");
        dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state.orderData, ...res } });
      };
      getAddress()

      const timeout = setTimeout(() => {
        setFocusedField("location")
      }, 100);
  
      return () => clearTimeout(timeout);
    }, []);


  async function handleLocationSubmit(location: LocationType) {

    const payload = {
      pickupStreet: location.street,
      pickupArea: location.area,
      pickupState: location.state,
      pickupLongitude: location.longitude,
      pickupLatitude: location.latitude,
    };

    dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
    await storeData("pickupAddress", payload)
  }

  function handleSubmit() {
    form.trigger().then((isValid) => {
      if (isValid) {
        dispatch({ type: ACTIONS.ORDER_DATA, payload: form.getValues() })

        router.push("/(app)/(tabs)/ship/delivery-info");
      }
    }); 
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopNavigation title={state?.shippingType === "basic" ? "Single Shipping" : "Multiple Shipping"} />

      <ScrollView style={{}} showsVerticalScrollIndicator={false} >
        <ImageBackground
          source={images?.map}
          resizeMode="cover"
          style={{ paddingTop: 20, backgroundColor:colors.muted }}
        >

          <Steps />

          <Form {...form}>
            <View style={styles.wrapper}>
              <View style={{ gap: spacing.xs }}>
                <FormLabel>Pickup Location</FormLabel>

                <Pressable
                  style={[
                    styles.locationPlaceholder,
                    focusedField === "location" && { borderColor: "#f97216", borderWidth:1 },
                  ]}
                  onBlur={() => setFocusedField(null)}
                  onPress={() =>{ 
                    locationFormSheetRef.current?.present();
                    setFocusedField("location")
                  }}
                  ref={inputRef}
                >
                  {orderData?.pickupStreet ? (
                    <Text style={{ fontSize: 14, color: "#636363" }}>
                      {`${orderData?.pickupStreet}, ${orderData?.pickupArea}, ${orderData?.pickupState}`}
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
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender's Name</FormLabel>
                    <Input
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={field.value}
                      placeholder="Who is sending this package"
                      placeholderTextColor={"#63636380"}
                      onChangeText={field.onChange}
                      style={{
                        backgroundColor: "#F3F3F3",
                        paddingHorizontal: 10,
                        borderColor: focusedField === "senderName" ? "#f97216" : "",
                        borderWidth: focusedField === "senderName" ? 1 : 0 
                      }}
                      onFocus={() => setFocusedField("senderName")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender's Phone Number</FormLabel>
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
                        borderColor: focusedField === "senderPhone" ? "#f97216" : "",
                        borderWidth: focusedField === "senderPhone" ? 1 : 0
                      }}
                      onFocus={() => setFocusedField("senderPhone")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <View>
                <FormLabel>Schedule Pickup Date & Time</FormLabel>

                <RadioCheck
                  selected={selected}
                  setSelected={(value) => {
                    setSelected(value);
                    form.setValue("scheduleType", value, { shouldValidate: true });
                  }}
                />

                <View
                  style={{
                    flexDirection: "row", gap: 16, marginTop: spacing.xs,
                    opacity: selected === "later" ? 1 : 0.5,
                  }}
                  pointerEvents={selected === "later" ? "auto" : "none"}
                >
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem style={{ flex: 1 }}>
                        <Pressable
                          style={styles.datePlaceholder}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Ionicons name="time-outline" size={24} color="black" style={{ opacity: selected === "later" ? 1 : 0.5, }} />
                          <Text style={{ color: colors.muted }}>|</Text>
                          <View>
                            <Text style={{ fontSize: 12 }}>Date</Text>
                            <Text style={{ color: "#63636380" }}>
                              {field.value
                                ? format(field.value, "dd MMM")
                                : "Select Date"}
                            </Text>
                          </View>
                        </Pressable>

                        {showDatePicker ? (
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={field.value}
                            mode="date"
                            minimumDate={new Date()}
                            is24Hour={false}
                            onChange={(event, time) => {
                              setShowDatePicker(false);
                              field.onChange(time);
                            }}
                          />
                        ) : null}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => (
                      <FormItem style={{ flex: 1 }}>
                        <Pressable
                          style={styles.datePlaceholder}
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Ionicons name="time-outline" size={24} color="black" style={{ opacity: selected === "later" ? 1 : 0.5, }} />
                          <Text style={{ color: colors.muted }}>|</Text>
                          <View>
                            <Text style={{ fontSize: 12 }}>Time</Text>
                            <Text style={{ color: "#63636380" }}>
                              {field.value
                                ? format(field.value, "hh:mm a")
                                : "Select Time"}
                            </Text>
                          </View>
                        </Pressable>

                        {showTimePicker ? (
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={field.value}
                            minimumDate={new Date()}
                            mode="time"
                            is24Hour={false}
                            onChange={(event, time) => {
                              setShowTimePicker(false);
                              field.onChange(time);
                            }}
                          />
                        ) : null}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </View>
              </View>
            </View>
          </Form>
        </ImageBackground>


        <View style={styles.footerContainer}>
          <Button onPress={handleSubmit} disabled={!form.formState.isValid || !orderData?.pickupStreet}>
            <ButtonText>Continue</ButtonText>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Button>
        </View>

        <LocationForm
          ref={locationFormSheetRef}
          index={locationFormSheetIndex}
          position={locationFormSheetPosition}
          setLocation={handleLocationSubmit}
          closeModal={() => locationFormSheetRef.current?.close()}
        />
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
    borderRadius: 20,
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
    marginTop: spacing.xl,
    paddingHorizontal: 20,
    marginBottom: 40
  },
});
