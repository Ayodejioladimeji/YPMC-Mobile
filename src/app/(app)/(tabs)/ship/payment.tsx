import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ModeOfPaymentSheet from "@/components/ship/mode-of-payment";
import RiderInfo from "@/components/ship/rider-info";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import * as Location from "expo-location";
import { BadgeIcon, DownloadIcon, MarkerIcon } from "@/assets/images/svgs";
import images from "@/assets/images";
import AddressList from "@/components/ship/addresslist";
import CustomModal from "@/components/ui/modal";
import CancelRequestModal from "@/components/ship/cancel-request-modal";
import CallAndChat from "@/components/call-and-chat";
import ShipmentIcon from "@/components/shipment-icon";
import { formatMoney } from "@/utils/utils";
import { s } from "react-native-size-matters";
import Call from "@/components/call";
import { PostRequest } from "@/utils/requests";
import { toast } from "sonner-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SNAP_POINTS = ["90%", "90%", "90%"];

export default function PaymentScreen() {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { shippingId } = useLocalSearchParams();
  const [isriderInfoBottomSheetOpen, setIsriderInfoBottomSheetOpen] =
    useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const riderInfoSheetRef = useRef<BottomSheetModal>(null);
  const riderInfoSheetIndex = useSharedValue<number>(0);
  const riderInfoSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const mapRef = useRef<MapView | null>(null);

  // mode of payment stuff
  const modeofPaymentSheetRef = useRef<BottomSheetModal>(null);
  const modeofPaymentSheetIndex = useSharedValue<number>(0);
  const modeofPaymentSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const { state } = useContext(DataContext)
  const { orderData, proposedRider, shipping, shippingType } = state
  const [saveLoading, setSaveLoading] = useState(false)


  const handleRiderInfoBottomSheet = () => {
    riderInfoSheetRef.current?.present();
    setIsriderInfoBottomSheetOpen(true);
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


  const saveQuote = async () => {
    setSaveLoading(true)

    const res = await PostRequest("/shipping/generate-quote-customer", orderData, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      toast.success(res?.data?.message)
    }
    setSaveLoading(false)

  }


  // 

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        index={1}
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
          <View
            style={{
              marginTop: spacing.base,
              backgroundColor: "#F3F3F380",
              paddingHorizontal: 10,
              paddingVertical: spacing.md,
              borderRadius: spacing.md,
              borderWidth: 1,
              borderColor: "#6363631A",
              rowGap: spacing.sm,
            }}
          >
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Enter promo code (Optional)"
                placeholderTextColor="#63636380"
                style={styles.searchInput}
              />

              <Button
                size="sm"
                style={{ width: 80, height: 40, borderRadius: 10 }}
              >
                <ButtonText>Apply</ButtonText>
              </Button>
            </View>

            <View style={styles.textStyle}>
              <View>
                <Text style={styles.text}>Distance</Text>
              </View>
              <View style={{ gap: 5 }}>
                <View>
                  {shippingType === "basic" ? <Text style={{ fontSize: 14, fontFamily: "interMedium" }}>{shipping?.distanceInKilometers?.toFixed(1)}km</Text> :
                    <Text style={{ fontSize: 14, fontFamily: "interMedium" }}>{shipping?.shippings[0]?.distanceInKilometers?.toFixed(1)}km</Text>}
                </View>
              </View>
            </View>

            <View style={styles.textStyle}>
              <View>
                <Text style={styles.text}>Fare Estimate</Text>
              </View>
              <View style={{ gap: 5 }}>
                <View>
                  <Text style={{ fontSize: 14, fontFamily: "interMedium" }}>
                    N{formatMoney(shipping?.actualPriceInNaira || shipping?.totalActualPriceInNaira || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.textStyle}>
              <View>
                <Text style={styles.text}>Service fee</Text>
              </View>
              <View style={{ gap: 5 }}>
                <View>
                  <Text style={{ fontSize: 14, fontFamily: "interMedium" }}>
                    N0
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.textStyle}>
              <View>
                <Text style={styles.text}>Total</Text>
              </View>
              <View style={{ gap: 5 }}>
                <View>
                  <Text style={{ fontSize: 14, fontFamily: "interBold" }}>
                    N{formatMoney(shipping?.actualPriceInNaira || shipping?.totalActualPriceInNaira || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.7}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: spacing.xxs,
                alignItems: 'center'
              }}
              onPress={saveQuote}
            >
              <Text style={{ color: colors.primary }}>Save Quote</Text>
              {saveLoading ? <ActivityIndicator /> : <DownloadIcon />}
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 20,
              backgroundColor: "#F3F3F380",
              paddingHorizontal: 10,
              paddingVertical: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#6363631A",
              rowGap: 20,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#636363",
                  fontSize: 14,
                  fontFamily: "interSemiBold",
                }}
              >
                Rider
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >

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
                      <Text style={{ fontSize: 12 }}>{proposedRider?.averageRating}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, color: "#636363" }}>
                    {proposedRider?.firstName} {proposedRider?.lastName}
                  </Text>
                </View>
              </View>

              <Call phoneNumber={proposedRider?.user?.phoneNumber} />
            </View>

            <View>
              <View style={styles.row}>
                <Ionicons name="location" size={18} color="black" />
                {shippingType === "basic" ? <Text style={styles.distanceText}>{shipping?.distanceInKilometers?.toFixed(1)}km</Text> :
                  <Text style={styles.distanceText}>{shipping?.shippings[0]?.distanceInKilometers?.toFixed(1)}km</Text>}
                {/* <Text style={styles.timeText}>2 mins away</Text> */}
              </View>
            </View>


            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 16, fontFamily: "interSemiBold" }}>
                N{formatMoney(shipping?.actualPriceInNaira || shipping?.totalActualPriceInNaira || 0)}
              </Text>
            </View>

            <View
              style={{ display: "flex", flexDirection: "row", gap: spacing.xs }}
            >
              <Button
                size="sm"
                style={{ flex: 1, width: "50%" }}
                onPress={handleRiderInfoBottomSheet}
              >
                <ButtonText>Rider Info</ButtonText>
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  style={{ color: "#fff" }}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                style={{ flex: 1, width: "50%" }}
                onPress={() => setCancelModal(true)}
              >
                <ButtonText style={{ color: colors.primary }}>
                  Cancel
                </ButtonText>
              </Button>
            </View>


          </View>

          <View style={styles.footerContainer}>
            {shippingType === "basic" ?
              <View
                style={{
                  backgroundColor: "#F3F3F380",
                  paddingHorizontal: 10,
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
                    style={{ flexDirection: "row", gap: 8 }}
                  >
                    <ShipmentIcon status="PENDING" />

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: s(14), fontFamily: "inter" }}>
                        {shipping?.packageDetails?.name}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 4,
                        }}
                      >
                        <Ionicons name="bicycle-outline" size={16} />
                        <Text style={{ fontSize: 12, fontFamily: "interMedium" }}>
                          Pending
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <AddressList data={shipping} />
              </View>

              :

              <>
                {shipping?.shippings?.map((item, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "#F3F3F380",
                        paddingHorizontal: 10,
                        paddingVertical: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#6363631A",
                        marginBottom: 20
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
                          style={{ flexDirection: "row", gap: 8 }}
                        >
                          <ShipmentIcon status="PENDING" />

                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: s(14), fontFamily: "inter" }}>
                              {item?.packageDetails?.name}
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 4,
                              }}
                            >
                              <Ionicons name="bicycle-outline" size={16} />
                              <Text style={{ fontSize: 12, fontFamily: "interMedium" }}>
                                Pending
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <AddressList data={item} />
                    </View>
                  )
                })}
              </>
            }

            <Button
              onPress={() => modeofPaymentSheetRef.current?.present()}
              style={{ marginTop: spacing.md, marginBottom: 20 }}
              size="sm"
            >
              <ButtonText>Proceed to Payment</ButtonText>
              <Ionicons
                name="arrow-forward"
                size={24}
                style={{ color: "#fff" }}
              />
            </Button>
          </View>

          <CustomModal
            visible={cancelModal}
            onClose={() => setCancelModal(false)}
          >
            <CancelRequestModal setCancelModal={setCancelModal} />
          </CustomModal>

          <RiderInfo
            ref={riderInfoSheetRef}
            index={riderInfoSheetIndex}
            position={riderInfoSheetPosition}
          />
        </BottomSheetScrollView>
      </BottomSheet>


      <ModeOfPaymentSheet
        ref={modeofPaymentSheetRef}
        index={modeofPaymentSheetIndex}
        position={modeofPaymentSheetPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    // position: "relative",
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
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
    marginTop: spacing.md,
    // marginHorizontal: 12,
    backgroundColor: "#fff",
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

  eventDetails: {
    flex: 1,
  },
  address: {
    fontSize: 14,
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
  listContainer: {
    padding: 10,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 20,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,

  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10
  },
  searchIcon: {
    backgroundColor: "#F97216",
    borderRadius: 9999,
    padding: 5,
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

  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  locationIcon: {
    color: "#B2B2B2",
    marginHorizontal: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    columnGap: 5
  },
});
