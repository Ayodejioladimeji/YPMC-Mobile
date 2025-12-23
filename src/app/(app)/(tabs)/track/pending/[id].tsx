import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import ProgressBar from "@/components/track/progress-bar";
import RiderInfo from "@/components/track/rider-info";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { DataContext } from "@/store/GlobalState";
import { GetRequest, PostRequest } from "@/utils/requests";
import AddressList from "@/components/track/addresslist";
import images from "@/assets/images";
import { colors } from "@/theme";
import { BadgeIcon, DownloadIcon } from "@/assets/images/svgs";
import { s } from "react-native-size-matters";
import MapView from "react-native-maps";
import CustomMarker2 from "@/components/ship/CustomMarker2";
import CustomMarker from "@/components/ship/CustomMarker";
import { customMapStyle } from "@/constants/maps-theme";
import { formatMoney } from "@/utils/utils";
import ShipmentIcon from "@/components/shipment-icon";
import RiderMarker from "@/components/ship/RiderMarker";
import CallAndChat from "@/components/call-and-chat";
import StatusComponent from "@/components/status";
import MapViewDirections from "react-native-maps-directions";
import Timeline from "@/components/track/timeline";
import { toast } from "sonner-native";
import * as Clipboard from "expo-clipboard";
import { ACTIONS } from "@/store/Actions";
import RatingModal from "@/components/track/rating-modal";
import TopNavigation from "@/components/TopNavigation";
import DeliveryETA from "@/components/bottomsheets/delivery-eta";
import PendingDeliveryETA from "@/components/bottomsheets/pending-delivery-eta";


const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 
type Markers = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
};

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Helper for aspect ratio

