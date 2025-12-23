import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { toast } from "sonner-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavigation from "@/components/TopNavigation";
import { ScheduleCalendarIcon } from "@/assets/images/svgs";
import { colors } from "@/theme";
import { s } from "react-native-size-matters";
import { PatchRequest, PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { router } from "expo-router";


export default function SchedulePickupScreen() {
    const [pickupDate, setPickupDate] = useState<Date>(new Date());
    const [pickupTime, setPickupTime] = useState<Date>(new Date());
    const { state, dispatch } = useContext(DataContext)
    const { shippingId, token, shippingType } = state
    const [buttonLoading, setButtonLoading] = useState(false)


    const onConfirm = async () => {
        if (!pickupDate || !pickupTime) {
            toast.error("Please select both date and time");
            return;
        }

        const today = new Date();
        const selected = new Date(pickupDate);

        const isSameDay =
            today.getFullYear() === selected.getFullYear() &&
            today.getMonth() === selected.getMonth() &&
            today.getDate() === selected.getDate();

        if (isSameDay) {
            toast.error("Pickup date must be a day other than today.");
            return;
        }

        // Validate pickupTime is between 6:00am - 9:00pm (Nigeria Time)


        if (pickupTime) {
            const hour = pickupTime.getHours();
            const minute = pickupTime.getMinutes();

            const isBefore6AM = hour < 6;
            const isAfter9PM = hour > 21 || (hour === 21 && minute > 0);

            if (isBefore6AM || isAfter9PM) {
                toast.error("Orders can only be processed between working hours of 6:00am - 9:00pm");
                return;
            }
        }

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
            scheduleType: "later",
            scheduledPickupTime: dateTime,
        };

        setButtonLoading(true);

        const res = await PatchRequest(`/shipping/${shippingId}/schedule`, payload, token);

        if (res.status === 200 || res.status === 201) {
            toast.success("Pickup scheduled!");
            dispatch({ type: ACTIONS.SHIPPING, payload: res.data.data })
            
            router.back()
        }

        setButtonLoading(false);
    };



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TopNavigation title="" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Icon and header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <ScheduleCalendarIcon />
                    </View>


                    <Text style={styles.title}>Schedule Package Pickup</Text>
                    <Text style={styles.subTitle}>
                        Schedule your pickup for later and{" "}
                        <Text style={styles.discountText}>get 20% off</Text> your shipping
                        fare.
                    </Text>
                </View>

                {/* Date & Time Picker */}
                <View style={styles.pickerRow}>
                    <Pressable
                        style={styles.datePicker}
                    >
                        <Text style={styles.label}>Date</Text>
                        <DateTimePicker
                            value={pickupDate || new Date()}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(e, selectedDate) => {
                                if (selectedDate) setPickupDate(selectedDate);
                            }}
                        />
                    </Pressable>

                    <Pressable
                        style={styles.datePicker}
                    >
                        <Text style={styles.label}>Time</Text>
                        <DateTimePicker
                            value={pickupTime || new Date()}
                            mode="time"
                            display="default"
                            is24Hour={false}
                            onChange={(e, selectedTime) => {
                                if (!selectedTime) return;

                                const now = new Date();
                                if (!pickupDate) {
                                    toast.error("Please select a date first");
                                    return;
                                }

                                const combined = new Date(
                                    pickupDate.getFullYear(),
                                    pickupDate.getMonth(),
                                    pickupDate.getDate(),
                                    selectedTime.getHours(),
                                    selectedTime.getMinutes()
                                );

                                if (combined.getTime() < now.getTime()) {
                                    toast.error("Please select a future time");
                                    return;
                                }

                                setPickupTime(selectedTime);
                            }}
                        />
                    </Pressable>
                </View>


                {/* Note info */}
                <View style={styles.noteContainer}>
                    <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color="#FF7A00"
                        style={{ marginRight: 6 }}
                    />
                    <Text style={styles.noteText}>
                        Schedule from 6hrs, up to 7 days in advance
                    </Text>
                </View>

                {/* Confirm button */}
                <Pressable style={styles.button} onPress={onConfirm}>
                    <Text style={styles.buttonText}>Confirm</Text>
                    {buttonLoading && <ActivityIndicator color="white" />}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingTop: 48,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
        fontFamily: 'interSemiBold'
    },
    subTitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#636363",
        fontFamily: 'inter'
    },
    discountText: {
        color: "#FF7A00",
        fontWeight: "700",
    },
    pickerRow: {
        flexDirection: "column",
        gap: 16,
        marginBottom: 16,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: colors.border,
        paddingVertical: 15
    },
    label: {
        color: "#636363",
        fontSize: s(13),
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
    },
    noteContainer: {
        flexDirection: "row",
        backgroundColor: "#FFF3E5",
        padding: 12,
        borderRadius: 20,
        marginBottom: 32,
        alignItems: "center",
    },
    noteText: {
        fontSize: 13,
        color: "#FF7A00",
        flex: 1,
        flexWrap: "wrap",
    },
    button: {
        backgroundColor: "#FF7A00",
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: "center",
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center'
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
