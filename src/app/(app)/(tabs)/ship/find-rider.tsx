import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Switch,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  SCREEN_HEIGHT,
} from "@gorhom/bottom-sheet";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle, AnimatedRegion } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getNearbyRiders, Rider } from "@/api/shipping";
import RiderCard from "@/components/ship/rider-card";
// import { addressIcon, deliveryIcon } from "@/assets/svgs/shipments";
import RiderSearchProgressBar from "@/components/ship/search-progress-bar";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { customMapStyle } from "@/constants/maps-theme";
import { colors, spacing } from "@/theme";
import AddressList from "@/components/ship/addresslist";
import { GetRequest, PatchRequest, PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import ProgressBar from "@/components/ship/progressbar";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import CustomMarker from "@/components/ship/CustomMarker";
import CustomMarker2 from "@/components/ship/CustomMarker2";
import RiderNavigation from "@/components/RiderNavigation";
import ShipmentIcon from "@/components/shipment-icon";
import { toast } from "sonner-native";
import { ACTIONS } from "@/store/Actions";
import { usePathname, useRouter } from "expo-router";
import RatingSheet from "@/components/ship/ratings";
import { useSharedValue } from "react-native-reanimated";
import CustomModal from "@/components/ui/modal";
import { Image } from "expo-image";



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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SNAP_POINTS = ["20%", "50%"];

export default function FindRiderScreen() {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const [isCarouselView, setIsCarouselView] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView | null>(null);
  const { state, dispatch } = useContext(DataContext)
  const { orderData, multipleData, shippingId, shippingType, pendingPayment, multiple } = state
  const [riders, setRiders] = useState<any>(null)
  const [startFetching, setStartFetching] = useState(true)
  const [pickupLocation, setPickupLocation] = useState<any>(null)
  const [dropoffLocation, setDropoffLocation] = useState<any>(null)
  const router = useRouter()
  const ratingsSheetRef = useRef<BottomSheetModal>(null);
  const ratingsSheetIndex = useSharedValue<number>(0);
  const ratingsSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const [riderId, setRiderId] = useState("")
  const [timeoutCallback, setTimeoutCallback] = useState(false)
  const [callback, setCallback] = useState(false)
  const pathname = usePathname()


  useEffect(() => {
    if (shippingId) {
      getRiders()
    }
  }, [shippingId, callback])

  // timeout
  useEffect(() => {
    if (riders?.length > 1 && shippingId && !timeoutCallback) {
      const interval = setInterval(() => {
        setTimeoutCallback(true);
      }, 480000);

      return () => clearInterval(interval);
    }
  }, [riders, shippingId, timeoutCallback]);

  // find riders
  const getRiders = async () => {
    setStartFetching(true)

    let res: any;

    if (state?.shippingType === "basic") {
      res = await GetRequest(`/shipping/nearby-riders?shippingId=${shippingId}&radius=1000`, state?.token)
    }
    else {
      res = await GetRequest(`/shipping/nearby-riders-multiple?multiShippingId=${shippingId}`, state?.token)
    }


    if (res?.status === 200 || res?.status === 201) {
      setRiders(res?.data?.data)

      if (res?.data?.data?.length === 0) {
        router.push("/(app)/(tabs)/ship/empty-riders")
      }
    }
    else {
      toast.error(res)
    }

    setTimeout(() => {
      setStartFetching(false)
    }, 7000)
  }


  const scrollViewContentContainer = useMemo(
    () => [
      styles.scrollViewContentContainer,
      { paddingBottom: bottomSafeArea },
    ],
    [bottomSafeArea],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={true}
        pressBehavior="none"
        appearsOnIndex={2}
        disappearsOnIndex={1}
      />
    ),
    [],
  );

  // open ratings sheet
  const openSheet = () => {
    ratingsSheetRef.current?.present();
  }

  const renderItem = useCallback(
    ({ item }: { item: Rider }) => {
      return (
        <RiderCard rider={item} carouselView={isCarouselView} openSheet={openSheet} setRiderId={setRiderId} />
      )
    },
    [isCarouselView],
  );

  const handleHeaderButtonPress = () => {
    setIsCarouselView((prev) => !prev);
  };


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

    const pickupCoord = { latitude: orderData?.pickupLatitude || 0, longitude: orderData?.pickupLongitude || 0 };
    const dropoffCoord = { latitude: orderData?.dropoffLatitude || 0, longitude: orderData?.dropoffLongitude || 0 };

    setPickupLocation(pickupCoord)
    setDropoffLocation(dropoffCoord)

  }, [orderData]);

  useEffect(() => {
    if (mapRegion) {
      mapRef.current?.animateToRegion(mapRegion);
    }
  }, [mapRegion]);


  const circleRadius = useRef(new Animated.Value(100)).current;
  const [radius, setRadius] = useState(300);

  useEffect(() => {
    if (startFetching) {
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
  }, [startFetching]);


  const findRider = () => {
    setTimeoutCallback(false);
    setCallback(!callback)
  };

  // shippings to render to user
  const shippings = pendingPayment ? multiple : multipleData

  // 


  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <RiderNavigation onPress={handleHeaderButtonPress} isCarouselView={isCarouselView} riders={riders} />

      <View style={{ flex: 1, position: 'relative' }}>

        {/* {pickupLocation && dropoffLocation && */}

          {/* <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
            userInterfaceStyle="light"
          >

            <CustomMarker2 coordinate={pickupLocation} />
            <CustomMarker coordinate={dropoffLocation} />


            {startFetching && (
              <Circle
                center={pickupLocation}
                radius={radius}
                fillColor="rgba(0, 122, 255, 0.2)"
                strokeColor="rgba(0, 122, 255, 0.5)"
                strokeWidth={1}
              />
            )}

            {pickupLocation && dropoffLocation &&
              <MapViewDirections
                origin={{
                  latitude: pickupLocation.latitude || 0,
                  longitude: pickupLocation.longitude || 0,
                }}
                destination={{
                  latitude: dropoffLocation.latitude || 0,
                  longitude: dropoffLocation.longitude || 0,
                }}
                precision="high"
                optimizeWaypoints={true}
                apikey={process.env.EXPO_PUBLIC_API_KEY}
                strokeWidth={3}
                strokeColor="#F97216"
                onError={errorMessage => {
                  
                }}
              />}
          </MapView> */}
        {/* } */}

        {startFetching ? (
          <ProgressBar />
        ) : (
          <View style={isCarouselView ? styles.carouselView : ""}>
            <FlatList
              data={riders} 
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal={isCarouselView}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              pagingEnabled={isCarouselView}
              snapToInterval={isCarouselView ? SCREEN_WIDTH * 0.75 + 20 : undefined}
              decelerationRate="fast"
              contentContainerStyle={
                isCarouselView ? styles.carouselContainer : styles.listContainer
              }
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )
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
          // bottomInset={bottomSafeArea}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetScrollView
            contentContainerStyle={scrollViewContentContainer}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="never"
            style={styles.scrollView}
          >

            {/* when rider timeouts*/}
            {/* {timeoutCallback && pathname === '/ship/find-rider' &&
           <CustomModal
              visible={timeoutCallback}
              onClose={findRider}
            >
              <View style={{ paddingHorizontal: 10 }}>
                <Image source={require("@/assets/images/rider-not-available.svg")} alt="" style={{ height: 100, width: '100%' }} />

                <Text style={styles.modalTitle}>Rider Timeout</Text>
                <Text style={styles.modalDescription}>
                  You spent too much time assiging to rider, New riders might be availabe. Please assign to a new rider
                </Text>

                <View style={{ marginTop: 30 }}>
                  <Button size="sm" onPress={findRider}>
                    <ButtonText>Find new riders</ButtonText>
                  </Button>
                </View>
              </View>
            </CustomModal>} */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 20
              }}
            >
              <Text style={{ fontFamily: 'interSemiBold' }}>Refresh riders</Text>

              <TouchableOpacity onPress={() => {
                if (bottomSheetRef.current) {
                  bottomSheetRef.current.snapToIndex(0);
                }
                getRiders()
              }}>
                <Ionicons
                  name="refresh"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.xs,
                marginBottom: spacing.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.base,
                borderRadius: spacing.md,
                gap: spacing.xs,
                backgroundColor: "rgba(249, 114, 22, 0.1)",
              }}
            >
              <Feather name="info" size={20} color={colors.primary} />
              <Text
                style={{ color: "rgba(99, 99, 99, 1)", fontSize: 12, flex: 1 }}
              >
                Feature automatically chooses the most suitable rider based on
                proximity, speed, and availability.
              </Text>
            </View> */}

            {shippingType === "basic" ?
              <View
                style={{
                  backgroundColor: "#F3F3F380",
                  paddingHorizontal: 16,
                  paddingVertical: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#6363631A",
                }}
              >
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
                    <ShipmentIcon status="PENDING" />

                    <View>
                      <Text style={{ fontSize: 16, fontFamily: "interBold" }}>
                        {orderData?.packageName}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 4,
                        }}
                      >
                        <Ionicons name="bicycle-outline" size={17} />
                        <Text style={{ fontSize: 12, fontFamily: "interMedium" }}>
                          Pending
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ fontSize: 16, fontFamily: "interMedium" }}></Text>
                </View>

                <AddressList data={orderData} />
              </View>
              :
              <>
                {shippings?.map((item, index) => {
                  return (
                    <View
                      style={{
                        backgroundColor: "#F3F3F380",
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#6363631A",
                        marginBottom: 20
                      }}
                      key={index}
                    >
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
                          <ShipmentIcon status="PENDING" />

                          <View>
                            <Text style={{ fontSize: 16, fontFamily: "interBold" }}>
                              {item?.packageName || item?.packageDetails?.name}
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 4,
                              }}
                            >
                              <Ionicons name="bicycle-outline" size={17} />
                              <Text style={{ fontSize: 12, fontFamily: "interMedium" }}>
                                Pending
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Text style={{ fontSize: 16, fontFamily: "interMedium" }}></Text>
                      </View>

                      <AddressList data={item} />
                    </View>
                  )
                })

                }
              </>
            }

            {riders?.length === 0 && <View style={styles.footerContainer}>
              <Button
                onPress={() => {
                  if (bottomSheetRef.current) {
                    bottomSheetRef.current.snapToIndex(0);
                  }
                  getRiders()
                }}
              >
                <ButtonText>Find a Rider</ButtonText>
                <Ionicons name="bicycle-outline" size={24} color="white" />
              </Button>
            </View>}



          </BottomSheetScrollView>
        </BottomSheet>

        <RatingSheet
          ref={ratingsSheetRef}
          index={ratingsSheetIndex}
          position={ratingsSheetPosition}
          onSubmit={() => ratingsSheetRef.current?.close()}
          riderId={riderId}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,

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
    marginTop: 20,
    // marginHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
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
    paddingTop: 16,
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
  eventDetails: {
    flex: 1,
  },
  address: {
    fontSize: 14,
    fontWeight: "semibold",
    fontFamily: "interSemiBold",
    color: "#000000",
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: "#636363",
  },
  carouselContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  carouselView: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 0,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 150
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "interSemiBold",
    textAlign: "center",
  },
  modalDescription: {
    marginTop: 20,
    color: "#636363",
    fontSize: 14,
    fontFamily: "interRegular",
    textAlign: "center",
  },
});
