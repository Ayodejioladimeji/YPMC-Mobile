import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
// import { SvgXml } from "react-native-svg";
// import { verificationBadge } from "@/assets/svgs/track";
// import { Avatar } from "../Avatar";
import { router } from "expo-router";
import { Image } from "expo-image";

// import { images } from "@/constants";
import { Rider } from "@/api/shipping";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import images from "@/assets/images";
import { BadgeIcon, GoldBadgeIcon } from "@/assets/images/svgs";
import { PostRequest } from "@/utils/requests";
import { useContext, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import { ACTIONS } from "@/store/Actions";
import { formatMoney } from "@/utils/utils";
import { colors } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RiderCard({
  rider,
  carouselView,
  openSheet,
  setRiderId
}: {
  rider: Rider;
  carouselView: boolean;
  openSheet: any,
  setRiderId: any
}) {
  const { state, dispatch } = useContext(DataContext)
  const [loading, setLoading] = useState(false)



  // assign order to rider
  const handleAssign = async () => {
    setLoading(true)

    let res: any

    if (state?.shippingType === "basic") {
      res = await PostRequest(`/shipping/${state?.shippingId}/assign-rider/${rider?.id}`, { data: "" }, state?.token)
    }
    else {
      res = await PostRequest(`/shipping/${state?.shippingId}/assign-rider-multiple/${rider?.id}`, {}, state?.token)
    }

    if (res?.status === 200 || res?.status === 201) {
      dispatch({ type: ACTIONS.PROPOSED_RIDER, payload: res?.data?.data?.proposedRider })
      dispatch({ type: ACTIONS.SHIPPING, payload: res?.data?.data })

      router.push("/(app)/(tabs)/ship/rider-request")
      toast.success(res?.data?.message)

    }


    setLoading(false)
  }

  const handleView = (id: string) => {
    setRiderId(id)
    openSheet()
    dispatch({ type: ACTIONS.RATE_LOADING, payload: true })
    dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback })
  }


  // 
  return (
    <>
      {carouselView ?
        <View
          style={[
            {
              marginTop: 10,
              backgroundColor: rider?.picture ? "rgba(0, 0, 0, 0.7)" : "black",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#6363631A",
              overflow: 'hidden'
            },
            carouselView ? styles.carouselItem : styles.listItem,
          ]}
        >

          <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
            {rider?.picture ? <Image source={{ uri: rider?.picture }} alt="" style={{ height: "100%", width: "100%", resizeMode: 'cover' }} />
              :
              <Image source={images?.user} alt="" style={{ height: 150, width: 150 }} />}

          {rider?.proximity === "Nearby" &&  <View style={{ position: 'absolute', top: 10, right: 8, backgroundColor: '#FFF9EF', borderRadius: 25, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: colors.primary }}>
              <Ionicons name="location" size={16} style={{ color: colors.primary }} />
              <Text style={{ color: colors.primary, fontFamily: 'interSemiBold' }}>{rider?.proximity}</Text>
            </View>}
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 10, backgroundColor: 'black', }}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,

                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "interSemiBold",
                    color: "#fff",
                  }}
                >
                  {rider.firstName} {rider.lastName}
                </Text>

                {rider?.lastName?.includes("Support") ? <GoldBadgeIcon /> :
                  <BadgeIcon />}

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
                  <Text style={{ fontSize: 12, color: "#fff" }}>
                    {rider.averageRating}
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: "#fff" }}>
                {rider.partnerCompany || "YPMC Logistics"}
              </Text>
            </View>

            <View
              style={[
                {
                  marginTop: 32,
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                carouselView
                  ? { flexDirection: "column", alignItems: "flex-start", gap: 16 }
                  : null,
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name="location" size={16} style={{ color: "white" }} />

                <Text style={{ fontSize: 13, color: "#fff" }}>
                  {rider?.proximity}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "interSemiBold",
                  color: "#fff",
                }}
              >
                N{formatMoney(rider.actualPrice || rider?.totalActualPrice || 0)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 20, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: 'black' }}>
            <Button
              size="sm"
              style={{
                flex: 1,
                backgroundColor: "transparent",
                borderColor: "#fff",
              }}
              variant="outline"
              onPress={() => handleView(rider?.id)}
            >
              <ButtonText style={{ color: "#fff" }}>Ratings</ButtonText>
              <Ionicons name="star" size={20} style={{ color: "#fff" }} />
            </Button>

            <Button
              size="sm"
              style={{ flex: 1 }}
              onPress={handleAssign}
            >
              <ButtonText>Assign</ButtonText>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark" size={24} style={{ color: "#fff" }} />}
            </Button>
          </View>
        </View>
        :
        <View
          style={[
            {
              // paddingTop: 20,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#6363631A",
              overflow: 'hidden',
              // flex:1
            },
            styles.listItem,
          ]}
        >

          <View style={{ paddingHorizontal: 16, paddingTop: 35, backgroundColor: 'black' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
              {rider?.picture ? <Image source={{ uri: rider?.picture }} alt="" style={{ height: 50, width: 50, borderRadius: 50, marginTop: 10 }} />
                :
                <Image source={images?.user} alt="" style={{ height: 50, width: 50 }} />}

              {rider?.proximity === "Nearby" && <View style={{ position: 'absolute', top: -25, right: -10, backgroundColor: '#FFF9EF', borderRadius: 25, paddingHorizontal: 8, paddingVertical:5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: colors.primary }}>
                <Ionicons name="location" size={16} style={{ color: colors.primary }} />
                <Text style={{ color: colors.primary, fontFamily: 'interSemiBold' }}>{rider?.proximity}</Text>
              </View>}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,

                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "interSemiBold",
                      color: "#fff",
                    }}
                  >
                    {rider.firstName} {rider.lastName}
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
                    <Text style={{ fontSize: 12, color: "#fff" }}>
                      {rider.averageRating}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: "#fff" }}>
                  {rider.partnerCompany || "YPMC Logistics"}
                </Text>
              </View>
            </View>

            <View
              style={[
                {
                  marginTop: 32,
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                carouselView
                  ? { flexDirection: "column", alignItems: "flex-start", gap: 16 }
                  : null,
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name="location" size={18} style={{ color: "white" }} />

                <Text style={{ fontSize: 13, color: "#fff" }}>
                  {rider?.proximity}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "interSemiBold",
                  color: "#fff",
                }}
              >
                N{formatMoney(rider.actualPrice || rider?.totalActualPrice || 0)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 20, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: 'black' }}>
            <Button
              size="sm"
              style={{
                flex: 1,
                backgroundColor: "transparent",
                borderColor: "#fff",
              }}
              variant="outline"
              onPress={() => handleView(rider?.id)}
            >
              <ButtonText style={{ color: "#fff" }}>Ratings</ButtonText>
              <Ionicons name="star" size={24} style={{ color: "#fff" }} />
            </Button>

            <Button
              size="sm"
              style={{ flex: 1 }}
              onPress={handleAssign}
            >
              <ButtonText>Accept</ButtonText>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={24} style={{ color: "#fff" }} />}
            </Button>
          </View>
        </View>}

    </>
  );
}

const styles = StyleSheet.create({
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
  carouselItem: {
    width: SCREEN_WIDTH * 0.75,
    marginHorizontal: 10,
  },
  listItem: {
    width: "100%",
    // height: 100,
    marginVertical: 8,
  },
});
