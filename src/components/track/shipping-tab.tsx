import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ShipmentItem from "@/components/track/shipment-item";
import TrackEmptyState from "@/components/track/track-empty-state";
import Input from "@/components/ui/input";
import Text from "@/components/ui/text";
import { GetRequest } from "@/utils/requests";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import TrackInput from "./trackInput";
import ShipmentHistory from "./shipment-history";

export default function ShippingTab() {
  const [shippingOrders, setShippingOrders] = useState<any>([])
  const { state } = useContext(DataContext)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false);

  const getShipmentOrders = async () => {
    const res = await GetRequest("/shipping/customer?statusCategory=DELIVERED&limit=100", state?.token)
    if (res?.status === 200 || res?.status === 201) {

      setShippingOrders(res?.data?.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (state?.token) {
      getShipmentOrders()
    }
  }, [state?.token, state?.message])


  // on refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    getShipmentOrders()

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshing]);

  // 

  return (
    <View style={styles.container}>
      <TrackInput />

      {loading ? <ActivityIndicator color="#F97216" style={{ marginTop: 40 }} />
        :
        <View style={{flex:1, marginTop: 10 }}>

          <FlatList
            data={shippingOrders}
            keyExtractor={(item) => item.shipping.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <ShipmentHistory shipment={item} />}
            ListEmptyComponent={TrackEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    padding: 5,
    borderRadius: 20,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 8,
    backgroundColor: "#F97216",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#fff", fontSize: 14 },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  tabsHeader: {
    fontFamily: "interMedium",
    fontSize: 12,
  },
});
