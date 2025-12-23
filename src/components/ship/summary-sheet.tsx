import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors, spacing } from "@/theme";
import moment from "moment";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { calculateDistanceAndTime } from "@/utils/distance-and-time";


type SummarySheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onSubmit: () => void;
  form:any
};

const SNAP_POINTS = ["100%"];

const SummarySheet = forwardRef<BottomSheetModal, SummarySheetProps>(
  ({ index, position, onSubmit, form }, ref) => {
    const router = useRouter();
    const type = useShippingStore((state) => state.type);
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const { orderData } = state
    const [loading, setLoading] = useState(false)
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [distanceLoading, setDistanceLoading] = useState(true)

    const scrollViewContentContainer = useMemo(
      () => [
        styles.scrollViewContentContainer,
        { paddingBottom: bottomSafeArea + 86 },
      ],
      [bottomSafeArea],
    );


    // create single order
    const createSingleOrder = async () => {
      setLoading(true)

      const payload = {
        ...orderData,
        scheduledPickupTime: orderData?.pickupTime
      }

      // console.log(payload)

      const res = await PostRequest("/shipping", payload, state?.token)
      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.SHIPPING_ID, payload: res?.data?.data?.id })
        dispatch({ type: ACTIONS.SHIPPING, payload: res?.data?.data })

        router.push("/(app)/(tabs)/ship/find-rider");
        if (ref && "current" in ref && ref.current) ref.current.dismiss();
      }

      setLoading(false)
    }

    function findRider() {

      if (type === "basic") {
        createSingleOrder();
      }
    }

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



    function addShipment() {
      // reset initial states
      const initialStates = {
        packageName: "",
        isFragile: false,
        packageSize: "MEDIUM",
        isSecurityShipping: false,
        dropoffStreet: "",
        dropoffArea: "",
        dropoffState: "",
        dropoffLongitude: "",
        dropoffLatitude: "",
        receiverName: "",
        receiverPhoneNumber: "",
        packageNotes: "",
      }
      dispatch({
        type: ACTIONS.ORDER_DATA, payload: {
          ...state,
          ...initialStates,
        }})
      // dispatch({ type: ACTIONS.MULTIPLE_DATA, payload: form.getValues() })
      // form.reset();
      router.push("/(app)/(tabs)/ship/package-info");
      onSubmit()
      dispatch({ type: ACTIONS.MORE_ORDER, payload: true })
    }

    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        // enableDismissOnClose={false}
        enableDynamicSizing={false}
        // enablePanDownToClose={false}
        key="SummarySheet"
        name="SummarySheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={top}
        footerComponent={(props) => (
          <BottomSheetFooter {...props} bottomInset={0}>
            <View style={styles.footerContainer}>
              {type === "multiple" && (
                <Button
                  onPress={addShipment}
                  style={{ borderColor: colors.primary, marginBottom: 15 }}
                  variant="outline"
                >
                  <ButtonText style={{ color: colors.primary }}>
                    Add More Shipment
                  </ButtonText>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </Button>
              )}

              {type === "multiple" ?
                <Button
                  onPress={() => router.push("/(app)/(tabs)/ship/multiple-summary")}
                  disabled={loading}
                >
                  <ButtonText>View Shipments</ButtonText>
                </Button>
                :
                <Button
                  onPress={findRider}
                  disabled={loading}
                >
                  <ButtonText>Find a Rider</ButtonText>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="bicycle-outline" size={24} color="white" />
                  )}
                </Button>
              }
            </View>
          </BottomSheetFooter>
        )}
      >
        <BottomSheetScrollView
          contentContainerStyle={scrollViewContentContainer}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="never"
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              backgroundColor: "#fff",
              alignItems: "center",

            }}
          >
            <Text style={{ fontFamily: "interMedium", fontSize: 16 }}>
              Shipment Summary
            </Text>

            <Text style={{ fontSize: 12, marginTop: spacing.xs }}>
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

                <Pressable
                  onPress={() => {
                    router.push("/(app)/(tabs)/ship/package-info")
                    if (ref && "current" in ref && ref.current) ref.current.dismiss();
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "interSemiBold",
                      color: colors.primary,
                    }}
                  >
                    Change
                  </Text>
                </Pressable>
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

            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 20,
                backgroundColor: "#fff",
                rowGap: 10,
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: "interSemiBold" }}>
                Package Info
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ flex: 1 }}>Package name</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: "interSemiBold" }}>
                    {orderData?.packageName}
                  </Text>

                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Package Size</Text>
                <Text style={{ fontFamily: "interSemiBold", fontSize: 12 }}>
                  {orderData?.packageSize}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Package Condition</Text>
                <Text style={{ fontFamily: "interSemiBold" }}>
                  {orderData?.isFragile ? "Fragile" : "Not fragile"}
                </Text>
              </View>
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
            </View>
          </View>

        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default SummarySheet;

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
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
    marginBottom: 20
  },
});
