import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
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
import { validatePickupDateTime } from "@/utils/time-validation";


export default function SchedulePickupScreen() {
    const [pickupDate, setPickupDate] = useState<Date>(new Date());
    const [pickupTime, setPickupTime] = useState<Date>(new Date());
    const { state, dispatch } = useContext(DataContext)
    const { deliveryMode } = state
    const [buttonLoading, setButtonLoading] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [error, setError] = useState("Please select a time after July 28, 12:45")


    const onConfirm = async () => {
        if (!pickupDate || !pickupTime) {
            toast.error("Please select both date and time");
            return;
        }

        const errors = validatePickupDateTime(pickupDate, pickupTime)
        if(errors){
            setError(errors)
            return
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
            pickupTime,
            pickupDate
        };

        setButtonLoading(true);

        dispatch({type:ACTIONS.ORDER_DATA, payload: {...state?.orderData, ...payload}})


        if (deliveryMode) {
            router.back()
        }
        else{
            router.push("/(app)/(tabs)/ship/summary")
        }

        setButtonLoading(false);
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TopNavigation title="" />
            <ScrollView contentContainerStyle={styles.container}>
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

                 <View style={styles.banner2}>
                                                    <FontAwesome name="exclamation-triangle" size={22} color="#E73323" />
                                                    <Text style={{fontSize: s(12), flex: 1, fontFamily: 'interMedium' }}>
                                                        {error}
                                                    </Text>
                                                </View>

                <View style={styles.pickerRow}>
                    <View>
                        <View
                            style={styles.datePicker}
                        >
                            <Text style={styles.label}>Date</Text>
                            {Platform.OS === "android" ?
                                <View>
                                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                        <Text style={styles.value}>{format(pickupDate, 'dd MMM yyyy')}</Text>
                                    </TouchableOpacity>

                                    {showDatePicker &&
                                        <DateTimePicker
                                            value={pickupDate}
                                            mode="date"
                                            minimumDate={new Date()}
                                            display='calendar'
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(false);
                                                if (selectedDate) setPickupDate(selectedDate);
                                            }}
                                            style={{ alignSelf: 'flex-end' }}
                                        />}
                                </View>
                                :
                                <DateTimePicker
                                    value={pickupDate}
                                    mode="date"
                                    minimumDate={new Date()}
                                    display={Platform.OS === 'ios' ? 'compact' : 'calendar'}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setPickupDate(selectedDate);
                                    }}
                                    style={{ alignSelf: 'flex-end' }}
                                />}
                        </View>

                    </View>

                    <View>
                        <View
                            style={styles.datePicker}
                        >
                            <Text style={styles.label}>Time</Text>

                            {Platform.OS === "android" ?
                                <View>
                                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                        <Text style={styles.value}>{format(pickupTime, 'hh:mm a')}</Text>
                                    </TouchableOpacity>

                                    {showTimePicker &&
                                        <DateTimePicker
                                            value={pickupTime}
                                            mode="time"
                                            is24Hour={false}
                                            onChange={(event, selectedTime) => {
                                                setShowTimePicker(false);
                                                if (!selectedTime) return;

                                                setPickupTime(selectedTime);
                                            }}
                                            style={{ alignSelf: 'flex-end' }}
                                        />}
                                </View>

                                :
                                <DateTimePicker
                                    value={pickupTime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'compact' : 'clock'}
                                    onChange={(event, selectedTime) => {

                                        if (!selectedTime) return;

                                        setPickupTime(selectedTime);
                                    }}
                                    style={{ alignSelf: 'flex-end' }}
                                />}
                        </View>

                    </View>
                </View>


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
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderColor: colors.border,
        paddingVertical: 15,
    },
    label: {
        color: "#636363",
        fontSize: s(13),
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#F3F3F3',
        borderRadius: 10
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