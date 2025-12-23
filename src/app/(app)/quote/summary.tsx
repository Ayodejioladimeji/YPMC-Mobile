import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors, spacing } from "@/theme";
import moment from "moment";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { calculateDistanceAndTime } from "@/utils/distance-and-time";
import TopNavigation from "@/components/TopNavigation";
import { formatMoney } from "@/utils/utils";
import { v4 as uuidv4 } from "uuid";
import { s } from "react-native-size-matters";
import { toast } from "sonner-native";


type SummarySheetProps = {
    index: SharedValue<number>;
    position: SharedValue<number>;
    onSubmit: () => void;
    form: any
};

const SNAP_POINTS = ["100%"];

const SummarySheet = () => {
    const router = useRouter();
    const type = useShippingStore((state) => state.type);
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const { orderData, quoteData, shippingType } = state
    const [loading, setLoading] = useState(false)
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [distanceLoading, setDistanceLoading] = useState(true)
    const generateUUID = (): string => uuidv4();



   const scrollViewContentContainer = useMemo(
        () => [
            styles.scrollViewContentContainer,
            { paddingBottom: bottomSafeArea + 86 },
        ],
        [bottomSafeArea],
    ); 

    useEffect(() => {
        dispatch({ type: ACTIONS.MULTIPLE_DATA, payload: orderData });
    }, []);

    useEffect(() => {
        const fetchDistanceAndTime = async () => {
            if (orderData?.pickupLatitude && orderData?.dropoffLatitude) {
                const pickupCoord = { latitude: orderData.pickupLatitude, longitude: orderData.pickupLongitude };
                const dropoffCoord = { latitude: orderData.dropoffLatitude, longitude: orderData.dropoffLongitude };

                const result = await calculateDistanceAndTime(pickupCoord, dropoffCoord);
                if (result) {
                    setDistance(result.distance);
                    setDuration(result.duration);
                }
                setDistanceLoading(false)
            }
        };

        fetchDistanceAndTime();
    }, [orderData]);


    const shareQuote = async () => {
        router.push("/(app)/quote/share-quote")
    }

    const handleRoute = () => {
        dispatch({ type: ACTIONS.QUOTE_DATA })
        dispatch({ type: ACTIONS.ORDER_DATA })
        dispatch({ type: ACTIONS.MULTIPLE_QUOTE_DATA })
        router.replace("/(app)/(tabs)/home")
    }


    // 

    return (
        <SafeAreaView style={{ backgroundColor: 'white' }}>

            <TopNavigation title="" />

            <ScrollView
                contentContainerStyle={scrollViewContentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingBottom: 20,
                        backgroundColor: "#fff",
                        alignItems: "center",

                    }}
                >
                    <Text style={{ fontFamily: "interMedium", fontSize: 16 }}>
                        Quote Summary
                    </Text>

                    <Text style={{ fontSize: s(11), marginTop: spacing.xs }}>
                        Review your details before proceeding.
                    </Text>
                </View>

                <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
                </View>

                <View>
                    <View
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 20,
                            backgroundColor: "#fff",
                            rowGap: 20,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{ fontFamily: "interSemiBold" }}>
                                Pickup & Delivery
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                                <MaterialIcons name="circle" size={10} color="#FF5E00" />
                                <Text>Pickup address</Text>
                            </View>

                            <Text
                                style={{ maxWidth: "50%" }}
                            >{`${orderData?.pickupStreet}, ${orderData?.pickupArea}, ${orderData?.pickupState}`}</Text>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{}}>Pickup Date and Time</Text>
                            <Text style={{ fontFamily: "interSemiBold", fontSize: 13 }}>
                                {moment(orderData?.pickupDate).format("ll")} {" "}
                                {moment(orderData?.pickupTime).format("LT")}
                            </Text>
                        </View>

                        <View style={{ height: 1, borderWidth: 1, borderColor: colors.border }}></View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: 'flex-start'
                            }}
                        >
                            <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                                <MaterialIcons name="place" size={13} color="#4CAF50" />
                                <Text>Delivery Address</Text>
                            </View>
                            <Text style={{ maxWidth: "50%", lineHeight: 25 }}>
                                {`${orderData?.dropoffStreet}, ${orderData?.dropoffArea}, ${orderData?.dropoffState}`}
                            </Text>
                        </View>

                    </View>

                    <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
                    </View>

                    <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
                    </View>

                    <View
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 20,
                            backgroundColor: "#fff",
                            rowGap: 10,
                            paddingBottom: 70,
                        }}
                    >
                        <Text style={{ fontFamily: "interSemiBold" }}>
                            Delivery Details
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{}}>Travel Time</Text>

                            {distanceLoading ? <ActivityIndicator /> :
                                <Text style={{ fontFamily: "interSemiBold" }}>
                                    Estimated:{" "}
                                    {duration}
                                </Text>}
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{}}>Distance</Text>

                            {distanceLoading ? <ActivityIndicator /> :
                                <Text style={{ fontFamily: "interSemiBold" }}>{distance}</Text>}
                        </View>

                        {shippingType === "basic" &&
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text style={{}}>Fare Estimate</Text>

                                {distanceLoading ? <ActivityIndicator /> :
                                    <Text style={{ fontFamily: "interSemiBold" }}> N{formatMoney(Number(quoteData?.estimatedPrice))}</Text>}
                            </View>}
                    </View>

                </View>

                <View style={styles.footerContainer}>

                   {shippingType === "basic" && 
                   <Button
                        onPress={shareQuote}
                    >
                        <ButtonText>Share Quote</ButtonText>
                    </Button>}


                    <Pressable onPress={handleRoute} style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ color: colors.primary, textDecorationLine: "underline" }}>Go Home</Text>
                    </Pressable>
                </View>

            </ScrollView>
        </SafeAreaView>

    );
}

export default SummarySheet;

const styles = StyleSheet.create({
    wrapper: {
        gap: 20,
        // marginTop: spacing.xxl,
    },
    scrollView: {
        flex: 1,
        // backgroundColor: "#",
    },
    scrollViewContentContainer: {
        // backgroundColor: "#F3F3F3",
        rowGap: 10,
    },
    selectedLocationStyle: {
        marginTop: 20,
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    label: {
        fontFamily: "interBold",
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        marginBottom: 8,
    },
    coordinates: {
        color: "#666",
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
    },
    switch: {
        width: 50,
        height: 30,
    },
    track: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: "#F3F3F3",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#6363631A",
    },
    thumb: {
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#fff",
        // marginBottom: 20
    },
    textStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    text: {
        fontSize: 14,
        fontFamily: "interRegular",
    },

});
