import React, { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import LocationForm, {
    type Location as LocationType,
} from "@/components/ship/location-form";
import { Button, ButtonText } from "@/components/ui/button";
const { height, width } = Dimensions.get('window');
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import images from "@/assets/images";
import { SafeAreaView } from "react-native";
import TopNavigation from "@/components/TopNavigation";
import { retrieveData, storeData } from "@/utils/helper";
import ReceiverLocationForm from "@/components/ship/receiver-location-form";
import { s } from "react-native-size-matters";
import { Image } from "expo-image";
import { DropoffIcon, PickupIcon } from "@/assets/images/svgs";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { v4 as uuidv4 } from "uuid";
import { PostRequest } from "@/utils/requests";
import { toast } from "sonner-native";



export default function PackageLocations() {
    const router = useRouter();
    const { state, dispatch } = useContext(DataContext)
    const { orderData, user, shippingType } = state
    const [focusedField, setFocusedField] = useState<null | string>(null);
    const inputRef = useRef<any>(null);
    const generateUUID = (): string => uuidv4();
    const [saveLoading, setSaveLoading] = useState(false)

    const locationFormSheetRef = useRef<BottomSheetModal>(null);
    const locationFormSheetIndex = useSharedValue<number>(0);
    const locationFormSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
    const receiverLocationFormSheetRef = useRef<BottomSheetModal>(null);
    const receiverLocationFormSheetIndex = useSharedValue<number>(0);
    const receiverLocationFormSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);


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

        dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state.orderData, ...payload } });
        await storeData("pickupAddress", payload)
    }

    function handleReceiverLocationSubmit(location: LocationType) {
        const payload = {
            dropoffStreet: location.street,
            dropoffArea: location.area,
            dropoffState: location.state,
            dropoffLongitude: location.longitude,
            dropoffLatitude: location.latitude,
        };

        dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state.orderData, ...payload } });
    }

    const handleSubmit = async () => {
        setSaveLoading(true)

        const payload = {
            ...orderData,
            id: orderData?.id || generateUUID(),
            packageName: "Item",
            receiverName: "User",
            receiverPhoneNumber: "08012345678",
            pickupDate: new Date(),
            pickupTime: new Date(),
            isFragile: false,
            senderName: user?.fullName,
            senderPhoneNumber: user?.user?.phoneNumber,
            scheduledPickupTime: new Date()
        }

        dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })

        if (shippingType === "multiple") {
            router.push("/(app)/quote/multiple-summary")
        }
        else {
            const res = await PostRequest("/shipping/generate-quote-customer", payload, state?.token)
            if (res?.status === 200 || res?.status === 201) {
                dispatch({ type: ACTIONS.QUOTE_DATA, payload: res?.data?.data })
                toast.success(res?.data?.message)
                router.push("/(app)/quote/summary")
            }
        }

        setSaveLoading(false)

    }

    // 

    return (
        <SafeAreaView style={{ position: 'relative', flex: 1, backgroundColor: '#fff' }}>
            <TopNavigation title={state?.shippingType === "basic" ? "Single Quote" : "Multiple Quote"} />

            <ScrollView style={{ backgroundColor: colors.muted }} showsVerticalScrollIndicator={false}>
                <Image
                    source={images?.map}
                    style={{
                        width,
                        height: height * 0.45,
                        resizeMode: 'cover',
                    }}
                />

                <View style={styles.wrapper}>
                    <View style={{ height: 5, width: 70, borderRadius: 25, backgroundColor: colors.lightColor, margin: 'auto', marginBottom: 20 }}></View>
                    <View style={{ gap: spacing.xs }}>
                        <Text style={{ fontSize: s(12) }}>Pickup Location</Text>

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
                            ref={inputRef}
                        >
                            <View style={{ position: 'absolute', left: 10 }}>
                                <PickupIcon />
                            </View>

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

                    <View style={{ gap: spacing.xs }}>
                        <Text style={{ fontSize: s(12) }}>Delivery Location</Text>

                        <Pressable
                            style={[
                                styles.locationPlaceholder,
                                focusedField === "deliverylocation" && { borderColor: "#f97216", borderWidth: 1 },
                            ]}
                            onBlur={() => setFocusedField(null)}
                            onPress={() => {
                                receiverLocationFormSheetRef.current?.present();
                                setFocusedField("deliverylocation")
                            }}
                        >
                            <View style={{ position: 'absolute', left: 10 }}>
                                <DropoffIcon />
                            </View>

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

                    <View style={styles.footerContainer}>
                        <Button onPress={handleSubmit} disabled={!orderData?.pickupStreet || !orderData?.dropoffStreet}>
                            <ButtonText>Continue</ButtonText>
                            {saveLoading ? <ActivityIndicator color="white" /> :
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            }
                        </Button>
                    </View>
                </View>

                <LocationForm
                    ref={locationFormSheetRef}
                    index={locationFormSheetIndex}
                    position={locationFormSheetPosition}
                    setLocation={handleLocationSubmit}
                    closeModal={() => locationFormSheetRef.current?.close()}
                />

                <ReceiverLocationForm
                    ref={receiverLocationFormSheetRef}
                    index={receiverLocationFormSheetIndex}
                    position={receiverLocationFormSheetPosition}
                    setLocation={handleReceiverLocationSubmit}
                    closeModal={() => receiverLocationFormSheetRef.current?.close()}
                />
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 20,
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,

        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,

        // Android shadow
        elevation: 6,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContentContainer: {
        paddingHorizontal: 16,
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
    locationPlaceholder: {
        height: 55,
        justifyContent: "center",
        gap: 10,
        borderRadius: 10,
        backgroundColor: "#F3F3F3",
        paddingHorizontal: 10,
        paddingLeft: 40
    },

    footerContainer: {
        backgroundColor: "#fff",
        marginTop: 10,
        marginBottom: 40
    },
});
