import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";

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
import { GetRequest } from "@/utils/requests";
import AddressList from "@/components/track/addresslist";
import images from "@/assets/images";
import { colors } from "@/theme";
import { BadgeIcon } from "@/assets/images/svgs";
import { s } from "react-native-size-matters";
import MapView from "react-native-maps";
import CustomMarker2 from "@/components/ship/CustomMarker2";
import CustomMarker from "@/components/ship/CustomMarker";
import { customMapStyle } from "@/constants/maps-theme";
import { convertMinutes, formatMoney } from "@/utils/utils";
import ShipmentIcon from "@/components/shipment-icon";
import RiderMarker from "@/components/ship/RiderMarker";
import CallAndChat from "@/components/call-and-chat";
import StatusComponent from "@/components/status";
import MapViewDirections from "react-native-maps-directions";
import Timeline from "@/components/track/timeline";
import { toast } from "sonner-native";
import * as Clipboard from "expo-clipboard";
import DetailNavigation from "@/components/DetailNavigation";
import { ACTIONS } from "@/store/Actions";
import RatingModal from "@/components/track/rating-modal";
import UseLocation from "./chat/_components/use-location";
import UseChat from "./chat/_components/use-chat";
import { SocketClient } from "@/components/socket-client";


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

const { width, height } = Dimensions.get('window');

// Helper for aspect ratio

