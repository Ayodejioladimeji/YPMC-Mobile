import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  Text
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/theme";
import { useContext, useEffect, useState } from "react";
import { GetRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { s } from "react-native-size-matters";

const { width } = Dimensions.get("window");

export default function ShipmentOverview() {
  const router = useRouter();
  const { state } = useContext(DataContext)
  const [shipment, setShipment] = useState<any>([])
  const [loading, setLoading] = useState(true)

  // get shipment overview
  useEffect(() => {
    const getShipment = async () => {
      const res = await GetRequest("/shipping/customer/dashboard", state?.token)
      if (res?.status === 200 || res?.status === 201) {
        setShipment(res?.data?.data)
      }
      setLoading(false)
    }
    getShipment()
  }, [state?.callback])


  return (
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems:'center'
        }}
      >
        <Text style={styles.sectionTitle}>Shipment Overview</Text>

        <Pressable
          onPress={() => {
            router.push("/(app)/(tabs)/track");
          }}
          style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight:600
            }}
          >
            See all
          </Text>
          <MaterialIcons name="arrow-right-alt" size={24} color="#F97216" />
        </Pressable>
      </View>

      <BottomSheetScrollView
        horizontal
        contentContainerStyle={{ gap: 10 }}
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, marginBottom: 20 }}
      >
        <Pressable
          onPress={() => router.push({ pathname: "/(app)/(tabs)/track", params: { initialTab: "active" } })}
          style={[
            styles.actionButton,
            {
              width: width / 2,
              paddingVertical: 40,
              justifyContent: "center",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#6363631A",
            },
          ]}
        >
          <View
            style={[
              { backgroundColor: "#1E83C533" },
              styles.shipmentOverviewIcon,
            ]}
          >
            <Image
              source={require("@/assets/images/shipment-active.png")}
              style={{ width: 27, height: 27 }}
            />
          </View>

          <Text style={{ fontSize: 16, fontWeight:600 }}>
            {shipment?.active || 0}
          </Text>

          <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 5,
              backgroundColor: "#1E83C533",
              borderRadius: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.info,
                fontSize: s(11),
                fontWeight:600
              }}
            >
              Active Shipments
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: "/track", params: { initialTab: "pending" } })}
          style={[
            styles.actionButton,
            {
              width: width / 2,
              paddingVertical: 40,
              justifyContent: "center",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#6363631A",
            },
          ]}
        >
          <View
            style={[
              { backgroundColor: "#F9721633" },
              styles.shipmentOverviewIcon,
            ]}
          >
            <Image
              source={require("@/assets/images/shipment-pending.png")}
              style={{ width: 27, height: 27 }}
            />
          </View>

          <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>
            {shipment?.pending || 0}
          </Text>

          <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 5,
              backgroundColor: "#F972161A",
              borderRadius: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: s(11),
                fontWeight:600
              }}
            >
              Pending Shipments
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: "/track", params: { initialTab: "completed" } })}
          style={[
            styles.actionButton,
            {
              width: width / 2,
              paddingVertical: 40,
              justifyContent: "center",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#6363631A",
            },
          ]}
        >
          <View
            style={[
              { backgroundColor: "#4FB94833" },
              styles.shipmentOverviewIcon,
            ]}
          >
            <Image
              source={require("@/assets/images/shipment-complete.png")}
              style={{ width: 27, height: 27 }}
            />
          </View>

          <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>
            {shipment?.completed || 0}
          </Text>

          <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 5,
              backgroundColor: "#4FB9481A",
              borderRadius: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#4FB948",
                fontSize: s(11),
                fontWeight:600
              }}
            >
              Completed Shipments
            </Text>
          </View>
        </Pressable>
      </BottomSheetScrollView>
    </View>
  );

}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight:500,
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
