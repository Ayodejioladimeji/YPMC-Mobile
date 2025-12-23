import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import BottomSheet, {
    BottomSheetFooter,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useSharedValue } from "react-native-reanimated";
import * as z from "zod";
import RadioCheck from "@/components/ship/radiocheck";
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
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import images from "@/assets/images";
import TopNavigation from "@/components/TopNavigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { v4 as uuidv4 } from "uuid";
import { s } from "react-native-size-matters";
import { toast } from "sonner-native";
import { validatePickupDateTime } from "@/utils/time-validation";


const schema = z.object({
    packageName: z.string().min(1, { message: "Package Name is required" }),
    receiverName: z.string().min(1, {
        message: "Receiver's Name is required",
    }),
    receiverPhoneNumber: z.string().min(1, {
        message: "Receiver's Phone Number is required",
    }),
    pickupDate: z.date(),
    pickupTime: z.date(),
    scheduleType: z.string()
});


export default function PackageDetails() {
    const router = useRouter();
    const { state, dispatch } = useContext(DataContext)
    const { orderData, user, deliveryMode } = state
    const generateUUID = (): string => uuidv4();
    const [focusedField, setFocusedField] = useState<null | string>(null);
    const inputRef = useRef<any>(null);
    const [selected, setSelected] = useState("now");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [error, setError] = useState("Please select a time after July 28, 12:45")



    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            packageName: orderData?.packageName || "",
            receiverName: orderData?.receiverName || "",
            receiverPhoneNumber: orderData?.receiverPhoneNumber || "",
            pickupDate: orderData?.pickupDate || new Date(),
            pickupTime: orderData?.pickupTime || new Date(),
            scheduleType: orderData?.scheduleType || selected,
        },
        mode: "onChange",
    });


    useFocusEffect(
        useCallback(() => {
            dispatch({ type: ACTIONS.DELIVERY_MODE, payload: false });

            if (selected === "now") {
                const now = new Date();
                form.setValue("pickupDate", now, { shouldValidate: true, shouldDirty: true });
                form.setValue("pickupTime", now, { shouldValidate: true, shouldDirty: true });

                setSelected("now");
                form.setValue("scheduleType", "now", { shouldValidate: true, shouldDirty: true });
            }

        }, [dispatch, form])
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSelected(orderData?.selected || "now")
            setFocusedField("location")
        }, 100);

        return () => clearTimeout(timeout);
    }, []);


    function handleSubmit() {

        const pickupDate = new Date(form.getValues("pickupDate"));
        const pickupTime = form.getValues("pickupTime");

        const errors = validatePickupDateTime(pickupDate, pickupTime)
        if (errors) {
            setError(errors)
            return
        }

        // Validate pickupTime is between 6:00am - 9:00pm (Nigeria Time)

        form.trigger().then((isValid) => {
            if (isValid) {
                const { pickupDate, pickupTime } = form.getValues()
                const combinedDateTime = new Date(
                    pickupDate.getFullYear(),
                    pickupDate.getMonth(),
                    pickupDate.getDate(),
                    pickupTime.getHours(),
                    pickupTime.getMinutes(),
                    0,
                    0
                );

                const dateTime = combinedDateTime.toISOString();

                const payload = {
                    id: orderData?.id || generateUUID(),
                    ...form.getValues(),
                    isFragile: false,
                    senderName: user?.fullName,
                    senderPhoneNumber: user?.user?.phoneNumber,
                    scheduledPickupTime: dateTime,
                    packageSize: "MEDIUM"
                }

                dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...orderData, ...payload } })

                if (selected === "now") {
                    if (pickupTime) {
                        const hour = pickupTime.getHours();
                        const minute = pickupTime.getMinutes();

                        const isBefore6AM = hour < 6;
                        const isAfter5PM = hour > 18 || (hour === 18 && minute > 0);

                        if (isBefore6AM || isAfter5PM) {
                            router.push("/(app)/(tabs)/ship/empty-riders")
                            return;
                        }
                    }
                }

                router.push("/(app)/(tabs)/ship/summary")
            }
        });
    }


    // 

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <TopNavigation title={state?.shippingType === "basic" ? "Single Shipping" : "Multiple Shipping"} />

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
                    style={{ paddingTop: 100, backgroundColor: colors.muted }}
                >

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
                                            ref={inputRef}
                                            style={{
                                                backgroundColor: "#F3F3F3",
                                                paddingHorizontal: 10,
                                                borderColor: focusedField === "packageName" ? "#f97216" : "",
                                                borderWidth: focusedField === "packageName" ? 1 : 0
                                            }}
                                            onFocus={() => setFocusedField("packageName")}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            <View>
                                <FormLabel>Schedule Pickup Date & Time</FormLabel>
                                {selected === "later" &&
                                    <View style={styles.banner2}>
                                        <FontAwesome name="exclamation-triangle" size={22} color="#E73323" />
                                        <Text style={{ fontSize: s(12), flex: 1, fontFamily: 'interMedium' }}>
                                            {error}
                                        </Text>
                                    </View>}

                                <RadioCheck
                                    selected={selected}
                                    setSelected={(value) => {
                                        setSelected(value);
                                        form.setValue("scheduleType", value, { shouldValidate: true });

                                        if (value === "now") {
                                            const now = new Date();
                                            form.setValue("pickupDate", now, { shouldValidate: true });
                                            form.setValue("pickupTime", now, { shouldValidate: true });
                                        }
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
                                                    onPress={() => setShowDatePicker(prev => !prev)}
                                                >
                                                    <Feather name="calendar" size={24} color="black" style={{ opacity: selected === "later" ? 1 : 0.5, }} />
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
                                                    onPress={() => setShowTimePicker(prev => !prev)}
                                                >
                                                    <Ionicons name="time-outline" size={24} color="black" style={{ opacity: selected === "later" ? 1 : 0.5, }} />
                                                    <Text style={{ color: colors.muted }}>|</Text>
                                                    <View>
                                                        <Text style={{ fontSize: 12 }}>Time</Text>
                                                        <Text style={{ color: "#63636380" }}>
                                                            {field.value instanceof Date
                                                                ? format(field.value, "hh:mm a")
                                                                : "Select Time"}
                                                        </Text>

                                                    </View>
                                                </Pressable>

                                                {showTimePicker ? (
                                                    <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={field.value || new Date()}
                                                        mode="time"
                                                        is24Hour={false}
                                                        onChange={(event, time) => {
                                                            setShowTimePicker(false);
                                                            if (time) {
                                                                const now = new Date();
                                                                const selectedDate = form.getValues("pickupDate");

                                                                // Combine date + time
                                                                const combinedDateTime = new Date(
                                                                    selectedDate.getFullYear(),
                                                                    selectedDate.getMonth(),
                                                                    selectedDate.getDate(),
                                                                    time.getHours(),
                                                                    time.getMinutes(),
                                                                    0,
                                                                    0
                                                                );

                                                                if (combinedDateTime.getTime() < now.getTime()) {
                                                                    toast.error('Please select a future time');
                                                                    return;
                                                                }

                                                                // Save combined DateTime to field
                                                                field.onChange(combinedDateTime);
                                                            }
                                                        }}

                                                    />
                                                ) : null}


                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </View>
                            </View>

                            <View style={styles.banner}>
                                <Feather name="info" size={24} color={colors.primary} />
                                <Text style={{ color: "rgba(99, 99, 99, 1)", fontSize: s(12), flex: 1, fontFamily: 'interMedium' }}>
                                    Schedule your pickup for later and get 20% off your shipping fare.
                                </Text>
                            </View>
                        </View>
                    </Form>

                </ImageBackground>


                <View style={styles.footerContainer}>
                    <Button onPress={handleSubmit} disabled={!form.formState.isValid || !orderData?.dropoffStreet}>
                        <ButtonText>Proceed to Summary</ButtonText>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </Button>
                </View>

            </KeyboardAwareScrollView>
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
        backgroundColor: "#fff",
        gap: 10,
        marginTop: spacing.xl,
        paddingHorizontal: 20,
        marginBottom: 40
    },
    banner: {
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "rgba(249, 114, 22, 0.1)",
        flexDirection: "row",
        gap: 10,
    },
    banner2: {
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: "#E7332326",
        flexDirection: "row",
        gap: 10,
        alignItems: 'center',
        marginTop: 10
    },
});
