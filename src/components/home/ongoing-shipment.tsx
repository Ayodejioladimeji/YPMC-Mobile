import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  AppState
} from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/theme";
import { useContext, useEffect, useRef, useState } from "react";
import { GetRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { s } from "react-native-size-matters";
import StatusComponent from "../status";
import { TouchableOpacity } from "react-native";
import ShipmentIcon from "../shipment-icon";
import moment from "moment";
import { ACTIONS } from "@/store/Actions";

const { width } = Dimensions.get("window");

export default function OngoingShipment() {
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext)
  const [shipment, setShipment] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [id, setId] = useState("")
  const appState = useRef(AppState.currentState);
  const [refreshLoading, setRefreshLoading] = useState(false)

  // get ongoing shipment
  useEffect(() => {
    if (state?.token) {
      getPendingOrders()
    }
  }, [state?.token, state?.callback])

  const getPendingOrders = async () => {
    const res = await GetRequest("/shipping/customer?statusCategory=PENDING", state?.token)
    if (res?.status === 200 || res?.status === 201) {
      const result = res.data.data?.filter((ship: any) => ship?.shipping?.riderAssignmentStatus === "ACCEPTED" || ship?.shipping?.riderAssignmentStatus === "FULLY_ACCEPTED")
      setShipment(result)
      console.log(result)
    }
    setLoading(false)
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        getPendingOrders()
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // set orderData
  const setData = (order: any) => {
    const payload = {
      dropoffLatitude: parseFloat(order?.dropoffLatitude),
      dropoffLongitude: parseFloat(order?.dropoffLongitude),
      dropoffState: order?.dropoffState,
      dropoffStreet: order?.dropoffStreet,
      pickupLatitude: parseFloat(order?.pickupLatitude),
      pickupLongitude: parseFloat(order?.pickupLongitude),
      pickupState: order?.pickupState,
      pickupStreet: order?.pickupStreet,
    }

    dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state?.orderData, ...payload } })
  }

  const setMultipleData = (orders: any) => {
    const shipping = orders?.shippings?.[0];

    const payload = {
      dropoffLatitude: parseFloat(shipping?.dropoffLatitude ?? "0"),
      dropoffLongitude: parseFloat(shipping?.dropoffLongitude ?? "0"),
      dropoffState: shipping?.dropoffState ?? "",
      dropoffStreet: shipping?.dropoffStreet ?? "",
      pickupLatitude: parseFloat(shipping?.pickupLatitude ?? "0"),
      pickupLongitude: parseFloat(shipping?.pickupLongitude ?? "0"),
      pickupState: shipping?.pickupState ?? "",
      pickupStreet: shipping?.pickupStreet ?? "",
    };

    dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state?.orderData, ...payload } })
  }

const handleRefresh = async() => {
  setRefreshLoading(true)

  await getPendingOrders()

  setRefreshLoading(false)
}

  // handle route
  const handleRoute = async (order: any) => {
    setButtonLoading(true)
    setId(order?.shipping?.id)
    dispatch({ type: ACTIONS.GENERAL_CALLBACK, payload: !state?.generalCallback })

    if (order?.type === "individual") {
      setData(order?.shipping)
      dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "basic" })
      dispatch({ type: ACTIONS.SHIPPING, payload: order?.shipping })
      dispatch({ type: ACTIONS.SHIPPING_ID, payload: order?.shipping?.id })
    }
    else {
      setMultipleData(order?.shipping)
      dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "multi" })
      dispatch({ type: ACTIONS.SHIPPING, payload: order?.shipping })
      dispatch({ type: ACTIONS.SHIPPING_ID, payload: order?.shipping?.id })
    }

    setTimeout(() => {
      router.push("/(app)/(tabs)/ship/rider-request")
      setButtonLoading(false)
    }, 2000)
  }

  if (!shipment || shipment?.length === 0) return null

  return (
    <View style={{ marginTop: 30 }}>
       <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems:'center'
              }}
            >
              <Text style={styles.sectionTitle}>Ongoing Shipment</Text>
      
              <Pressable
                onPress={handleRefresh}
                style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight:600
                  }}
                >
                  Refresh
                </Text>
               {refreshLoading && <ActivityIndicator/>}
              </Pressable>
            </View>

      <BottomSheetScrollView
        horizontal
        contentContainerStyle={{ gap: 20 }}
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        {shipment?.map((item: any) => {
          const shipping: any = item?.shipping

          return (
            <TouchableOpacity
              style={{
                paddingVertical: 22,
                paddingHorizontal: 10,
                backgroundColor: "#F3F3F380",
                borderWidth: 1,
                borderColor: "#6363631A",
                borderRadius: 20,
                gap: 10,
                width: 200,
                overflow: 'hidden'
              }}
              onPress={() => handleRoute(item)}
              key={shipping?.id}
            >
              {item?.type === "multi" &&
                <View
                  style={{
                    backgroundColor: colors.primary, padding: 5, paddingHorizontal: 8, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
                  }}>
                  <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
                </View>}

              <View>
                <ShipmentIcon status={item?.type === "individual" ? shipping?.status : shipping?.shippings[0].status} type={item?.type === "individual" ? shipping?.scheduleType : shipping?.shippings[0].scheduleType} />

                <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
                  numberOfLines={1}
                  ellipsizeMode="tail" >
                  {item?.type === "individual" ? shipping?.packageDetails?.name : shipping?.shippings[0].packageDetails?.name}
                </Text>

                <Text style={{ color: colors.mutedForeground, fontSize: s(10), marginTop: 10 }}>{moment(item?.type === "individual" ? shipping?.createdAt : shipping?.shippings[0].createdAt).format("LT")}</Text>
              </View>

              <View
                // onPress={() => handleRoute(item)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={{ fontSize: s(12), color: "#F97216", textDecorationLine: 'underline' }}>Make payment</Text>
                {shipping?.id === id && buttonLoading && <ActivityIndicator color={colors.primary} />}
              </View>
            </TouchableOpacity >
          )
        })}
      </BottomSheetScrollView>
    </View>
  );

}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 500,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 20,
    padding: 20,
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  actionIconContainer: {
    backgroundColor: "white",
    borderRadius: 9999,
    padding: 5,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  shipmentOverviewIcon: {
    // backgroundColor: "#4FB94833",
    borderRadius: 9999,
    padding: 5,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