export default function ShippingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const { state, dispatch } = useContext(DataContext)
  const {location} = state
  const [order, setOrder] = useState<any>(null)
  const mapRef = useRef<MapView | null>(null);
  const [pickupLocation, setPickupLocation] = useState<any>(null)
  const [dropoffLocation, setDropoffLocation] = useState<any>(null)
  const [riderLocation, setRiderLocation] = useState<any>({})
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [mapLoading, setMapLoading] = useState(true)
  const [rider, setRider] = useState<any>(null)

  const bottomSheetRef = useRef<BottomSheet>(null);
  const riderInfoSheetRef = useRef<BottomSheetModal>(null);
  const riderInfoSheetIndex = useSharedValue<number>(0);
  const riderInfoSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);

  const timelineSheetRef = useRef<BottomSheetModal>(null);
  const timelineSheetIndex = useSharedValue<number>(0);
  const timelineSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const [callback, setCallback] = useState(false)
  const [ratingModal, setRatingModal] = useState(false)



  useFocusEffect(
    useCallback(() => {
      if (state?.token && id) {
        const getActiveOrders = async () => {
          const res = await GetRequest(`/shipping/customer/${id}`, state?.token)
          if (res?.status === 200 || res?.status === 201) {
            setOrder(res?.data?.data) 
            setRider(res?.data?.data?.rider || res?.data?.data?.proposedRider)
            dispatch({ type: ACTIONS.RIDER_DETAIL, payload: res?.data?.data?.rider || res?.data?.data?.proposedRider })
          }
          setLoading(false) 
        }
        getActiveOrders()
      }
    }, [state?.token, id, state?.callback])
  )

  useEffect(() => {

      const getCoord = () => {
        const pickupLatitude = parseFloat(location?.pickupLatitude);
        const pickupLongitude = parseFloat(location?.pickupLongitude);
        const dropoffLatitude = parseFloat(location?.dropoffLatitude);
        const dropoffLongitude = parseFloat(location?.dropoffLongitude);


        if (
          !isNaN(pickupLatitude) &&
          !isNaN(pickupLongitude) &&
          !isNaN(dropoffLatitude) &&
          !isNaN(dropoffLongitude)
        ) {
          // Set pickup and dropoff locations
          const pickupCoord = { latitude: pickupLatitude || 0, longitude: pickupLongitude || 0 };
          const dropoffCoord = { latitude: dropoffLatitude || 0, longitude: dropoffLongitude || 0 };

          setPickupLocation(pickupCoord);
          setDropoffLocation(dropoffCoord);

          // Calculate the center point between pickup and dropoff locations
          const latitude = (pickupLatitude + dropoffLatitude) / 2 || 0;
          const longitude = (pickupLongitude + dropoffLongitude) / 2 || 0;

          // Calculate the latitude and longitude deltas to cover both points
          const latitudeDelta = Math.abs(pickupLatitude - dropoffLatitude) * 1.5 || 0.0122;
          const longitudeDelta = Math.abs(pickupLongitude - dropoffLongitude) * 1.5 || 0.0121;

          setMapRegion({ latitude, longitude, latitudeDelta, longitudeDelta });

          // Set the map loading state to false
          const riderRoute = { latitude: parseFloat(state?.riderLocation?.location?.latitude), longitude: parseFloat(state?.riderLocation?.location?.longitude) }
          // const riderRoute = { "latitude": 6.6459422, "longitude": 3.30703935 }
          setRiderLocation(riderRoute)

          setMapLoading(false);
        }
      }
      getCoord()

  }, [state?.location]);


  useEffect(() => {
    if (mapRegion) {
      mapRef.current?.animateToRegion(mapRegion);
    }
  }, [mapRegion]);


  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(order?.trackingId);
      toast.success("Tracking ID copied to clipboard.");
    } catch (error) {
      Alert.alert("Error", "Unable to copy the Tracking ID.");
    }
  };

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'white' }}>
      <DetailNavigation title="Active" id={order?.id} />
      <SocketClient />
      <UseLocation shippingId={id} />
      <UseChat shippingId={id} />

      <View style={{ flex: 1, position: 'relative' }}>

        {!loading && order?.status !== "PENDING" && <ProgressBar order={order} />}

        {pickupLocation && dropoffLocation &&

          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
            userInterfaceStyle="light"
          >

            <CustomMarker2 coordinate={pickupLocation} />
            <CustomMarker coordinate={dropoffLocation} />
            <RiderMarker coordinate={riderLocation} />

            <MapViewDirections
              origin={{
                latitude: pickupLocation.latitude || 0,
                longitude: pickupLocation.longitude || 0,
              }}
              destination={{
                latitude: dropoffLocation.latitude || 0,
                longitude: dropoffLocation.longitude || 0,
              }}
              // waypoints={[
              //   {
              //     latitude: riderLocation?.latitude || 0,
              //     longitude: riderLocation?.longitude || 0,
              //   },
              // ]}
              precision="high"
              optimizeWaypoints={true}
              apikey={process.env.EXPO_PUBLIC_API_KEY}
              strokeWidth={2}
              strokeColor="#F97216"
              // lineDashPattern={[7]}
              onError={errorMessage => {
                // Alert.alert(
                //   'Error',
                //   `MapViewDirections Error: ${errorMessage}`,
                // );
              }}
            />
          </MapView>
        }

        <BottomSheet
          index={1}
          snapPoints={["30%", "60%", "90%"]}
          ref={bottomSheetRef}
          handleComponent={() => null}
        >
          {!loading && order?.status !== "PENDING" && <>
            <View style={[styles.bannerContainer, { backgroundColor: order?.status === "DELIVERED" ? "#4CAF50" : "#1E83C5" }]}>
              <View style={styles.bottomShape} />
              <View style={{ flexDirection: 'row', columnGap: 5, alignItems: 'center' }}>
                <Ionicons name={order?.status === "DELIVERED" ? "checkmark" : "time-outline"} size={16} color="white" />
                <Text style={styles.bannerText}>{order?.status === "DELIVERED" ? "Delivery Successful" : "In Transit"}</Text>
              </View>
            </View>

            <View style={{ height: 5, backgroundColor: colors.mutedForeground, width: 50, borderRadius: 20, position: 'absolute', top: 55, alignSelf: 'center' }}></View>
          </>}

          <BottomSheetScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 15, paddingTop: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

            {loading ?
              <ActivityIndicator color="#F97216" style={{ marginTop: 40 }} /> : <>
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
                      <TouchableOpacity onPress={handleCopy} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontSize: s(10), fontFamily: "interMedium" }}>
                          {order?.trackingId}
                        </Text>
                        <MaterialIcons name="content-copy" size={14} color="black" style={{ marginLeft: 0 }} />
                      </TouchableOpacity>

                      <Text style={{ fontSize: s(13), fontFamily: "interMedium" }}>
                        ₦{formatMoney(Number(order?.actualPrice || order?.actualPriceInNaira || 0))}
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

                {order?.riderAssignmentStatus !== "REJECTED" && rider &&
                  <View style={[styles.container, { marginTop: 20, rowGap: 20 }]}>
                    <Text
                      style={{
                        color: "#636363",
                        fontSize: 14
                      }}
                    >
                      Rider
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        {rider?.profileImageUrl ?
                          <Image
                            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.primary }}
                            source={{ uri: rider?.profileImageUrl }}
                          /> :
                          <Image
                            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.primary }}
                            source={images.user}
                          />}

                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Text
                              style={{ fontSize: 14, fontFamily: "interSemiBold" }}
                            >
                              {rider?.firstName} {rider?.lastName}
                            </Text>
                            <BadgeIcon />

                            <View
                              style={{
                                borderWidth: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                borderRadius: 20,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderColor: "#6363631A",
                              }}
                            >
                              <Ionicons
                                name="star"
                                size={12}
                                style={{ color: "#F97216" }}
                              />
                              <Text style={{ fontSize: 12 }}>{rider?.averageRating}</Text>
                            </View>
                          </View>

                          <Text style={{ fontSize: 12, color: "#636363" }}>
                            {rider?.isUnderOrganization ? rider?.companyName : "YPMC Logistics"}
                          </Text>
                        </View>
                      </View>

                      {order?.status !== "DELIVERED" && order?.status !== "PENDING" && <CallAndChat phoneNumber={rider?.phoneNumber} id={order?.id} />}
                    </View>

                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                    >
                      <Ionicons
                        name="location"
                        size={18}
                        style={{ color: "#636363" }}
                      />

                      <Text style={{ fontSize: 12 }}>{order?.distanceInKilometers?.toFixed(1)} km, {convertMinutes(order?.estimatedDuration)} away</Text>
                    </View>

                    <View>
                      <Button
                        size="sm"
                        style={{ flex: 1, width: "50%" }}
                        onPress={() => riderInfoSheetRef.current?.present()}
                      >
                        <ButtonText>Rider Info</ButtonText>
                        <Ionicons
                          name="arrow-forward"
                          size={24}
                          style={{ color: "#fff" }}
                        />
                      </Button>
                    </View>
                  </View>}

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
                      {order?.distanceInKilometers?.toFixed(1) ?? "N/A"} km
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
                      {formatMoney(order?.actualPrice || order?.actualPriceInNaira || 0)}
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
                      {formatMoney(Number(order?.actualPrice || order?.actualPriceInNaira || 0))}
                    </Text>
                  </View>

                  {/* <Pressable
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 20 }}
                    onPress={() => { }}
                  >
                    <Text
                      style={{
                        color: "#F97216",
                        fontFamily: "interSemiBold",
                        fontSize: 14,

                      }}
                    >
                      Save Quote
                    </Text>
                    <DownloadIcon />
                  </Pressable> */}
                </View>

                {/* <Button style={{ marginVertical: 20, flex: 1 }} onPress={handlePayment}>
                 <ButtonText>Proceed to Payment</ButtonText>
                 <Ionicons
                   name="arrow-forward"
                   size={24}
                   style={{ color: "#fff" }}
                 />
               </Button> */}
              </>}

            {order?.status === "DELIVERED" && !order?.isRated && <Pressable style={{ alignItems: 'center', marginBottom: 40 }} onPress={() => setRatingModal(true)}>
              <Text style={{ color: colors.primary, textDecorationLine: 'underline', fontSize: s(14) }}>Rate your experience with Rider</Text>
            </Pressable>}

            {ratingModal &&
              <RatingModal
                ratingModal={ratingModal}
                setRatingModal={setRatingModal}
                id={id}
                rider={rider}
              />}

          </BottomSheetScrollView>


        </BottomSheet>

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


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: "center",
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
    top: -0,
    width: '100%',
    overflow: "hidden",
    height: 60
  },
  bannerText: {
    color: "#fff",
    fontFamily: "interMedium",
    fontSize: 14,
  },

  bottomShape: {
    position: "absolute",
    height: 40,
    width: "100%",
    backgroundColor: "white",
    bottom: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  container: {
    backgroundColor: "#F3F3F380",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6363631A",
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
