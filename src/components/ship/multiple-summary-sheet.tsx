import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import moment from "moment";
import { DataContext } from "@/store/GlobalState";
import { calculateDistanceAndTime } from "@/utils/distance-and-time";


type SummarySheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onSubmit: () => void;
};

const SNAP_POINTS = ["100%"];

const MultipleSummarySheet = forwardRef<BottomSheetModal, SummarySheetProps>(
  ({ index, position, onSubmit }, ref) => {
    const router = useRouter();
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state } = useContext(DataContext)
    const { orderData } = state
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

    const handleHide = () => {
      if (ref && "current" in ref && ref.current) ref.current.dismiss();
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

    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDynamicSizing={false}
        key="SummarySheet"
        name="SummarySheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={top}
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
              // paddingBottom: 16,
            }}
          >
            <Text style={{ fontFamily: "interMedium", fontSize: 16 }}>
              Shipment Summary
            </Text>

            <Text style={{ fontSize: 12, marginTop: spacing.xs }}>
              Review your details before proceeding.
            </Text>

            <TouchableOpacity
              onPress={handleHide}
              style={{
                position: 'absolute',
                top: 10,
                right: 20
              }}>
              <FontAwesome5 name="times" size={20} color="black" />
            </TouchableOpacity>
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

                {/* <Pressable
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
                </Pressable> */}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  // alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Pickup address</Text>
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Delivery Address</Text>
                <Text style={{ maxWidth: "50%",  }}>
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
                <Text style={{}}>Package name</Text>
                <Text style={{ fontFamily: "interSemiBold" }}>
                  {orderData?.packageName}
                </Text>
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

export default MultipleSummarySheet;

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

});
