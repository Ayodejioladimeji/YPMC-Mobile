import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors } from "@/theme";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { BottomSheetModal, SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useSharedValue } from "react-native-reanimated";
import { DeleteRequest, GetRequest, PostRequest } from "@/utils/requests";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { s } from "react-native-size-matters";
import AddressList from "@/components/quote/addresslist";
import AllQuotesSummarySheet from "@/components/quote/all-quotes-summary";
import { toast } from "sonner-native";
import TrackNavigation from "@/components/TrackNavigation";

export default function MultipleSummary() {
    const { state, dispatch } = useContext(DataContext)
    const { multipleData } = state
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [quotes, setQuotes] = useState<any>([])
    const [callback, setCallback] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [dataId, setDataId] = useState("")
    const [refreshing, setRefreshing] = useState(false);


    const summarySheetRef = useRef<BottomSheetModal>(null);
    const summarySheetIndex = useSharedValue<number>(0);
    const summarySheetPosition = useSharedValue<number>(SCREEN_HEIGHT);

    const getQuotes = async () => {
        const res = await GetRequest(`/shipping/quotes`, state?.token)
        if (res?.status === 200 || res?.status === 201) {
            setQuotes(res?.data?.data)
        }
        setLoading(false)
    }

    useEffect(() => {

        if (state?.token) {
            getQuotes()
        }
    }, [state?.token, callback])


    // view details
    const viewDetails = (shipping: any) => {
        const item = shipping.shipping
        const type = shipping.type

        if (type === "multi") {
            router.push({
                pathname: "/(app)/(tabs)/ship/multiple-quotes",
                params: {
                    id: item.id
                },
            });
        }
        else {
            const payload = {
                dropoffArea: item?.dropoffArea,
                dropoffLatitude: parseFloat(item?.dropoffLatitude),
                dropoffLongitude: parseFloat(item?.dropoffLongitude),
                dropoffState: item?.dropoffState,
                dropoffStreet: item?.dropoffStreet,
                isFragile: item?.packageDetails?.isFragile,
                isSecurityShipping: item?.isSecurityShipping,
                packageName: item?.packageDetails?.name,
                packageNotes: item?.packageDetails?.notes,
                packageSize: item?.packageDetails?.size,
                pickupArea: item?.pickupArea,
                pickupDate: item?.pickupDate,
                pickupLatitude: parseFloat(item?.pickupLatitude),
                pickupLongitude: parseFloat(item?.pickupLongitude),
                pickupState: item?.pickupState,
                pickupStreet: item?.pickupStreet,
                pickupTime: new Date().toISOString(),
                receiverName: item?.receiverInfo?.name,
                receiverPhoneNumber: item?.receiverInfo?.contactInfo?.phoneNumber,
                scheduledType: "now",
                senderName: item?.senderInfo?.name,
                senderPhoneNumber: item?.senderInfo?.contactInfo?.phoneNumber,
                type,
                amount: item?.estimatedPriceInNaira
            }

            dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
            dispatch({ type: ACTIONS.QUOTE_DATA, payload: payload })
            summarySheetRef.current?.present();
        }
    }

    // remove data
    const removeDataItem = async (id: string, type:string) => {
        setDataId(id)
        setDeleteLoading(true)

        const res = await DeleteRequest(`/shipping/quotes/${id}?shippingType=${type}`, state?.token)
        if (res?.status === 200 || res?.status === 201) {
            setCallback(!callback)
            toast.success(res?.data?.message)
        }
        setDeleteLoading(false)
    };


      // on refresh
      const onRefresh = useCallback(() => {
        setRefreshing(true);
        getQuotes()
    
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      }, [refreshing]);


    // 

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TrackNavigation title="All Delivery Quotes" />

            <ScrollView showsVerticalScrollIndicator={false} refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                {loading ? <ActivityIndicator /> :

                    <View
                        style={{
                            backgroundColor: "#fff",
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            gap: 20,
                            paddingBottom: 200,

                        }}
                    >
                        {quotes?.map((shipping: any, index: number) => {
                            const item = shipping.shipping
                            const type = shipping.type

                            return (
                                <View style={styles.container} key={index}>
                                    {type === "multi" && <View
                                        style={{
                                            backgroundColor: colors.primary, padding: 5, paddingHorizontal: 8, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
                                        }}>
                                        <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{item?.shippings?.length})</Text>
                                    </View>}

                                    <View style={styles.spaceBetween}>
                                        <View
                                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                                        >
                                            <View style={styles.iconContainer}>
                                                <Ionicons name="cube-outline" size={24} style={styles.icon} />
                                            </View>

                                            <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
                                                numberOfLines={1}
                                                ellipsizeMode="tail" >
                                                {type === "individual" ? item?.packageDetails?.name : item?.shippings[0].packageDetails?.name}
                                            </Text>
                                        </View>
                                    </View>

                                    <AddressList data={type ==="individual" ? item : item?.shippings[0]} />

                                    <View style={[{ gap: 15, marginTop: 16 }, styles.spaceBetween]}>
                                        <Button size="sm" style={{ gap: 5, flex: 1, borderRadius: 25, height: 45, paddingHorizontal: 5 }} onPress={() => viewDetails(shipping)}>
                                            <ButtonText>Details</ButtonText>
                                            <Ionicons name="arrow-forward" size={18} color="white" />
                                        </Button>

                                        <Button size="sm" variant="outline" style={{ gap: 5, flex: 1, borderRadius: 25, height: 45, paddingHorizontal: 5 }} onPress={() => removeDataItem(item.id, type)}>
                                            <ButtonText>Delete</ButtonText>
                                            {deleteLoading && dataId === item?.id ?
                                                <ActivityIndicator />
                                                :
                                                <Ionicons name="trash-outline" size={18} color="red" />
                                            }
                                        </Button>
                                    </View>
                                </View>
                            );
                        })}

                        <AllQuotesSummarySheet
                            ref={summarySheetRef}
                            index={summarySheetIndex}
                            position={summarySheetPosition}
                            onSubmit={() => summarySheetRef.current?.close()}
                        />

                    </View>
                }


                {!loading && quotes?.length === 0 && <View style={{}}>
                    <Image
                        source={require("@/assets/images/logistics-bus.png")}
                        style={{
                            width: 160,
                            height: 160,
                            alignSelf: "center",
                        }}
                    />

                    <Text style={{ textAlign: "center", fontSize: s(14), color: "#636363" }}>
                        No saved Delivery Quotes
                    </Text>
                </View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F3F3F380",
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#6363631A",
        flex: 1,
        overflow: 'hidden'
    },
    spaceBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconContainer: {
        backgroundColor: "#F972161A",
        width: 44,
        height: 44,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        color: colors.primary,
    },
    eventContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    eventMarker: {
        alignItems: "center",
        marginRight: 16,
    },
    eventDetails: {
        flex: 1,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#4CAF50",
    },
    line: {
        width: 2,
        height: 48,
        backgroundColor: "#4CAF50",
    },
    address: {
        fontSize: 16,
        fontFamily: "interSemiBold",
        color: "#000",
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: "#636363",
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "#fff",
        position: 'absolute',
        bottom: 0,
        flex: 1,
        width: '100%'
    },
});
