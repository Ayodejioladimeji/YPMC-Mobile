import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors } from "@/theme";
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import AddressList from "@/components/ship/addresslist";
import { ACTIONS } from "@/store/Actions";
import { BottomSheetModal, SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useSharedValue } from "react-native-reanimated";
import { PostRequest } from "@/utils/requests";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { s } from "react-native-size-matters";
import TopNavigation from "@/components/TopNavigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";


export default function MultipleSummary() {
  const { state, dispatch } = useContext(DataContext)
  const { multipleData, orderData, type } = state
  const router = useRouter()
  const [saveLoading, setSaveLoading] = useState(false)
  useEffect(() => {
    dispatch({ type: ACTIONS.MULTIPLE_DATA, payload: orderData });
  }, []);


  // view details
  const viewDetails = (item: any) => {
    dispatch({ type: ACTIONS.ORDER_DATA, payload: item })
    router.push("/(app)/quote/summary")
  }

  // remove data
  const removeDataItem = (id: number) => {
    const newData = state?.multipleData?.filter((item: any) => item.id !== id)

    dispatch({
      type: ACTIONS.DELETE_DATA,
      payload: newData
    });
  };

  function addShipment() {
    // Fields to reset to initial values
    const fieldsToReset = {
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
      id: ""
    };

    const updatedPayload = {
      ...state.orderData,
      ...fieldsToReset
    };

    dispatch({
      type: ACTIONS.ORDER_DATA,
      payload: updatedPayload,
    });

    dispatch({ type: ACTIONS.MORE_ORDER, payload: true });
    router.push("/(app)/quote/package-locations");
  }

  const saveQuote = async () => {
    setSaveLoading(true)

    const payload = {
      shippings: multipleData
    }

    const res = await PostRequest("/shipping/generate-multi-quote-customer", payload, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      dispatch({ type: ACTIONS.MULTIPLE_QUOTE_DATA, payload: res?.data?.data })
      toast.success(res?.data?.message)
      router.push("/(app)/quote/multiple-share-quote")
    }
    setSaveLoading(false)

  }

  const handleRoute = () => {
    dispatch({ type: ACTIONS.QUOTE_DATA })
    dispatch({ type: ACTIONS.ORDER_DATA })
    dispatch({ type: ACTIONS.MULTIPLE_QUOTE_DATA })
    dispatch({ type: ACTIONS.CLEAR_MULTIPLE_DATA })
    router.replace("/(app)/(tabs)/home")
  }

  //

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <TopNavigation title="Multiple Quote Summary" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 20,
            paddingTop: 20,
            gap: 20,
            paddingBottom: 200
          }}
        >
          {multipleData?.map((item: any, index: number) => {

            return (
              <View style={styles.container} key={index}>
                <View style={styles.spaceBetween}>
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="cube-outline" size={24} style={styles.icon} />
                    </View>

                    <View>
                      <Text style={{ fontSize: s(13), fontFamily: "interBold" }}>
                        {item.packageName}
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

                <View style={[{ gap: 15, marginTop: 16 }, styles.spaceBetween]}>
                  <Button size="sm" style={{ gap: 5, flex: 1, borderRadius: 25, height: 50, paddingHorizontal: 5 }} onPress={() => viewDetails(item)}>
                    <ButtonText>Details</ButtonText>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                  </Button>

                  <Button size="sm" variant="outline" style={{ gap: 5, flex: 1, borderRadius: 25, height: 50, paddingHorizontal: 5 }} onPress={() => removeDataItem(item.id)}>
                    <ButtonText>Remove</ButtonText>
                    <Ionicons name="trash-outline" size={18} color="red" />
                  </Button>
                </View>
              </View>
            );
          })}

        </View>

        {multipleData?.length === 0 &&
          <View>
            <Image
              source={require("@/assets/images/logistics-bus.png")}
              style={{
                width: 160,
                height: 160,
                alignSelf: "center",
              }}
            />

            <Text style={{ textAlign: "center", fontSize: s(14), color: "#636363" }}>
              All quotes removed
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(app)/quote/package-locations")}
              style={{ width: 200, height: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', margin: 'auto', marginTop: 10, borderRadius: 25 }}>
              <Text style={{ color: 'white' }}>Go Back</Text>
            </TouchableOpacity>
          </View>}
      </ScrollView>

      {multipleData?.length !== 0 &&
        <View style={styles.footerContainer}>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 50 }}>
            <Button
              onPress={addShipment}
              style={{ flex: 1, borderColor: colors.primary, paddingHorizontal: 20, borderRadius: 40 }}
              variant="outline"
            >
              <ButtonText style={{ color: colors.primary }}>
                Add More
              </ButtonText>
              <Ionicons name="add" size={24} color={colors.primary} />
            </Button>

            <Button
              onPress={saveQuote}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderRadius: 40 }}
            >
              <ButtonText>
                Save Quote
              </ButtonText>
              {saveLoading &&
                <ActivityIndicator size="small" color="white" />}
            </Button>
          </View>

          <Pressable onPress={handleRoute} style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ color: colors.primary, textDecorationLine: "underline" }}>Go Home</Text>
          </Pressable>
        </View>}
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
    flex: 1
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
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: "white",
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%'
  },
});
