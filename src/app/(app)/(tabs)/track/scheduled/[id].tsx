import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { DataContext } from "@/store/GlobalState";
import { GetRequest, PostRequest } from "@/utils/requests";
import AddressList from "@/components/track/addresslist";
import { colors } from "@/theme";
import { s } from "react-native-size-matters";
import { formatMoney } from "@/utils/utils";
import ShipmentIcon from "@/components/shipment-icon";
import StatusComponent from "@/components/status";
import { ACTIONS } from "@/store/Actions";
import TopNavigation from "@/components/TopNavigation";
import moment from "moment";

// Helper for aspect ratio

export default function ShippingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const { state, dispatch } = useContext(DataContext)
  const [order, setOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any>([])
  const [rider, setRider] = useState<any>(null)
  const [buttonLoading, setButtonLoading] = useState(false)

  const timelineSheetRef = useRef<BottomSheetModal>(null);
  const [callback, setCallback] = useState(false)

  const { width } = useWindowDimensions();
  const HORIZONTAL_PADDING = 20;
  const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
  const COLUMN_GAP = 10;
  const boxWidth = (AVAILABLE_WIDTH - COLUMN_GAP) / 2;


  useEffect(() => {
    if (state?.token && id) {
      const getPendingOrders = async () => {
        const res = await GetRequest(`/shipping/customer/${id}`, state?.token)

        if (res?.status === 200 || res?.status === 201) {
          setOrder(res?.data?.data)
          setRider(res?.data?.data?.rider || res?.data?.data?.proposedRider)
          dispatch({ type: ACTIONS.RIDER_DETAIL, payload: res?.data?.data?.rider || res?.data?.data?.proposedRider })
        }

        setLoading(false)
      }

      const getMultiPendingOrders = async () => {
        const res = await GetRequest(`/shipping/customer/multiple-shipping/${id}`, state?.token)

        if (res?.status === 200 || res?.status === 201) {
          setOrders(res?.data?.data?.multiShipping?.shippings)
          setRider(res?.data?.data?.multiShipping?.shippings[0]?.rider || res?.data?.data?.multiShipping?.shippings[0]?.proposedRider)
          dispatch({ type: ACTIONS.RIDER_DETAIL, payload: res?.data?.data?.multiShipping?.shippings[0]?.rider || res?.data?.data?.multiShipping?.shippings[0]?.proposedRider })
        }

        setLoading(false)
      }

      if (state?.shippingType === "individual") {
        getPendingOrders()
      }
      else {
        getMultiPendingOrders()
      }
    }
  }, [state?.token, id, state?.callback])


  const handleRoute = (id: string) => {
    router.push(`/(app)/(tabs)/track/${id}`)

  }

  // 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <TopNavigation title="Scheduled shipping" />

      <View style={{ flex: 1, position: 'relative' }}>

        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 15, paddingTop: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

          {loading ?
            <ActivityIndicator color="#F97216" style={{ marginTop: 40 }} />
            :
            <>
              {state?.shippingType === "individual" ?
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
                :
                <View style={styles.grid}>
                  {orders?.map((item: any, index: number) => {

                    return (
                      <TouchableOpacity activeOpacity={0.7}
                        style={{
                          paddingVertical: 22,
                          paddingHorizontal: 10,
                          backgroundColor: "#F3F3F380",
                          borderWidth: 1,
                          borderColor: "#6363631A",
                          borderRadius: 20,
                          gap: 30,
                          width: boxWidth,
                          overflow: 'hidden'
                        }}
                        key={index}
                        onPress={() => handleRoute(item?.id)}
                      >

                        <View>
                          <ShipmentIcon status={item?.status} />

                          <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
                            numberOfLines={1}
                            ellipsizeMode="tail" >
                            {item.packageDetails.name}
                          </Text>


                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 4,
                              marginBottom: 5
                            }}
                          >
                            <Ionicons name="bicycle-outline" size={16} color="#636363" />
                            <StatusComponent status={item?.status} />

                          </View> 

                          <Text style={{ color: colors.mutedForeground, fontSize: s(10) }}>{moment(item?.scheduledPickupTime).format('ll')}</Text>
                        </View>

                        <View style={{ gap: 4 }}>


                          <TouchableOpacity
                            onPress={() => handleRoute(item.id)}
                          >
                            <Text style={{ fontSize: s(12), color: "#F97216" }}>View details</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity >
                    )
                  })}
                </View>
              }

            </>}

        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#636363",
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    paddingBottom: 20,
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
