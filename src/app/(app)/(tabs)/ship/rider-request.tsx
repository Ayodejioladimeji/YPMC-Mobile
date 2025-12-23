import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, AppState, Dimensions, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Circle } from "react-native-maps";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rider } from "@/api/shipping";
import RiderInfo from "@/components/ship/rider-info";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { customMapStyle } from "@/constants/maps-theme";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import CustomMarker2 from "@/components/ship/CustomMarker2";
import CustomMarker from "@/components/ship/CustomMarker";
import RiderProgressBar from "@/components/ship/riderprogress-bar";
import CustomModal from "@/components/ui/modal";
import CancelRequestModal from "@/components/ship/cancel-request-modal";
import images from "@/assets/images";
import { BadgeIcon } from "@/assets/images/svgs";
import VehicleCard from "@/components/ship/vehicle-card";
import CallAndChat from "@/components/call-and-chat";
import { GetRequest } from "@/utils/requests";
import MapViewDirections from "react-native-maps-directions";
import RiderMarker from "@/components/ship/RiderMarker";
import TopNavigation from "@/components/TopNavigation";
import { ACTIONS } from "@/store/Actions";
import { formatMoney } from "@/utils/utils";
import UseWrapped from "@/components/wrapped";
import Call from "@/components/call";
import ProgressBar from "@/components/ship/progressbar";
import ModeOfPaymentSheet from "@/components/ship/mode-of-payment";



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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");



