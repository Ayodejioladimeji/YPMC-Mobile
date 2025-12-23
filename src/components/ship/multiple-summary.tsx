import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors } from "@/theme";
import { useCallback, useContext, useRef, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import AddressList from "./addresslist";
import { ACTIONS } from "@/store/Actions";
import { BottomSheetModal} from "@gorhom/bottom-sheet";
import { PostRequest } from "@/utils/requests";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { s } from "react-native-size-matters";
import TopNavigation from "../TopNavigation";
import DeliveryETA from "../bottomsheets/delivery-eta";


export default function MultipleSummary() {
  const { state, dispatch } = useContext(DataContext)
  const { multipleData, user} = state
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const deliverySheetRef = useRef<BottomSheetModal>(null);


  // view details
  const viewDetails = (item: any) => {
    dispatch({ type: ACTIONS.ORDER_DATA, payload: item })
    router.push("/(app)/(tabs)/ship/summary")
  }

  const createOrder = async () => {
    setLoading(true)

    const payload = {
      shippings: multipleData
    }


    dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "multi" })

    const res = await PostRequest("/shipping/multiple", payload, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      // check for 360 users
      if (user?.subscription) {
        router.replace('/(app)/(tabs)/ship/success');
      }
      else {
        const myshipping = {
          shippingModePrices:{
            express: res.data.data.totalShipmentModePrices.express,
            standard: res.data.data.totalShipmentModePrices.standard          }
        }
        console.log("my multiple shipping ID", res.data.data.id)
        dispatch({ type: ACTIONS.SHIPPING_ID, payload: res?.data?.data?.id })
        dispatch({ type: ACTIONS.SHIPPING, payload: myshipping })
        // open the delivery ETA
        deliverySheetRef.current?.present();

      }
      
    }

    setLoading(false)
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
      id: "",
      pickupTime:"",
      pickupDate:"",
      scheduledPickupTime:""
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
    router.push("/(app)/(tabs)/ship/package-locations");
  }

  // 

  return (
    <View style={{ flex: 1 }}>
      <TopNavigation title="Multiple Summary" arrow={false} />

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
        <View style={{}}>
          <Image
            source={require("@/assets/images/logistics-bus.png")}
            style={{
              width: 160,
              height: 160,
              alignSelf: "center",
            }}
          />

          <Text style={{ textAlign: "center", fontSize: s(14), color: "#636363" }}>
            All shipments removed
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/ship/package-locations")}
            style={{ width: 200, height: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', margin: 'auto', marginTop: 10, borderRadius: 25 }}>
            <Text style={{ color: 'white' }}>Go Back</Text>
          </TouchableOpacity>
        </View>}
      </ScrollView>



      {multipleData?.length !== 0 &&
        <View style={styles.footerContainer}>

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


          <Button
            onPress={createOrder}
            disabled={loading || multipleData?.length === 0}
          >
            <ButtonText>Complete shipments</ButtonText>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="bicycle-outline" size={24} color="white" />
            )}
          </Button>
        </View>}

      {/* delivery ETA */}
      <DeliveryETA
        ref={deliverySheetRef}
        closeModal={() => deliverySheetRef.current?.close()}
      />
    </View>
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
    paddingVertical: 20,
    backgroundColor: "#fff",
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%'
  },
});