export default function ShippingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const { state, dispatch } = useContext(DataContext)
  const [order, setOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any>([])
  const [rider, setRider] = useState<any>(null)
  const [buttonLoading, setButtonLoading] = useState(false)

  const riderInfoSheetRef = useRef<BottomSheetModal>(null);
  const riderInfoSheetIndex = useSharedValue<number>(0);
  const riderInfoSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);

  const timelineSheetRef = useRef<BottomSheetModal>(null);
  const timelineSheetIndex = useSharedValue<number>(0);
  const timelineSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const [callback, setCallback] = useState(false)

  const deliverySheetRef = useRef<BottomSheetModal>(null);

  useFocusEffect(
    useCallback(() => {
      if (state.deliveryMode) {
        setTimeout(() => {
          deliverySheetRef.current?.present();
        }, 100);
      }
    }, [state.deliveryMode])
  );

  useEffect(() => {
    if (state?.token && id) {
      const getPendingOrders = async () => {
        const res = await GetRequest(`/shipping/customer/${id}`, state?.token)

        if (res?.status === 200 || res?.status === 201) {
          setOrder(res?.data?.data)
          setRider(res?.data?.data?.rider || res?.data?.data?.proposedRider)
          dispatch({ type: ACTIONS.RIDER_DETAIL, payload: res?.data?.data?.rider || res?.data?.data?.proposedRider })
          setData(res?.data?.data)
        }

        setLoading(false)
      }

      const getMultiPendingOrders = async () => {
        const res = await GetRequest(`/shipping/customer/multiple-shipping/${id}`, state?.token)
        if (res?.status === 200 || res?.status === 201) {
          setOrders(res?.data?.data)
          setRider(res?.data?.data?.multiShipping?.shippings[0]?.rider || res?.data?.data?.multiShipping?.shippings[0]?.proposedRider)
          dispatch({ type: ACTIONS.RIDER_DETAIL, payload: res?.data?.data?.multiShipping?.shippings[0]?.rider || res?.data?.data?.multiShipping?.shippings[0]?.proposedRider })

          const shippingsData = res?.data?.data?.multiShipping?.shippings;
          dispatch({ type: ACTIONS.MULTIPLE, payload: shippingsData });
          setMultipleData(res?.data?.data?.multiShipping)
        }

        setLoading(false)
      }

      if (state?.shippingType === "basic") {
        getPendingOrders()
      }

      if (state?.shippingType === "multi") {
        getMultiPendingOrders()
      }
    }
  }, [state?.token, id, state?.callback, state?.shippingType])


  // set orderData
  const setData = (order: any) => {

    const payload = {
      dropoffArea: order?.dropoffArea,
      dropoffLatitude: parseFloat(order?.dropoffLatitude),
      dropoffLongitude: parseFloat(order?.dropoffLongitude),
      dropoffState: order?.dropoffState,
      dropoffStreet: order?.dropoffStreet,
      isFragile: order?.packageDetails?.isFragile,
      isSecurityShipping: order?.isSecurityShipping,
      packageName: order?.packageDetails?.name,
      packageNotes: order?.packageDetails?.notes,
      packageSize: order?.packageDetails?.size,
      pickupArea: order?.pickupArea,
      pickupDate: order?.pickupDate,
      pickupLatitude: parseFloat(order?.pickupLatitude),
      pickupLongitude: parseFloat(order?.pickupLongitude),
      pickupState: order?.pickupState,
      pickupStreet: order?.pickupStreet,
      pickupTime: new Date().toISOString(),
      receiverName: order?.receiverInfo?.name,
      receiverPhoneNumber: order?.receiverInfo?.contactInfo?.phoneNumber,
      scheduledType: "now",
      senderName: order?.senderInfo?.name,
      senderPhoneNumber: order?.senderInfo?.contactInfo?.phoneNumber
    }

    dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
  }

  const setMultipleData = (orders: any) => {
    const shipping = orders?.shippings?.[0];

    const payload = {
      dropoffArea: shipping?.dropoffArea ?? "",
      dropoffLatitude: parseFloat(shipping?.dropoffLatitude ?? "0"),
      dropoffLongitude: parseFloat(shipping?.dropoffLongitude ?? "0"),
      dropoffState: shipping?.dropoffState ?? "",
      dropoffStreet: shipping?.dropoffStreet ?? "",
      isFragile: shipping?.packageDetails?.isFragile ?? false,
      isSecurityShipping: shipping?.isSecurityShipping ?? false,
      packageName: shipping?.packageDetails?.name ?? "",
      packageNotes: shipping?.packageDetails?.notes ?? "",
      packageSize: shipping?.packageDetails?.size ?? "",
      pickupArea: shipping?.pickupArea ?? "",
      pickupDate: shipping?.pickupDate ?? "",
      pickupLatitude: parseFloat(shipping?.pickupLatitude ?? "0"),
      pickupLongitude: parseFloat(shipping?.pickupLongitude ?? "0"),
      pickupState: shipping?.pickupState ?? "",
      pickupStreet: shipping?.pickupStreet ?? "",
      pickupTime: new Date().toISOString(),
      receiverName: shipping?.receiverInfo?.name ?? "",
      receiverPhoneNumber: shipping?.receiverInfo?.contactInfo?.phoneNumber ?? "",
      scheduledType: "now",
      senderName: shipping?.senderInfo?.name ?? "",
      senderPhoneNumber: shipping?.senderInfo?.contactInfo?.phoneNumber ?? "",
    };

    dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
  }



  // pay for pending order
  const handlePayment = async () => {
    setButtonLoading(true)

    if (state?.user?.subscription) {
      router.replace('/(app)/(tabs)/ship/success');

    }
    else {
      dispatch({ type: ACTIONS.SHIPPING_ID, payload: id })
      dispatch({ type: ACTIONS.SHIPPING, payload: order })
      dispatch({ type: ACTIONS.PENDING_ID, payload: id })
      dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "basic" })

      deliverySheetRef.current?.present();
      dispatch({ type: ACTIONS.DELIVERY_MODE, payload: true })
    }

    setButtonLoading(false)
  }

  const handlePaymentMultiple = async () => {
    setButtonLoading(true)

    if (state?.user?.subscription) {
      router.replace('/(app)/(tabs)/ship/success');
    }
    else {

      const myshipping = {
        shippingModePrices: {
          express: orders?.multiShipping?.totalShipmentModePrices.express,
          standard: orders?.multiShipping?.totalShipmentModePrices.standard
        }
      }

      dispatch({ type: ACTIONS.SHIPPING, payload: myshipping })
      dispatch({ type: ACTIONS.SHIPPING_ID, payload: id })
      dispatch({ type: ACTIONS.PENDING_ID, payload: id })
      dispatch({ type: ACTIONS.PENDING_PAYMENT, payload: true })
      dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "multi" })

      deliverySheetRef.current?.present();

    }
    setButtonLoading(false)
  }

  const multipleDistance = orders?.multiShipping?.shippings?.find((item: any) => item.distanceInKilometers)?.distanceInKilometers;

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <TopNavigation title="Pending" />

      <View style={{ flex: 1, position: 'relative' }}>

        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 15, paddingTop: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

          {loading ?
            <ActivityIndicator color="#F97216" style={{ marginTop: 40 }} />
            :
            <>
              {state?.shippingType === "basic" &&
                <View style={styles.container}>
                  <View style={styles.spaceBetween}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                    >
                      <ShipmentIcon status={order?.status} />

                      <View>
                        <Text style={{ fontSize: s(13), fontFamily: "interBold" }}>
                          {order?.packageDetails.name}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <Ionicons name="bicycle-outline" size={16} />
                          <StatusComponent status={order?.status} />
                        </View>
                      </View>
                    </View>

                    <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: s(13), fontFamily: "interMedium" }}>
                        ₦{formatMoney(Number(order?.actualPrice || order?.actualPriceInNaira || order?.estimatedPriceInNaira || 0))}
                      </Text>
                    </View>
                  </View>

                  <AddressList data={order} />

                  <Button
                    size="sm"
                    style={{ marginTop: 20, flex: 1, alignSelf: "flex-start" }}
                    onPress={() => { timelineSheetRef.current?.present(), setCallback(!callback) }}
                  >
                    <ButtonText>View Timeline</ButtonText>
                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      style={{ color: "#fff" }}
                    />
                  </Button>
                </View>
              }

              {state?.shippingType === "multi" &&
                <>
                  {orders?.multiShipping?.shippings?.map((order: any, index: number) => {
                    return (
                      <View style={styles.container} key={index}>
                        <View style={styles.spaceBetween}>
                          <View
                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                          >
                            <ShipmentIcon status={order?.status} />

                            <View>
                              <Text style={{ fontSize: s(13), fontFamily: "interBold" }}>
                                {order?.packageDetails.name}
                              </Text>

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                  marginTop: 2,
                                }}
                              >
                                <Ionicons name="bicycle-outline" size={16} />
                                <StatusComponent status={order?.status} />
                              </View>
                            </View>
                          </View>

                          <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: s(13), fontFamily: "interMedium" }}>
                              ₦{formatMoney(Number(order?.actualPrice || order?.actualPriceInNaira || order?.estimatedPriceInNaira || 0))}
                            </Text>
                          </View>
                        </View>

                        <AddressList data={order} />

                        <Button
                          size="sm"
                          style={{ marginTop: 20, flex: 1, alignSelf: "flex-start" }}
                          onPress={() => { timelineSheetRef.current?.present(), setCallback(!callback) }}
                        >
                          <ButtonText>View Timeline</ButtonText>
                          <Ionicons
                            name="arrow-forward"
                            size={24}
                            style={{ color: "#fff" }}
                          />
                        </Button>
                      </View>
                    )
                  })}
                </>
              }

              {state?.shippingType === "basic" &&
                <View
                  style={[
                    styles.container,
                    {
                      marginTop: 20,
                      marginBottom: 50,
                      rowGap: 10,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Distance</Text>
                    <Text style={{ fontSize: s(12) }}>
                      {order?.distanceInKilometers?.toFixed(1) || 0} km
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Fare estimate</Text>
                    <Text style={{ fontSize: s(12) }}>
                      ₦
                      {formatMoney(order?.actualPrice || order?.actualPriceInNaira || order?.estimatedPriceInNaira || 0)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Service fee</Text>
                    <Text style={{ fontSize: s(12) }}>₦0</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Total</Text>
                    <Text style={{ fontSize: s(12), fontFamily: "interSemiBold" }}>
                      ₦
                      {formatMoney(Number(order?.actualPrice || order?.actualPriceInNaira || order?.estimatedPriceInNaira || 0))}
                    </Text>
                  </View>
                </View>
              }

              {state?.shippingType === "multi" &&
                <View
                  style={[
                    styles.container,
                    {
                      marginTop: 20,
                      marginBottom: 50,
                      rowGap: 10,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Distance</Text>
                    <Text style={{ fontSize: s(12) }}>
                      {multipleDistance || 0} km
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Fare estimate</Text>
                    <Text style={{ fontSize: s(12) }}>
                      ₦
                      {formatMoney(orders?.multiShipping?.totalActualPriceInNaira || orders?.multiShipping?.totalEstimatedPriceInNaira || 0)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Service fee</Text>
                    <Text style={{ fontSize: s(12) }}>₦0</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: s(12) }}>Total</Text>
                    <Text style={{ fontSize: s(12), fontFamily: "interSemiBold" }}>
                      ₦
                      {formatMoney(orders?.multiShipping?.totalActualPriceInNaira || orders?.multiShipping?.totalEstimatedPriceInNaira || 0)}
                    </Text>
                  </View>
                </View>
              }
              {/* 
              <Button style={{ marginVertical: 20, marginBottom: Platform.OS === "android" ? 50 : 10, flex: 1 }} onPress={state?.shippingType === "basic" ? handlePayment : handlePaymentMultiple}>
                <ButtonText>Complete shipment</ButtonText>
                {buttonLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="bicycle-outline" size={24} color="white" />
                )}
              </Button> */}
            </>}

        </ScrollView>

      </View>

      <RiderInfo
        ref={riderInfoSheetRef}
        index={riderInfoSheetIndex}
        position={riderInfoSheetPosition}
        rider={rider}
        amount={order?.actualPriceInNaira}
        order={order}
      />

      <Timeline
        ref={timelineSheetRef}
        index={timelineSheetIndex}
        position={timelineSheetPosition}
        id={order?.trackingId}
      />

      {/* delivery ETA */}
      <PendingDeliveryETA
        ref={deliverySheetRef}
        closeModal={() => deliverySheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#636363",
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
  },
  container: {
    backgroundColor: "#F3F3F380",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6363631A",
    marginBottom: 20
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    backgroundColor: "#1E83C51A",
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#1E83C5",
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
});
