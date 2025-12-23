import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ShipmentItem from "@/components/track/shipment-item";
import TrackEmptyState from "@/components/track/track-empty-state";
import Input from "@/components/ui/input";
import Text from "@/components/ui/text";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { GetRequest } from "@/utils/requests";
import TrackInput from "./trackInput";
import PendingShipmentItem from "./pending-shipment-item";
import ScheduledShipmentItem from "./scheduled-shipment-item";


export default function ScheduledTab() {
  const [scheduledOrders, setScheduledOrders] = useState<any>([])
  const { state } = useContext(DataContext)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (state?.token) {
      getPendingOrders()
    }
  }, [state?.token])

  const getPendingOrders = async () => {
    const res = await GetRequest("/shipping/customer?statusCategory=SCHEDULED&limit=50", state?.token)
    if (res?.status === 200 || res?.status === 201) {
      setScheduledOrders(res?.data?.data)
    }
    setLoading(false)
  }

  // on refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    getPendingOrders()

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
        <View style={{flex:1, marginTop: 10}}>
          <FlatList
            contentContainerStyle={styles.grid}
            data={scheduledOrders}
            keyExtractor={(item) => item.shipping.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <ScheduledShipmentItem shipment={item} />}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    paddingBottom: 20,
  },
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
