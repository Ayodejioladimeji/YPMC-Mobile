import { forwardRef, useContext, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import { formatMoney } from "@/utils/utils";
import ShipmentIcon from "../shipment-icon";
import AddressList from "./addresslist";
import { s } from "react-native-size-matters";
import { PostRequest } from "@/utils/requests";
import { ACTIONS } from "@/store/Actions";


type SummarySheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onSubmit: () => void;
};

const SNAP_POINTS = ["85%"];

const SummarySheet = forwardRef<BottomSheetModal, SummarySheetProps>(
  ({ index, position }, ref) => {
    const router = useRouter();
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const { quoteData, orderData } = state
    const [saveLoading, setSaveLoading] = useState(false)
    const [loading, setLoading] = useState(false)



    const scrollViewContentContainer = useMemo(
      () => [
        styles.scrollViewContentContainer,
        { paddingBottom: bottomSafeArea + 86 },
      ],
      [bottomSafeArea],
    );

    const saveQuote = async () => {
      setSaveLoading(true)

      const res = await PostRequest("/shipping/generate-quote-customer", orderData, state?.token)
      if (res?.status === 200 || res?.status === 201) {
        toast.success(res?.data?.message)
      }
      setSaveLoading(false)

    }


    const handleChange = () => {
      router.push("/(app)/quote/package-info")
      if (ref && "current" in ref && ref.current) ref.current.dismiss()
    }

    const findRider = () => {
      router.push("/(app)/(tabs)/ship/find-rider");
      if (ref && "current" in ref && ref.current) ref.current.dismiss()

    }

    const createOrder = async () => {
      setLoading(true)

      const res = await PostRequest("/shipping", orderData, state?.token)
      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.SHIPPING_ID, payload: res?.data?.data?.id })

        router.push("/(app)/(tabs)/ship/find-rider");
        if (ref && "current" in ref && ref.current) ref.current.dismiss();
      }

      setLoading(false)
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
              Quote Summary
            </Text>

            <Text style={{ fontSize: 12, marginTop: spacing.xs }}>
              Here’s a summary of your delivery charges
            </Text>
          </View>

          <View style={{ height: 2, backgroundColor: '#F3F3F3', marginBottom: 30 }}>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5 }}>
            <Text style={{ fontSize: s(12), color: colors.mutedForeground }}>Shipment Summary</Text>
            <Pressable onPress={handleChange}>
              <Text style={{ fontSize: s(12), color: colors.primary }}>Change</Text>
            </Pressable>
          </View>

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
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ShipmentIcon status="PENDING" />

                <View>
                  <Text style={{ fontSize: s(13), fontFamily: "interBold" }}>
                    {quoteData?.packageDetails?.name}
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

            <AddressList data={quoteData} />
          </View>

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


            <View style={styles.textStyle}>
              <View>
                <Text style={styles.text}>Distance</Text>
              </View>
              <View style={{ gap: 5 }}>
                <View>
                  <Text style={{ fontSize: 14, fontFamily: "interMedium" }}>
                    {quoteData?.distance} km
                  </Text>
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
                    N{formatMoney(Number(quoteData?.estimatedPrice))}
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
                    N{formatMoney(Number(quoteData?.estimatedPrice))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'space-between',
            gap:50
          }}>
            <Button
              onPress={saveQuote}
              style={{ flex:1, marginTop: spacing.md, marginBottom: 10 }}
              size="sm"
              disabled={saveLoading}
            >
              <ButtonText>Save Quote</ButtonText>
              {saveLoading ? <ActivityIndicator size="small" color={colors.white} /> :
                <MaterialIcons name="download" size={20} color="#fff" />}
            </Button>

            <Button
              onPress={createOrder}
              style={{ flex:1, alignItems: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }}
              size="sm"
              disabled={saveLoading}
            >
              <ButtonText style={{ color: colors.primary }}>
                Share quote
              </ButtonText>
            </Button>
          </View>

          <Button
            onPress={createOrder}
            style={{ alignItems:'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }}
            size="sm"
            disabled={saveLoading}
          >
            <ButtonText style={{ color: colors.primary }}>
              {loading ? <ActivityIndicator size="small" color={colors.primary} /> : "Find a Rider" }
            </ButtonText>
          </Button>

          <Pressable onPress={() => router.replace("/(app)/(tabs)/home")} style={{alignItems:'center', marginTop:30}}>
            <Text style={{color:colors.primary, textDecorationLine:"underline"}}>Go Home</Text>
          </Pressable>

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
    paddingHorizontal: 16
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