export default function RiderRequestScreen({ rider }: { rider: Rider }) {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const riderInfoSheetRef = useRef<BottomSheetModal>(null);
  const riderInfoSheetIndex = useSharedValue<number>(0);
  const riderInfoSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const mapRef = useRef<MapView | null>(null);
  const [pickupLocation, setPickupLocation] = useState<any>(null)
  const [dropoffLocation, setDropoffLocation] = useState<any>(null)
  const { state, dispatch } = useContext(DataContext)
  const { orderData, proposedRider, shipping, rejected: reject, shippingType, shippingId, accepted } = state
  const [fetchingRider, setFetchingRider] = useState(true)
  const [riderLocation, setRiderLocation] = useState(null)
  const [rejected, setRejected] = useState(false)
  const { handleLayout } = UseWrapped()
  const appState = useRef(AppState.currentState);

  // mode of payment stuff
  const modeofPaymentSheetRef = useRef<BottomSheetModal>(null);
  const modeofPaymentSheetIndex = useSharedValue<number>(0);
  const modeofPaymentSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);


  const handleRiderInfoBottomSheet = () => {
    riderInfoSheetRef.current?.present();
  };


  const proposed = useCallback(async () => {
    let res;

   
    if (shippingType === "basic") {
      res = await GetRequest(`/shipping/customer/${shipping?.id}`, state?.token)

      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.SHIPPING, payload: res?.data?.data })
        dispatch({ type: ACTIONS.PROPOSED_RIDER, payload: res?.data?.data?.proposedRider })
        if (res?.data?.data?.riderAssignmentStatus === "ACCEPTED") {
          dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback })
          setFetchingRider(false)
        }

        if (res?.data?.data?.riderAssignmentStatus === "REJECTED") {
          setRejected(true)
        }
      }
    }
    else {

      res = await GetRequest(`/shipping/customer/multiple-shipping/${shipping?.id}`, state?.token)
      
      
      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.PROPOSED_RIDER, payload: res?.data?.data?.multiShipping?.shippings[0]?.proposedRider })
        dispatch({ type: ACTIONS.SHIPPING, payload: res?.data?.data?.multiShipping?.shippings[0] })
        if (res?.data?.data?.multiShipping?.shippings[0]?.riderAssignmentStatus === "ACCEPTED") {
          dispatch({type:ACTIONS.CALLBACK, payload: !state?.callback})
          setFetchingRider(false)

        }

        if (res?.data?.data?.multiShipping?.shippings[0]?.riderAssignmentStatus === "REJECTED") {
          setRejected(true)
        }
      }
    }

  }, [state?.token])

  useEffect(() => {
    if (state?.token && shipping?.id) {
      proposed()
    }
  }, [accepted, proposed, reject, state?.token, shipping?.id, state?.generalCallback])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        proposed()
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const scrollViewContentContainer = useMemo(
    () => [
      styles.scrollViewContentContainer,
      { paddingBottom: bottomSafeArea },
    ],
    [bottomSafeArea],
  );


  // calculate coordinates
  useEffect(() => {
    // Calculate the center point between pickup and dropoff locations
    const latitude = (orderData?.pickupLatitude + orderData?.dropoffLatitude) / 2;
    const longitude = (orderData?.pickupLongitude + orderData?.dropoffLongitude) / 2;

    // Calculate the latitude and longitude deltas to cover both points
    const latitudeDelta =
      Math.abs(orderData?.pickupLatitude - orderData?.dropoffLatitude) * 1.5;
    const longitudeDelta =
      Math.abs(orderData?.pickupLongitude - orderData?.dropoffLongitude) * 1.5;

    // Set map region centered between pickup and dropoff locations
    setMapRegion({
      latitude: latitude || 0,
      longitude: longitude || 0,
      latitudeDelta: latitudeDelta || 0.0122,
      longitudeDelta: longitudeDelta || 0.0121,
    });

  }, [orderData]);

  useEffect(() => {
    if (mapRegion) {
      mapRef.current?.animateToRegion(mapRegion);
    }
  }, [mapRegion]);

  useEffect(() => {
    const getLocations = async () => {

      const pickupCoord = { latitude: orderData?.pickupLatitude || 0, longitude: orderData?.pickupLongitude || 0 };
      const dropoffCoord = { latitude: orderData?.dropoffLatitude || 0, longitude: orderData?.dropoffLongitude || 0 };

      setPickupLocation(pickupCoord);
      setDropoffLocation(dropoffCoord);

      // Calculate the rider's location between the pickup and dropoff coordinates
      const interpolateCoord = (startCoord, endCoord, ratio) => {
        return {
          latitude: startCoord.latitude + (endCoord.latitude - startCoord.latitude) * ratio,
          longitude: startCoord.longitude + (endCoord.longitude - startCoord.longitude) * ratio,
        };
      };


      const ratio = 0.5;
      const riderCoord = interpolateCoord(pickupCoord, dropoffCoord, ratio);
      setRiderLocation(riderCoord);

    };

    getLocations();
  }, []);

  const circleRadius = useRef(new Animated.Value(100)).current;
  const [radius, setRadius] = useState(300);

  useEffect(() => {
    if (fetchingRider) {
      const radiusSequence = [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2200];

      Animated.loop(
        Animated.sequence(
          radiusSequence.map(value =>
            Animated.timing(circleRadius, {
              toValue: value,
              duration: 100,
              useNativeDriver: false,
            })
          )
        )
      ).start();

      // Listen for value changes to update state
      const listener = circleRadius.addListener(({ value }) => {
        setRadius(value);
      });

      return () => circleRadius.removeListener(listener);
    } else {

      circleRadius.setValue(0);
      setRadius(0);
    }
  }, [fetchingRider]);


  const SNAP_POINTS = fetchingRider ? [SCREEN_HEIGHT * 0.2] : [SCREEN_HEIGHT * 0.45];

  // 

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <TopNavigation title="Rider Request" />

      <View style={{ flex: 1 }}>
        {fetchingRider &&
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
            userInterfaceStyle="light"
          >

            <CustomMarker2 coordinate={pickupLocation} />
            <CustomMarker coordinate={dropoffLocation} />

            {/* <Circle
              center={pickupLocation}
              radius={radius}
              fillColor="rgba(0, 122, 255, 0.2)"
              strokeColor="rgba(0, 122, 255, 0.5)"
              strokeWidth={1}
            /> */}

          </MapView>
        }

        {!fetchingRider && pickupLocation && dropoffLocation &&
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
            userInterfaceStyle="light"
          >

            <CustomMarker2 coordinate={pickupLocation} />
            <CustomMarker coordinate={dropoffLocation} />
            {/* <RiderMarker coordinate={riderLocation} /> */}

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
              //     latitude: riderLocation.latitude || 0,
              //     longitude: riderLocation.longitude || 0,
              //   },
              // ]}
              precision="high"
              optimizeWaypoints={true}
              apikey={process.env.EXPO_PUBLIC_API_KEY}
              strokeWidth={3}
              strokeColor="#F97216"
              // lineDashPattern={[7]}
              onError={errorMessage => {
              }}
            />
          </MapView>
        }

        <BottomSheet
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          index={0}
          keyboardBehavior="extend"
          key="FindRider"
          ref={bottomSheetRef}
          snapPoints={SNAP_POINTS}
          style={styles.shadow}
        >
          <BottomSheetScrollView
            contentContainerStyle={scrollViewContentContainer}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="never"
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >

            {fetchingRider ?
              <>
                {orderData?.scheduleType === "now" ?
                  <RiderProgressBar text="Searching for available Riders" />
                  :
                  <RiderProgressBar text="Processing your Order" />}
              </>
              :
              <>
                <View
                  style={{
                    marginTop: spacing.md,
                    backgroundColor: "#F3F3F380",
                    paddingHorizontal: 10,
                    paddingVertical: spacing.md,
                    borderRadius: spacing.md,
                    borderWidth: 1,
                    borderColor: "#6363631A",
                    rowGap: spacing.md,
                  }}
                >
                  <Text
                    style={{
                      color: "#636363",
                      fontSize: 14,
                      fontFamily: "interSemiBold",
                    }}
                  >
                    Rider
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                    onLayout={handleLayout}
                  >
                    <View style={{ flexDirection: 'row', }}>
                      {proposedRider?.metadata?.profileImageUrl ?
                        <Image source={{ uri: proposedRider?.metadata?.profileImageUrl }} alt="" style={{ height: 40, width: 40, borderRadius: 50 }} />
                        :
                        <Image source={images?.user} alt="" style={{ height: 40, width: 40 }} />
                      }

                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Text style={{ fontSize: 14, fontFamily: "interSemiBold" }}>
                            {proposedRider?.firstName} {proposedRider?.lastName}
                          </Text>

                          <BadgeIcon />

                          <View
                            style={{
                              borderWidth: 1,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: spacing.xxs,
                              borderRadius: spacing.md,
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
                            <Text style={{ fontSize: 12 }}>{proposedRider?.averageRating}</Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 12, color: "#636363" }}>
                          {proposedRider?.partner?.companyName || "YPMC Logistics"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ fontSize: 16, fontFamily: "interSemiBold" }}>
                    NGN {formatMoney(shipping?.actualPriceInNaira || shipping?.totalActualPriceInNaira || 0)}
                  </Text>

                  <View
                    style={{ flexDirection: "row", alignItems: 'center', gap: 15 }}
                  >
                    <Call phoneNumber={proposedRider?.phoneNumber} id={proposedRider?.id} />

                    <Button
                      size="sm"
                      style={{ width: 150 }}
                      onPress={handleRiderInfoBottomSheet}
                    >
                      <ButtonText>Rider Info</ButtonText>
                      <Ionicons
                        name="arrow-forward"
                        size={24}
                        style={{ color: "#fff" }}
                      />
                    </Button>
                  </View>
                </View>

                <View style={styles.footerContainer}>
                  <Button
                    size="sm"
                    onPress={() => modeofPaymentSheetRef.current?.present()}
                  >
                    <ButtonText>Proceed to payment</ButtonText>
                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      style={{ color: "#fff" }}
                    />
                  </Button>

                  <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/home")}>
                    <Text style={{ color: colors.primary, textAlign: 'center', fontFamily: 'interSemiBold', textDecorationLine: "underline" }}>Go Home</Text>
                  </TouchableOpacity>
                </View>
              </>
            }

            <RiderInfo
              ref={riderInfoSheetRef}
              index={riderInfoSheetIndex}
              position={riderInfoSheetPosition}
            />

            <ModeOfPaymentSheet
              ref={modeofPaymentSheetRef}
              index={modeofPaymentSheetIndex}
              position={modeofPaymentSheetPosition}
            />


            {/* when rider rejects order */}
            <CustomModal
              visible={rejected || reject}
            // onClose={findNewRider}
            >
              <View style={{ paddingHorizontal: 10 }}>
                <Image source={require("@/assets/images/rider-not-available.svg")} alt="" style={{ height: 100, width: '100%' }} />

                <Text style={styles.modalTitle}>Rider Not Available</Text>
                <Text style={styles.modalDescription}>
                  The selected rider is busy at the moment, Please assign to a new rider.
                </Text>

                <View style={{ marginTop: 30 }}>
                  <Button size="sm">
                    <ButtonText>Try Again</ButtonText>
                  </Button>
                </View>
              </View>
            </CustomModal>
          </BottomSheetScrollView>

        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingHorizontal: spacing.base,
  },
  input: {
    height: 40,
    margin: spacing.sm,
    borderWidth: 1,
  },
  switch: {
    width: spacing.huge,
    height: 30,
  },
  track: {
    flex: 1,
    borderRadius: spacing.base,
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    margin: 2,
  },
  radioGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  radioGroupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  datePlaceholder: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
    marginTop: spacing.huge,
    marginBottom: 20,
    backgroundColor: "#fff",
    gap: 20
  },
  iconContainer: {
    backgroundColor: "rgba(249, 114, 22, 0.1)",
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: colors.primary,
  },
  container: {
    paddingTop: spacing.base,
  },
  eventContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  eventMarker: {
    alignItems: "center",
    marginRight: spacing.base,
  },
  dot: {
    width: spacing.base,
    height: spacing.base,
    borderRadius: spacing.xs,
    backgroundColor: "#4CAF50",
  },
  line: {
    width: 2,
    height: 48,
    backgroundColor: "#4CAF50",
  },
  eventDetails: {
    flex: 1,
  },
  address: {
    fontSize: 14,
    fontFamily: "interSemiBold",
    color: "#000000",
    marginBottom: spacing.xxs,
  },
  time: {
    fontSize: 14,
    color: "#636363",
  },
  carouselContainer: {
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  listContainer: {
    padding: spacing.sm,
  },

  modalContent: {
    // padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "interSemiBold",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  modalDescription: {
    marginTop: 20,
    color: "#636363",
    fontSize: 14,
    fontFamily: "interRegular",
    textAlign: "center",
  },
});
